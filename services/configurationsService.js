// services/configurationsService.js
import api from './api';

class ConfigurationsService {
  // ==================== ESTADOS ====================
  
  async getStatuses() {
    const response = await api.get('/configurations/statuses');
    return response.data;
  }

  async createStatus(data) {
    const response = await api.post('/configurations/statuses', data);
    return response.data;
  }

  async updateStatus(statusId, data) {
    const response = await api.patch(`/configurations/statuses/${statusId}`, data);
    return response.data;
  }

  // ==================== CONFIGURACIONES ====================
  
  async getSettings(category = null) {
    const params = category ? { category } : {};
    const response = await api.get('/configurations/settings', { params });
    return response.data;
  }

  async createOrUpdateSetting(data) {
    const response = await api.post('/configurations/settings', data);
    return response.data;
  }

  // ==================== REGLAS AUTOMÁTICAS ====================
  
  async getAutoRules() {
    const response = await api.get('/configurations/auto-rules');
    return response.data;
  }

  async createAutoRule(data) {
    const response = await api.post('/configurations/auto-rules', data);
    return response.data;
  }

  // ==================== HELPERS ====================
  
  getSettingValue(settings, key, defaultValue = null) {
    if (!settings || !Array.isArray(settings)) return defaultValue;
    const setting = settings.find(s => s.key === key);
    if (!setting) return defaultValue;
    
    // Si el valor es un JSONB, puede venir como string o objeto
    if (typeof setting.value === 'string') {
      try {
        return JSON.parse(setting.value);
      } catch {
        return setting.value;
      }
    }
    return setting.value;
  }
}

export default new ConfigurationsService();

