// services/ticketsService.js
import api from './api';

class TicketsService {
  // ==================== GET ====================

  async getAllTickets() {
    const response = await api.get('/tickets');
    return response.data;
  }

  async getTicketById(ticketId) {
    const response = await api.get(`/tickets/${ticketId}`);
    return response.data;
  }

  // ==================== POST / PATCH ====================

  async replyToTicket(ticketId, message, messageId = null, userAccessToken = null, userEmail = null) {
    const response = await api.post(`/tickets/${ticketId}/reply`, {
      message,
      message_id: messageId,
      user_access_token: userAccessToken,
      user_email: userEmail,
    });
    return response.data;
  }

  async updateTicketStatus(ticketId, newStatus, changedBy = 'system') {
    const response = await api.patch(`/tickets/${ticketId}/status`, {
      status: newStatus,
      changed_by: changedBy,
    });
    return response.data;
  }

  // ==================== ASIGNACIÓN DE TÉCNICOS ====================

  async assignTechnician(ticketId, technicianId, changedBy = 'system') {
    // Si technicianId es null, enviamos null explícitamente para desasignar
    const payload = {
      changed_by: changedBy,
    };
    
    // Solo agregar technician_id si no es null (para permitir desasignar)
    if (technicianId !== null && technicianId !== undefined) {
      payload.technician_id = technicianId;
    } else {
      payload.technician_id = null; // Explícitamente null para desasignar
    }
    
    const response = await api.patch(`/tickets/${ticketId}/assign`, payload);
    return response.data;
  }

  async unassignTechnician(ticketId, technicianId, changedBy = 'system') {
    const response = await api.delete(`/tickets/${ticketId}/unassign/${technicianId}`, {
      data: { changed_by: changedBy }
    });
    return response.data;
  }

  async searchTechnicians(query = 'microsoft', top = 50) {
    const response = await api.get(`/search/test`, {
      params: { q: query, top },
    });
    return response.data.results || [];
  }

  // ==================== POLLING ====================

  startPolling(callback, interval = 5000) {
    const intervalId = setInterval(async () => {
      try {
        const data = await this.getAllTickets();
        callback(data);
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, interval);

    return () => clearInterval(intervalId);
  }

  // ==================== HELPERS ====================

  getPriorityColor(priority) {
    const colors = {
      Critica: '#dc2626',
      Alta: '#f97316',
      Media: '#eab308',
      Baja: '#10b981',
    };
    return colors[priority] || '#6b7280';
  }

  getStatusColor(status) {
    const colors = {
      nuevo: '#3b82f6',
      en_progreso: '#f59e0b',
      resuelto: '#10b981',
      cerrado: '#6b7280',
      pendiente: '#8b5cf6',
    };
    return colors[status] || '#6b7280';
  }

  getProductIcon(product) {
    const icons = {
      'Microsoft Teams': '👥',
      'Exchange Online': '📧',
      'SharePoint Online': '📁',
      'Azure': '☁️',
      'Microsoft 365': '📦',
      'Power Platform': '⚡',
      'Intune': '📱',
      'Windows': '🪟',
      'Otro': '🔧',
    };
    return icons[product] || '📋';
  }

  getCategoryIcon(category) {
    const icons = {
      'Incidente': '🔥',
      'Solicitud': '📝',
      'Consulta': '❓',
      'Cambio': '🔄',
      'Acceso y permisos': '🔐',
      'Error técnico': '⚠️',
      'Configuración': '⚙️',
      'Solicitud de cambio': '🔄',
      'Otro': '📌',
    };
    return icons[category] || '📋';
  }

  // ✅ ACTUALIZADO: formatDate para tarjetas (tiempo relativo)
  formatDate(dateString) {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;

    return date.toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // ✅ NUEVO: formatFullDate para timeline (fecha completa)
  formatFullDate(dateString) {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    
    return date.toLocaleString('es-EC', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  // ✅ NUEVO: formatCompactDate para timeline (fecha compacta pero completa)
  formatCompactDate(dateString) {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    
    return date.toLocaleString('es-EC', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // ==================== FILTRO Y ORDENAMIENTO ====================

  filterTickets(tickets, filters) {
    let filtered = [...tickets];

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter((t) => t.status === filters.status);
    }

    if (filters.priority && filters.priority !== 'all') {
      filtered = filtered.filter(
        (t) => t.classification?.priority === filters.priority
      );
    }

    if (filters.product && filters.product !== 'all') {
      filtered = filtered.filter(
        (t) => t.classification?.product === filters.product
      );
    }

    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(
        (t) => t.classification?.category === filters.category
      );
    }

    if (filters.technician && filters.technician !== 'all') {
      if (filters.technician === 'unassigned') {
        filtered = filtered.filter((t) => {
          const assignment = t.assignment_json || t.assignment;
          if (!assignment) return true;
          
          const technicians = assignment.technicians || [];
          const singleTech = assignment.technician;
          
          return !assignment.assigned || (technicians.length === 0 && !singleTech);
        });
      } else {
        filtered = filtered.filter((t) => {
          const assignment = t.assignment_json || t.assignment;
          if (!assignment) return false;
          
          const technicians = assignment.technicians || [];
          const singleTech = assignment.technician;
          
          if (technicians.length > 0) {
            return technicians.some(tech => tech.id === filters.technician);
          }
          
          return singleTech?.id === filters.technician;
        });
      }
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((t) => {
        const basicMatch = 
          t.ticket_id?.toLowerCase().includes(searchLower) ||
          t.email?.subject?.toLowerCase().includes(searchLower) ||
          t.email?.from?.toLowerCase().includes(searchLower) ||
          t.classification?.summary?.toLowerCase().includes(searchLower);
        
        if (basicMatch) return true;
        
        const assignment = t.assignment_json || t.assignment;
        if (!assignment) return false;
        
        const technicians = assignment.technicians || [];
        const singleTech = assignment.technician;
        
        if (technicians.length > 0) {
          return technicians.some(tech => 
            tech.name?.toLowerCase().includes(searchLower)
          );
        }
        
        return singleTech?.name?.toLowerCase().includes(searchLower);
      });
    }

    if (filters.sortBy) {
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case 'date_desc':
            return new Date(b.created_at) - new Date(a.created_at);
          case 'date_asc':
            return new Date(a.created_at) - new Date(b.created_at);
          case 'priority': {
            const priorityOrder = {
              Critica: 4,
              Alta: 3,
              Media: 2,
              Baja: 1,
            };
            return (
              (priorityOrder[b.classification?.priority] || 0) -
              (priorityOrder[a.classification?.priority] || 0)
            );
          }
          default:
            return 0;
        }
      });
    }

    return filtered;
  }

  // ==================== NORMALIZACIÓN DE DATOS ====================

  getTechniciansFromTicket(ticket) {
    if (!ticket) return [];

    const assignment = ticket.assignment_json || ticket.assignment;
    if (!assignment) return [];

    const technicians = assignment.technicians || [];
    if (technicians.length > 0) return technicians;

    if (assignment.technician) {
      return [assignment.technician];
    }

    return [];
  }

  isTicketAssigned(ticket) {
    const technicians = this.getTechniciansFromTicket(ticket);
    return technicians.length > 0;
  }

  getTechnicianNames(ticket) {
    const technicians = this.getTechniciansFromTicket(ticket);
    return technicians.map(t => t.name).join(', ');
  }
}

export default new TicketsService();