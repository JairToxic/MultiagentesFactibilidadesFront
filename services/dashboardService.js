// services/dashboardService.js
import api from './api';

class DashboardService {
  async getStats() {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      // Si el endpoint no existe aún, calculamos stats del lado del cliente
      console.warn('Stats endpoint not available, calculating client-side');
      return null;
    }
  }

  calculateStats(tickets) {
    const total = tickets.length;
    const byStatus = this.groupBy(tickets, 'status');
    const byPriority = this.groupBy(tickets, t => t.classification?.priority);
    const byProduct = this.groupBy(tickets, t => t.classification?.product);
    const assigned = tickets.filter(t => t.assignment?.assigned).length;

    // Tickets por día (últimos 7 días)
    const last7Days = this.getLast7Days();
    const ticketsByDay = last7Days.map(date => {
      const count = tickets.filter(t => {
        const ticketDate = new Date(t.created_at).toDateString();
        return ticketDate === date.toDateString();
      }).length;
      return {
        date: date.toLocaleDateString('es-EC', { weekday: 'short', day: 'numeric' }),
        count,
      };
    });

    // Tiempo promedio de respuesta (si existe el campo)
    const avgResponseTime = this.calculateAvgResponseTime(tickets);

    return {
      total,
      nuevo: byStatus.nuevo || 0,
      en_progreso: byStatus.en_progreso || 0,
      resuelto: byStatus.resuelto || 0,
      cerrado: byStatus.cerrado || 0,
      assigned,
      byPriority,
      byProduct,
      ticketsByDay,
      avgResponseTime,
    };
  }

  groupBy(array, keyFn) {
    return array.reduce((acc, item) => {
      const key = typeof keyFn === 'function' ? keyFn(item) : item[keyFn];
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date);
    }
    return days;
  }

  calculateAvgResponseTime(tickets) {
    const ticketsWithResponse = tickets.filter(t => 
      t.messages && t.messages.length > 1
    );

    if (ticketsWithResponse.length === 0) return 0;

    const totalMinutes = ticketsWithResponse.reduce((sum, ticket) => {
      const firstInbound = ticket.messages.find(m => m.direction === 'inbound');
      const firstOutbound = ticket.messages.find(m => m.direction === 'outbound');
      
      if (firstInbound && firstOutbound) {
        const inboundTime = new Date(firstInbound.received_at || firstInbound.sent_at);
        const outboundTime = new Date(firstOutbound.sent_at || firstOutbound.received_at);
        const diffMinutes = (outboundTime - inboundTime) / 60000;
        return sum + diffMinutes;
      }
      return sum;
    }, 0);

    return Math.round(totalMinutes / ticketsWithResponse.length);
  }
}

export default new DashboardService();