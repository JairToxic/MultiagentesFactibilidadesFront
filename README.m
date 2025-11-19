# 🎫 Sistema de Tickets con IA - Documentación Completa

Sistema integral de gestión de tickets con asignación inteligente usando Azure OpenAI, Azure AI Search y Microsoft Graph.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Arquitectura](#arquitectura)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Uso](#uso)
- [API Endpoints](#api-endpoints)
- [Despliegue](#despliegue)

---

## 🚀 Características

### Frontend
- ✅ **Dashboard interactivo** con estadísticas en tiempo real
- ✅ **Gestión completa de tickets** con filtros avanzados
- ✅ **Filtrado por técnico asignado**
- ✅ **Analytics y reportes** con gráficas
- ✅ **Configuración personalizable**
- ✅ **Autenticación con Azure AD**
- ✅ **Interfaz responsive y moderna**
- ✅ **Auto-refresh configurable**
- ✅ **Notificaciones en tiempo real**

### Backend
- ✅ **Clasificación automática con IA** (GPT-5-Mini)
- ✅ **Asignación inteligente de técnicos** (Azure AI Search)
- ✅ **Integración con Microsoft Graph**
- ✅ **Webhooks para emails en tiempo real**
- ✅ **Respuestas automáticas personalizadas**
- ✅ **Sistema de deduplicación**
- ✅ **Filtrado de correos de sistema**
- ✅ **Arquitectura modular y escalable**

---

## 🏗️ Arquitectura
```
┌─────────────────┐
│   Frontend      │
│   (Next.js)     │
└────────┬────────┘
         │
         │ REST API
         │
┌────────▼────────┐      ┌──────────────────┐
│   Backend       │◄─────┤ Microsoft Graph  │
│   (Flask)       │      │   (Webhooks)     │
└────────┬────────┘      └──────────────────┘
         │
    ┌────┴─────┬──────────┬──────────────┐
    │          │          │              │
┌───▼───┐  ┌──▼──┐  ┌────▼─────┐  ┌────▼────┐
│ Azure │  │ DB  │  │  Azure   │  │  Azure  │
│OpenAI │  │(PG) │  │AI Search │  │   AD    │
└───────┘  └─────┘  └──────────┘  └─────────┘
```

---

## 📦 Instalación

### Prerrequisitos

- Python 3.9+
- Node.js 18+
- PostgreSQL 14+
- Cuenta de Azure con:
  - Azure OpenAI
  - Azure AI Search
  - Azure AD
  - Microsoft Graph API

### Backend
```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# o
venv\Scripts\activate     # Windows

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Crear base de datos
python create_tables.py

# Ejecutar servidor
python app.py
```

### Frontend
```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con tus credenciales

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build
npm start
```

---

## ⚙️ Configuración

### Backend - `.env`
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/tickets_db

# Microsoft Graph
TENANT_ID=your-tenant-id
CLIENT_ID=your-client-id
CLIENT_SECRET=your-client-secret
MAILBOX_ADDRESS=support@yourdomain.com

# Azure OpenAI
AZURE_OPENAI_RESPONSES_URL=https://your-resource.openai.azure.com/openai/deployments/gpt-5-mini/responses
AZURE_OPENAI_API_KEY=your-api-key
AZURE_OPENAI_DEPLOYMENT=gpt-5-mini

# Azure AI Search
AZ_SEARCH_ENDPOINT=https://your-search-service.search.windows.net
AZ_SEARCH_INDEX=technicians-index
AZ_SEARCH_API_KEY=your-search-key
AZ_SEARCH_API_VERSION=2024-07-01

# Frontend
FRONTEND_ORIGIN=http://localhost:3000

# Organization
MY_ORG_DOMAIN=yourdomain.com
```

### Frontend - `.env.local`
```env
# API
NEXT_PUBLIC_API_URL=http://localhost:5000

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Azure AD
AZURE_AD_CLIENT_ID=your-client-id
AZURE_AD_CLIENT_SECRET=your-client-secret
AZURE_AD_TENANT_ID=your-tenant-id
```

---

## 📁 Estructura del Proyecto

### Backend
```
backend/
├── controllers/
│   ├── ai_controller.py
│   ├── search_controller.py
│   ├── tickets_controller.py
│   ├── subscriptions_controller.py
│   └── webhooks_controller.py
├── services/
│   ├── email_service.py
│   ├── classification_service.py
│   ├── assignment_service.py
│   └── notification_service.py
├── utils/
│   ├── helpers.py
│   └── validators.py
├── models.py
├── db.py
└── app.py
```

### Frontend
```
frontend/
├── app/
│   ├── dashboard/
│   ├── tickets/
│   ├── analytics/
│   ├── settings/
│   └── api/auth/
├── components/
│   ├── common/
│   ├── tickets/
│   ├── dashboard/
│   ├── analytics/
│   └── layout/
├── services/
├── hooks/
└── utils/
```

---

## 🎯 Uso

### 1. Dashboard

Accede a `/dashboard` para ver:
- Estadísticas generales
- Gráficos de actividad
- Distribución por prioridad
- Actividad reciente

### 2. Gestión de Tickets

Accede a `/tickets` para:
- Ver todos los tickets
- Filtrar por estado, prioridad, producto, categoría y técnico
- Buscar tickets
- Ver detalles completos
- Responder a clientes
- Cambiar estados

### 3. Analytics

Accede a `/analytics` para:
- Ver métricas de rendimiento
- Analizar tiempos de respuesta
- Revisar volumen de tickets
- Ver rendimiento por técnico
- Exportar reportes

### 4. Configuración

Accede a `/settings` para:
- Configurar auto-refresh
- Personalizar notificaciones
- Configurar respuestas automáticas
- Gestionar usuarios

---

## 🔌 API Endpoints

### Tickets
```
GET    /tickets              → Obtener todos los tickets
GET    /tickets/:id          → Obtener ticket específico
POST   /tickets/:id/reply    → Responder a ticket
PATCH  /tickets/:id/status   → Cambiar estado
PATCH  /tickets/:id/assign   → Reasignar técnico
```

### AI & Search
```
GET    /ai/test              → Probar conexión con Azure OpenAI
GET    /search/test?q=query  → Probar búsqueda de técnicos
```

### Subscriptions
```
POST   /subscriptions/create → Crear suscripción de Graph
```

### Webhooks
```
GET    /graph/notifications  → Validación de suscripción
POST   /graph/notifications  → Recibir notificaciones
```

---

## 🚀 Despliegue

### Backend (Azure App Service)
```bash
# Build
pip freeze > requirements.txt

# Deploy
az webapp up --name your-app-name --resource-group your-rg
```

### Frontend (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Base de Datos (Azure PostgreSQL)
```bash
# Crear servidor
az postgres flexible-server create \
  --name your-db-server \
  --resource-group your-rg \
  --location eastus \
  --admin-user dbadmin \
  --admin-password YourPassword123!
```

---

## 📊 Filtros Disponibles

### Por Estado
- Todos
- Nuevos
- En progreso
- Resueltos
- Cerrados

### Por Prioridad
- Crítica
- Alta
- Media
- Baja

### Por Producto
- Microsoft Teams
- Exchange Online
- SharePoint Online
- Azure
- Microsoft 365
- Otro

### Por Categoría
- Incidente
- Solicitud
- Consulta
- Cambio
- Otro

### Por Técnico Asignado
- Todos los técnicos
- Sin asignar
- [Lista dinámica de técnicos]

### Búsqueda
- ID de ticket
- Asunto
- Remitente
- Resumen
- Nombre del técnico

---

## 🎨 Tecnologías

### Frontend
- Next.js 14
- React 18
- NextAuth.js
- Recharts
- React Hot Toast
- Axios
- CSS Modules

### Backend
- Python 3.9+
- Flask
- SQLAlchemy
- PostgreSQL
- Azure OpenAI
- Azure AI Search
- Microsoft Graph API
- MSAL

---

## 📝 Licencia

© 2024 Inova Solutions - Todos los derechos reservados

---

## 👥 Soporte

Para soporte técnico, contacta a: support@inovacorporation.com