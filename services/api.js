// services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // El servidor respondió con un error
      const message = error.response.data?.error || 'Error en el servidor';
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      return Promise.reject(new Error('No se pudo conectar con el servidor'));
    } else {
      // Error al configurar la petición
      return Promise.reject(new Error('Error al procesar la solicitud'));
    }
  }
);

export default api;