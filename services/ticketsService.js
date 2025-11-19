// services/ticketService.js

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class TicketService {
  async getAllTickets() {
    try {
      const response = await fetch(`${API_BASE_URL}/tickets`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw error;
    }
  }

  async getTicketById(ticketId) {
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching ticket ${ticketId}:`, error);
      throw error;
    }
  }

  /**
   * Envía una respuesta a un ticket.
   * - ticketId: ID del ticket (TKT-...)
   * - message: texto que quieres enviar al cliente
   * - messageId (opcional): ID del mensaje al que quieres responder
   * - userAccessToken (opcional): token de Graph del usuario logueado
   * - userEmail (opcional): email del usuario logueado
   */
  async replyToTicket(
    ticketId,
    message,
    messageId = null,
    userAccessToken = null,
    userEmail = null
  ) {
    try {
      const payload = {
        message,
      };

      if (messageId) {
        payload.message_id = messageId;
      }

      if (userAccessToken) {
        payload.user_access_token = userAccessToken;
      }

      if (userEmail) {
        payload.user_email = userEmail;
      }

      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error replying to ticket ${ticketId}:`, error);
      throw error;
    }
  }

  // Polling automático para nuevos tickets
  startPolling(callback, interval = 5000) {
    const pollInterval = setInterval(async () => {
      try {
        const data = await this.getAllTickets();
        callback(data);
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, interval);

    return () => clearInterval(pollInterval);
  }

  // Utilidades
  formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-EC', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  getPriorityColor(priority) {
    const colors = {
      'Baja': '#22c55e',
      'Media': '#f59e0b',
      'Alta': '#ef4444',
      'Critica': '#dc2626',
    };
    return colors[priority] || '#6b7280';
  }

  getProductIcon(product) {
    const icons = {
      'Teams': '💬',
      'Exchange': '📧',
      'SharePoint': '📁',
      'Azure': '☁️',
      'M365': '🏢',
      'Otro': '🔧',
    };
    return icons[product] || '🔧';
  }
    getCategoryIcon(category) {
    const icons = {
      'Incidente': '🚨',
      'Solicitud': '📝',
      'Consulta': '❓',
      'Cambio': '🔁',
      'Otro': '📌',
    };

    return icons[category] || '📌';
  }

}

export default new TicketService();
