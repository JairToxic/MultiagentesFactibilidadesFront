// services/analyticsService.js
import statisticsService from './statisticsService';

const analyticsService = {
  // Nueva función para obtener estadísticas del backend
  async getBackendStatistics(params = {}) {
    try {
      const [overview, byUser, timeTracking] = await Promise.all([
        statisticsService.getOverview(params),
        statisticsService.getStatisticsByUser(params),
        statisticsService.getTimeTrackingStats(params),
      ]);

      return {
        overview,
        byUser: byUser.statistics || [],
        timeTracking,
      };
    } catch (error) {
      console.error('Error fetching backend statistics:', error);
      return {
        overview: null,
        byUser: [],
        timeTracking: null,
      };
    }
  },

  // Función original para cálculos en el frontend (mantener compatibilidad)
  calculateAnalytics(tickets = [], days = 7) {
    const now = new Date();
    const since = new Date();
    since.setDate(now.getDate() - days);

    // ===============================
    // 🔹 Filtrar por rango de fechas
    // ===============================
    const filtered = tickets.filter((t) => {
      if (!t.created_at) return false;
      const created = new Date(t.created_at);
      return created >= since;
    });

    // ===============================
    // 🔹 Métricas globales (performance)
    // ===============================
    const totalTickets = filtered.length;

    const resolvedTickets = filtered.filter(
      (t) => t.status === 'resuelto' || t.status === 'cerrado'
    );

    const resolutionRate =
      totalTickets > 0 ? (resolvedTickets.length / totalTickets) * 100 : 0;

    // promedio de horas para resolver (en todos los tickets resueltos)
    let allResolutionTimes = [];

    resolvedTickets.forEach((t) => {
      const created = t.created_at ? new Date(t.created_at) : null;

      // 👇 Fallback importante: si no hay resolved_at / closed_at, usamos updated_at
      const resolvedAt = t.resolved_at || t.closed_at || t.updated_at;
      const resolved = resolvedAt ? new Date(resolvedAt) : null;

      if (created && resolved) {
        const diffMs = resolved - created;
        const diffHours = diffMs / 3600000;
        if (!Number.isNaN(diffHours) && diffHours >= 0) {
          allResolutionTimes.push(diffHours);
        }
      }
    });

    const avgResolutionHours =
      allResolutionTimes.length > 0
        ? allResolutionTimes.reduce((a, b) => a + b, 0) /
          allResolutionTimes.length
        : 0;

    const performance = {
      totalTickets,
      resolvedTickets: resolvedTickets.length,
      resolutionRate,     // %
      avgResolutionHours, // número en horas
    };

    // ===============================
    // 🔹 Agrupar tickets por técnico
    // ===============================
    const techMap = new Map();

    filtered.forEach((t) => {
      let assignment = t.assignment_json || t.assignment;

      // Si viene como string, intentar parsear
      if (assignment && typeof assignment === 'string') {
        try {
          assignment = JSON.parse(assignment);
        } catch {
          assignment = null;
        }
      }

      // 👇 Soportamos ahora múltiples técnicos
      let technicians = [];

      if (assignment?.technicians && Array.isArray(assignment.technicians)) {
        technicians = assignment.technicians;
      } else if (assignment?.technician) {
        technicians = [assignment.technician];
      }

      if (!assignment?.assigned || technicians.length === 0) return;

      technicians.forEach((tech) => {
        if (!tech) return;

        const techId =
          tech.id ?? tech.user_id ?? tech.object_id ?? tech.technician_id;

        if (!techId) return;

        const key = String(techId);

        if (!techMap.has(key)) {
          techMap.set(key, {
            id: key,
            name: tech.name || 'Sin nombre',
            role: 'Técnico',
            assigned: 0,
            resolved: 0,
            resolutionTimes: [], // en horas
          });
        }

        const entry = techMap.get(key);
        entry.assigned += 1;

        // Consideramos resuelto si el ticket está en 'resuelto' o 'cerrado'
        if (t.status === 'resuelto' || t.status === 'cerrado') {
          entry.resolved += 1;

          const created = t.created_at ? new Date(t.created_at) : null;

          // 👇 Mismo fallback que arriba
          const resolvedAt = t.resolved_at || t.closed_at || t.updated_at;
          const resolved = resolvedAt ? new Date(resolvedAt) : null;

          if (created && resolved) {
            const diffMs = resolved - created;
            const diffHours = diffMs / 3600000;
            if (!Number.isNaN(diffHours) && diffHours >= 0) {
              entry.resolutionTimes.push(diffHours);
            }
          }
        }
      });
    });

    const technicians = Array.from(techMap.values()).map((t) => {
      const avgHours =
        t.resolutionTimes.length > 0
          ? t.resolutionTimes.reduce((a, b) => a + b, 0) /
            t.resolutionTimes.length
          : 0;

      const completionRate =
        t.assigned > 0 ? (t.resolved / t.assigned) * 100 : 0;

      // Score simple: ponderado por tasa de resolución y rapidez
      const normalizedTime = Math.min(avgHours / 24, 1); // peor si tarda más de 24h
      const score =
        completionRate * 0.7 +        // 70% tasa de resolución
        (1 - normalizedTime) * 30;    // 30% rapidez (menos horas, más score)

      return {
        id: t.id,
        name: t.name,
        role: t.role,
        assigned: t.assigned,
        resolved: t.resolved,
        avgResolutionHours: avgHours,
        avgTime: `${avgHours.toFixed(1)}h`,     // para mostrar fácil
        satisfaction: 0,                        // por ahora 0, luego lo llenas
        score: Math.round(score),
      };
    });

    // ===============================
    // 🔹 Volumen de tickets por día
    // ===============================
    const volumeByDayMap = new Map();
    filtered.forEach((t) => {
      if (!t.created_at) return;
      const d = new Date(t.created_at);
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      volumeByDayMap.set(key, (volumeByDayMap.get(key) || 0) + 1);
    });

    const volumeData = Array.from(volumeByDayMap.entries())
      .sort(([d1], [d2]) => (d1 < d2 ? -1 : 1))
      .map(([date, count]) => ({ date, count }));

    // Breakdown por categoría
    const categoryMap = new Map();
    filtered.forEach((t) => {
      const cat = t.classification?.category || 'Sin categoría';
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
    });
    const categoryData = {
      labels: Array.from(categoryMap.keys()),
      values: Array.from(categoryMap.values()),
    };

    // Breakdown por producto
    const productMap = new Map();
    filtered.forEach((t) => {
      const prod = t.classification?.product || 'Sin producto';
      productMap.set(prod, (productMap.get(prod) || 0) + 1);
    });
    const productData = {
      labels: Array.from(productMap.keys()),
      values: Array.from(productMap.values()),
    };

    // Datos de resolución por estado
    const statusMap = new Map();
    filtered.forEach((t) => {
      const st = t.status || 'sin_estado';
      statusMap.set(st, (statusMap.get(st) || 0) + 1);
    });
    const resolutionData = {
      labels: Array.from(statusMap.keys()),
      values: Array.from(statusMap.values()),
    };

    // Trend simple: creados vs resueltos por día
    const trendMap = new Map();
    filtered.forEach((t) => {
      if (!t.created_at) return;
      const createdKey = new Date(t.created_at).toISOString().slice(0, 10);
      if (!trendMap.has(createdKey)) {
        trendMap.set(createdKey, { date: createdKey, created: 0, resolved: 0 });
      }
      trendMap.get(createdKey).created += 1;

      if (t.status === 'resuelto' || t.status === 'cerrado') {
        const resolvedKey = (t.resolved_at || t.closed_at || t.updated_at)
          ? new Date(t.resolved_at || t.closed_at || t.updated_at)
              .toISOString()
              .slice(0, 10)
          : createdKey;
        if (!trendMap.has(resolvedKey)) {
          trendMap.set(resolvedKey, { date: resolvedKey, created: 0, resolved: 0 });
        }
        trendMap.get(resolvedKey).resolved += 1;
      }
    });

    const trendData = Array.from(trendMap.values()).sort((a, b) =>
      a.date < b.date ? -1 : 1
    );

    // Para ahora, responseTimeData lo podemos derivar del promedio global por día
    const responseTimeData = trendData.map((d) => ({
      date: d.date,
      avgResponseHours: avgResolutionHours,
    }));

    // ===============================
    // 🔚 Retornar todo junto
    // ===============================
    return {
      performance,
      responseTimeData,
      volumeData,
      categoryData,
      productData,
      resolutionData,
      trendData,
      technicians,
    };
  },
};

export default analyticsService;
