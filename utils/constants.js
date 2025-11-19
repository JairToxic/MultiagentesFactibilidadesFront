// utils/constants.js

export const TICKET_STATUSES = {
  NUEVO: 'nuevo',
  EN_PROGRESO: 'en_progreso',
  PENDIENTE: 'pendiente',
  RESUELTO: 'resuelto',
  CERRADO: 'cerrado',
};

export const PRIORITIES = {
  CRITICA: 'Critica',
  ALTA: 'Alta',
  MEDIA: 'Media',
  BAJA: 'Baja',
};

export const PRODUCTS = {
  TEAMS: 'Microsoft Teams',
  EXCHANGE: 'Exchange Online',
  SHAREPOINT: 'SharePoint Online',
  AZURE: 'Azure',
  M365: 'Microsoft 365',
  OTRO: 'Otro',
};

export const CATEGORIES = {
  INCIDENTE: 'Incidente',
  SOLICITUD: 'Solicitud',
  CONSULTA: 'Consulta',
  CAMBIO: 'Cambio',
  OTRO: 'Otro',
};

export const STATUS_COLORS = {
  [TICKET_STATUSES.NUEVO]: '#3b82f6',
  [TICKET_STATUSES.EN_PROGRESO]: '#f59e0b',
  [TICKET_STATUSES.PENDIENTE]: '#8b5cf6',
  [TICKET_STATUSES.RESUELTO]: '#10b981',
  [TICKET_STATUSES.CERRADO]: '#6b7280',
};

export const PRIORITY_COLORS = {
  [PRIORITIES.CRITICA]: '#dc2626',
  [PRIORITIES.ALTA]: '#f97316',
  [PRIORITIES.MEDIA]: '#eab308',
  [PRIORITIES.BAJA]: '#10b981',
};

export const REFRESH_INTERVAL = 5000; // 5 segundos