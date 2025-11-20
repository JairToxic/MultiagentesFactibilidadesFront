// services/timeTrackingService.js
import api from './api';

class TimeTrackingService {
  // Registrar tiempo trabajado
  async logTime(data) {
    const response = await api.post('/time-tracking', data);
    return response.data;
  }

  // Listar registros de tiempo
  async getTimeEntries(params = {}) {
    const response = await api.get('/time-tracking', { params });
    return response.data;
  }

  // Actualizar registro
  async updateTimeEntry(entryId, data) {
    const response = await api.patch(`/time-tracking/${entryId}`, data);
    return response.data;
  }

  // Eliminar registro
  async deleteTimeEntry(entryId) {
    const response = await api.delete(`/time-tracking/${entryId}`);
    return response.data;
  }

  // Helpers
  formatMinutes(minutes) {
    if (!minutes) return '0m';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  calculateTotalTime(entries) {
    if (!entries || !Array.isArray(entries)) return 0;
    return entries.reduce((total, entry) => total + (entry.minutes_spent || 0), 0);
  }
}

export default new TimeTrackingService();

