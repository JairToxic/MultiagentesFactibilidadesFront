// services/statisticsService.js
import api from './api';

class StatisticsService {
  // Estadísticas generales
  async getOverview(params = {}) {
    const response = await api.get('/statistics/overview', { params });
    return response.data;
  }

  // Estadísticas por usuario (soporta múltiples asignados)
  async getStatisticsByUser(params = {}) {
    const response = await api.get('/statistics/by-user', { params });
    return response.data;
  }

  // Estadísticas de tiempo trabajado
  async getTimeTrackingStats(params = {}) {
    const response = await api.get('/statistics/time-tracking', { params });
    return response.data;
  }

  // ✅ NUEVO: Métricas de satisfacción
  async getSatisfactionMetrics(params = {}) {
    const response = await api.get('/satisfaction/metrics', { params });
    return response.data;
  }

  // ✅ NUEVO: Embudo de conversión
  async getTicketFunnel(params = {}) {
    const response = await api.get('/statistics/funnel', { params });
    return response.data;
  }

  // ✅ NUEVO: Cumplimiento de SLA
  async getSLACompliance(params = {}) {
    const response = await api.get('/statistics/sla-compliance', { params });
    return response.data;
  }

  // ✅ NUEVO: Tendencias en el tiempo
  async getTrends(params = {}) {
    const response = await api.get('/statistics/trends', { params });
    return response.data;
  }
}

export default new StatisticsService();