# Asistencia SaaS

> Plataforma multi-tenant para control de asistencia y gestión de personal.

## 📊 Estado del Proyecto

| Fase | Estado |
|:----|:------:|
| 🏛️ **FASE 1** - Arquitectura | ✅ Completado |
| 💾 **FASE 2** - Base de Datos | ✅ Completado |
| 📁 **FASE 3** - Estructura de Carpetas | ✅ Completado |
| 🔌 **FASE 4** - Endpoints API | ✅ Completado |
| 🔐 **FASE 5** - Autenticación | ✅ Completado |
| 🧩 **FASE 6** - Módulos (Tenant, Employee, Attendance, Project) | ✅ Completado |
| 🗺️ **FASE 7** - Roadmap | ✅ Completado |
| 🧪 **FASE 8** - Módulos restantes (Report, Geo, Overtime, Notifications) | ⏳ Pendiente |
| 🐳 **FASE 9** - Docker | ⏳ Pendiente |
| 📱 **FASE 11** - Frontend (Next.js) | ⏳ Pendiente |
| 🧪 **FASE 12** - Testing | ⏳ Pendiente |

---

> **Backend implementado:** Módulos Auth, Tenant, Employee, Attendance, Project, Audit + Shared
> **Próximo:** FASE 8 - Módulos faltantes (Report, Geolocation, Overtime, Notifications)

## 📋 Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **Frontend** | Next.js 14+ (App Router) | Latest |
| **UI** | TailwindCSS + shadcn/ui | Latest |
| **Backend** | NestJS (Node.js) | v10+ |
| **ORM** | Prisma | Latest |
| **Base de Datos** | PostgreSQL | 16 |
| **Cache** | Redis | 7 |
| **Cola de Procesos** | Bull (Redis-backed) | Latest |
| **Autenticación** | JWT + Passport | Latest |
| **Contenedores** | Docker + Docker Compose | Latest |
| **Orquestación** | Kubernetes (preparado) | 1.28+ |
| **Almacenamiento** | MinIO (S3-compatible) | Latest |
| **Monitoreo** | Prometheus + Grafana | Latest |

## 🏗️ Estructura del Proyecto

```
asistencia-saas/
├── apps/
│   ├── backend/              # API REST - NestJS
│   │   └── src/
│   │       ├── modules/      # Módulos por dominio
│   │       │   ├── tenant/       # Gestión de empresas
│   │       │   ├── auth/         # Autenticación y autorización
│   │       │   ├── employee/     # Gestión de empleados
│   │       │   ├── attendance/   # Control de asistencia
│   │       │   ├── project/      # Gestión de proyectos
│   │       │   ├── report/       # Reportes y exportaciones
│   │       │   ├── audit/        # Auditoría y logs
│   │       │   ├── geolocation/  # Geolocalización y geofence
│   │       │   ├── overtime/     # Horas extra
│   │       │   └── notifications/# Notificaciones
│   │       ├── shared/       # Código compartido
│   │       ├── config/       # Configuración
│   │       ├── prisma/       # Prisma service
│   │       └── common/       # Utilidades comunes
│   └── frontend/             # Web App - Next.js
│       └── src/
│           ├── app/          # Páginas (App Router)
│           ├── components/   # Componentes React
│           └── services/     # Clientes API
├── packages/
│   ├── database/             # Prisma schema + migrations
│   ├── shared/               # Tipos y utilidades compartidas
│   └── config/               # Configuraciones globales
├── docker/                   # Dockerfiles y compose
├── k8s/                      # Manifiestos Kubernetes
├── docs/                     # Documentación
└── scripts/                  # Scripts de utilidad
```

## 🚀 Inicio Rápido

```bash
# Clonar
git clone <url> && cd asistencia-saas

# Iniciar infraestructura
docker compose -f docker/docker-compose.yml up -d

# Instalar dependencias
cd apps/backend && npm install
cd apps/frontend && npm install

# Migrar base de datos
cd packages/database && npx prisma migrate dev

# Iniciar desarrollo
cd apps/backend && npm run start:dev
cd apps/frontend && npm run dev
```

## 📚 Documentación

- [Arquitectura](docs/architecture.md)
- [Base de Datos](docs/database-diagram.md)
- [API Endpoints](docs/api-endpoints.md)
- [Roadmap](docs/roadmap.md)
