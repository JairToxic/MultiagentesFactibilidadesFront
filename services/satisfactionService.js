// services/satisfactionService.js
import api from './api';

class SatisfactionService {
  // Enviar respuesta de satisfacción
  async submitSatisfaction(data) {
    const response = await api.post('/satisfaction', data);
    return response.data;
  }

  // Listar respuestas de satisfacción
  async getSatisfactionResponses(params = {}) {
    const response = await api.get('/satisfaction', { params });
    return response.data;
  }

  // Obtener satisfacción de un ticket específico (por ID numérico)
  async getTicketSatisfaction(ticketId) {
    const response = await api.get(`/satisfaction/${ticketId}`);
    return response.data;
  }

  // ✅ NUEVO: Obtener satisfacción por ticket_key (para formulario público)
  async getSatisfactionByTicketKey(ticketKey) {
    const response = await api.get(`/satisfaction/by-ticket-key/${ticketKey}`);
    return response.data;
  }

  // ✅ NUEVO: Obtener métricas de satisfacción
  async getSatisfactionMetrics(params = {}) {
    const response = await api.get('/satisfaction/metrics', { params });
    return response.data;
  }

  // ✅ NUEVO: Obtener encuestas pendientes
  async getPendingSurveys() {
    const response = await api.get('/satisfaction/pending-surveys');
    return response.data;
  }

  // ✅ NUEVO: Reenviar encuesta
  async resendSurvey(ticketKey) {
    const response = await api.post(`/satisfaction/resend-survey/${ticketKey}`);
    return response.data;
  }

  // Helpers
  getRatingColor(rating) {
    const colors = {
      1: '#dc2626', // rojo
      2: '#f97316', // naranja
      3: '#eab308', // amarillo
      4: '#10b981', // verde claro
      5: '#059669', // verde oscuro
    };
    return colors[rating] || '#6b7280';
  }

  getRatingLabel(rating) {
    const labels = {
      1: 'Muy insatisfecho',
      2: 'Insatisfecho',
      3: 'Neutral',
      4: 'Satisfecho',
      5: 'Muy satisfecho',
    };
    return labels[rating] || 'Sin calificar';
  }

  getNPSLabel(score) {
    if (score >= 9) return 'Promotor';
    if (score >= 7) return 'Pasivo';
    return 'Detractor';
  }

  getNPSColor(score) {
    if (score >= 9) return '#10b981';
    if (score >= 7) return '#eab308';
    return '#dc2626';
  }
}

export default new SatisfactionService();