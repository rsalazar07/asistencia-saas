# 📁 Estructura de Carpetas Profesional

## Backend (NestJS + Clean Architecture)

```
apps/backend/
├── src/
│   ├── main.ts                          # Entry point
│   ├── app.module.ts                    # Módulo raíz
│   │
│   ├── config/                          # Configuración
│   │   ├── app.config.ts                # Config general
│   │   ├── database.config.ts           # Config BD
│   │   ├── auth.config.ts               # Config JWT
│   │   ├── redis.config.ts              # Config Redis
│   │   ├── storage.config.ts            # Config S3/MinIO
│   │   └── cors.config.ts               # Config CORS
│   │
│   ├── prisma/                          # Prisma service
│   │   ├── prisma.service.ts            # Servicio singleton
│   │   └── prisma.module.ts             # Módulo Prisma
│   │
│   ├── common/                          # Utilidades comunes
│   │   ├── logger/
│   │   │   ├── logger.service.ts        # Pino logger
│   │   │   └── logger.module.ts
│   │   ├── health/
│   │   │   └── health.controller.ts     # Health check
│   │   └── metrics/
│   │       └── metrics.service.ts       # Prometheus metrics
│   │
│   ├── shared/                          # Código compartido multi-módulo
│   │   ├── constants/
│   │   │   ├── index.ts                 # Constantes generales
│   │   │   └── permissions.ts           # Definición de permisos
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts    # @CurrentUser()
│   │   │   ├── public.decorator.ts          # @Public()
│   │   │   ├── permissions.decorator.ts     # @Permissions()
│   │   │   └── roles.decorator.ts           # @Roles()
│   │   ├── dto/
│   │   │   ├── pagination.dto.ts        # Paginación genérica
│   │   │   ├── api-response.dto.ts      # Respuesta estándar
│   │   │   └── date-range.dto.ts        # Rango de fechas
│   │   ├── filters/
│   │   │   ├── http-exception.filter.ts     # Filtro de excepciones
│   │   │   └── prisma-exception.filter.ts   # Filtro errores Prisma
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts            # Guard JWT
│   │   │   ├── roles.guard.ts               # Guard roles
│   │   │   ├── permissions.guard.ts         # Guard permisos
│   │   │   └── tenant.guard.ts              # Guard multi-tenant
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts       # Logging de requests
│   │   │   ├── transform.interceptor.ts     # Transformar respuestas
│   │   │   ├── timeout.interceptor.ts       # Timeout
│   │   │   └── tenant.interceptor.ts        # Inyectar tenantId
│   │   ├── interfaces/
│   │   │   ├── jwt-payload.interface.ts     # Payload JWT
│   │   │   ├── request-with-user.interface.ts
│   │   │   └── tenant-request.interface.ts
│   │   ├── pipes/
│   │   │   ├── validation.pipe.ts           # Validación global
│   │   │   └── parse-uuid.pipe.ts           # Parse UUID
│   │   └── utils/
│   │       ├── crypto.util.ts           # Hash, UUID
│   │       ├── date.util.ts             # Manejo de fechas
│   │       └── pagination.util.ts       # Helper paginación
│   │
│   └── modules/                          # Módulos de dominio
│       │
│       ├── auth/                         # Autenticación
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── strategies/
│       │   │   ├── jwt.strategy.ts
│       │   │   └── jwt-refresh.strategy.ts
│       │   ├── guards/
│       │   │   ├── jwt-auth.guard.ts
│       │   │   └── local-auth.guard.ts
│       │   ├── dto/
│       │   │   ├── login.dto.ts
│       │   │   ├── register.dto.ts
│       │   │   └── refresh-token.dto.ts
│       │   └── tests/
│       │       └── auth.service.spec.ts
│       │
│       ├── tenant/                        # Gestión de empresas
│       │   ├── tenant.module.ts
│       │   ├── controllers/
│       │   │   ├── tenant.controller.ts      # CRUD empresa
│       │   │   └── tenant-config.controller.ts # Config
│       │   ├── services/
│       │   │   ├── tenant.service.ts
│       │   │   └── tenant-config.service.ts
│       │   ├── dto/
│       │   │   ├── create-tenant.dto.ts
│       │   │   ├── update-tenant.dto.ts
│       │   │   └── tenant-config.dto.ts
│       │   ├── entities/
│       │   │   └── tenant.entity.ts
│       │   └── tests/
│       │
│       ├── employee/                      # Gestión de empleados
│       │   ├── employee.module.ts
│       │   ├── controllers/
│       │   │   ├── employee.controller.ts
│       │   │   └── employee-bulk.controller.ts
│       │   ├── services/
│       │   │   ├── employee.service.ts
│       │   │   └── employee-import.service.ts
│       │   ├── dto/
│       │   │   ├── create-employee.dto.ts
│       │   │   ├── update-employee.dto.ts
│       │   │   └── employee-filter.dto.ts
│       │   ├── validators/
│       │   │   └── document.validator.ts
│       │   └── tests/
│       │
│       ├── attendance/                    # Control de asistencia
│       │   ├── attendance.module.ts
│       │   ├── controllers/
│       │   │   ├── attendance.controller.ts    # Check-in/out
│       │   │   └── attendance-history.controller.ts
│       │   ├── services/
│       │   │   ├── attendance.service.ts
│       │   │   ├── check-in.service.ts
│       │   │   └── check-out.service.ts
│       │   ├── dto/
│       │   │   ├── check-in.dto.ts
│       │   │   ├── check-out.dto.ts
│       │   │   └── attendance-filter.dto.ts
│       │   ├── validators/
│       │   │   ├── geofence.validator.ts
│       │   │   └── time.validator.ts
│       │   └── tests/
│       │
│       ├── project/                       # Gestión de proyectos
│       │   ├── project.module.ts
│       │   ├── controllers/
│       │   │   ├── project.controller.ts
│       │   │   └── project-assignment.controller.ts
│       │   ├── services/
│       │   │   ├── project.service.ts
│       │   │   └── project-assignment.service.ts
│       │   ├── dto/
│       │   │   ├── create-project.dto.ts
│       │   │   ├── update-project.dto.ts
│       │   │   └── assign-employee.dto.ts
│       │   └── tests/
│       │
│       ├── report/                        # Reportes
│       │   ├── report.module.ts
│       │   ├── controllers/
│       │   │   └── report.controller.ts
│       │   ├── services/
│       │   │   └── report.service.ts
│       │   ├── generators/
│       │   │   ├── pdf.generator.ts
│       │   │   ├── excel.generator.ts
│       │   │   └── csv.generator.ts
│       │   ├── dto/
│       │   │   └── report-request.dto.ts
│       │   └── tests/
│       │
│       ├── geolocation/                   # Geolocalización
│       │   ├── geolocation.module.ts
│       │   ├── controllers/
│       │   │   └── geolocation.controller.ts
│       │   ├── services/
│       │   │   ├── geofence.service.ts
│       │   │   └── geolocation.service.ts
│       │   ├── dto/
│       │   │   └── geofence.dto.ts
│       │   └── validators/
│       │       └── coordinates.validator.ts
│       │
│       ├── overtime/                      # Horas extra
│       │   ├── overtime.module.ts
│       │   ├── controllers/
│       │   │   └── overtime.controller.ts
│       │   ├── services/
│       │   │   └── overtime.service.ts
│       │   ├── dto/
│       │   │   └── overtime-request.dto.ts
│       │   └── tests/
│       │
│       ├── audit/                         # Auditoría
│       │   ├── audit.module.ts
│       │   ├── services/
│       │   │   ├── audit.service.ts
│       │   │   └── audit-logger.service.ts
│       │   └── dto/
│       │       └── audit-filter.dto.ts
│       │
│       └── notifications/                 # Notificaciones
│           ├── notifications.module.ts
│           ├── services/
│           │   ├── notifications.service.ts
│           │   ├── email.service.ts
│           │   └── push.service.ts
│           └── dto/
│               └── notification.dto.ts
│
├── test/                                  # Tests E2E
│   ├── app.e2e-spec.ts
│   ├── auth.e2e-spec.ts
│   ├── employee.e2e-spec.ts
│   └── jest-e2e.json
│
├── .env                                   # Variables de entorno
├── .env.example                           # Ejemplo .env
├── .eslintrc.js                           # ESLint config
├── .prettierrc                            # Prettier config
├── nest-cli.json                          # NestJS CLI config
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

## Frontend (Next.js 14+ App Router)

```
apps/frontend/
├── public/
│   ├── images/
│   │   ├── logo.svg
│   │   ├── logo-white.svg
│   │   ├── placeholder-avatar.svg
│   │   └── empty-state.svg
│   ├── icons/
│   │   ├── favicon.ico
│   │   └── apple-icon.png
│   └── fonts/
│       └── (Google Fonts locales)
│
├── src/
│   ├── app/                               # App Router Pages
│   │   ├── layout.tsx                     # Layout raíz
│   │   ├── page.tsx                       # Landing page
│   │   ├── loading.tsx                    # Loading global
│   │   ├── error.tsx                      # Error global
│   │   ├── not-found.tsx                  # 404
│   │   │
│   │   ├── auth/                          # Autenticación
│   │   │   ├── layout.tsx
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── forgot-password/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/                   # Dashboard (autenticado)
│   │   │   ├── layout.tsx                 # Layout con sidebar
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx               # Dashboard principal
│   │   │   ├── employees/
│   │   │   │   ├── page.tsx               # Lista empleados
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx           # Detalle empleado
│   │   │   │   └── new/
│   │   │   │       └── page.tsx           # Nuevo empleado
│   │   │   ├── attendance/
│   │   │   │   ├── page.tsx               # Marcación
│   │   │   │   └── history/
│   │   │   │       └── page.tsx           # Historial
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx               # Lista proyectos
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx           # Detalle proyecto
│   │   │   ├── reports/
│   │   │   │   ├── page.tsx               # Reportes
│   │   │   │   └── [type]/
│   │   │   │       └── page.tsx           # Reporte específico
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx               # Admin panel
│   │   │   │   ├── users/
│   │   │   │   │   └── page.tsx           # Gestión usuarios
│   │   │   │   └── audit/
│   │   │   │       └── page.tsx           # Logs auditoría
│   │   │   └── settings/
│   │   │       ├── page.tsx               # Config general
│   │   │       ├── schedule/
│   │   │       │   └── page.tsx           # Horarios
│   │   │       └── geofence/
│   │   │           └── page.tsx           # Ubicaciones
│   │   │
│   │   └── api/                           # API Routes (proxy)
│   │       └── auth/
│   │           └── [...nextauth]/
│   │               └── route.ts
│   │
│   ├── components/
│   │   ├── ui/                            # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── table.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── select.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── separator.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── sidebar.tsx                # Sidebar navegación
│   │   │   ├── navbar.tsx                 # Navbar superior
│   │   │   ├── mobile-nav.tsx             # Nav móvil
│   │   │   ├── app-shell.tsx              # Shell principal
│   │   │   └── breadcrumb.tsx
│   │   │
│   │   ├── forms/
│   │   │   ├── login-form.tsx
│   │   │   ├── employee-form.tsx
│   │   │   ├── project-form.tsx
│   │   │   ├── schedule-form.tsx
│   │   │   ├── geofence-form.tsx
│   │   │   └── overtime-form.tsx
│   │   │
│   │   ├── tables/
│   │   │   ├── data-table.tsx             # Tabla genérica
│   │   │   ├── employees-table.tsx
│   │   │   ├── attendance-table.tsx
│   │   │   ├── projects-table.tsx
│   │   │   └── audit-table.tsx
│   │   │
│   │   ├── charts/
│   │   │   ├── attendance-chart.tsx       # Gráfico asistencia
│   │   │   ├── overview-stats.tsx         # Estadísticas
│   │   │   ├── overtime-chart.tsx
│   │   │   └── employee-status-pie.tsx
│   │   │
│   │   ├── maps/
│   │   │   ├── attendance-map.tsx         # Mapa con marcadores
│   │   │   ├── geofence-map.tsx           # Mapa con geocerca
│   │   │   └── location-picker.tsx        # Selector de ubicación
│   │   │
│   │   ├── shared/
│   │   │   ├── loading-spinner.tsx
│   │   │   ├── empty-state.tsx
│   │   │   ├── error-state.tsx
│   │   │   ├── confirm-dialog.tsx
│   │   │   ├── file-upload.tsx
│   │   │   ├── search-input.tsx
│   │   │   ├── pagination.tsx
│   │   │   └── qr-scanner.tsx
│   │   │
│   │   └── guards/
│   │       ├── auth-guard.tsx             # Protege rutas
│   │       └── role-guard.tsx             # Protege por rol
│   │
│   ├── lib/
│   │   ├── utils.ts                       # Utilidades generales
│   │   ├── constants.ts                   # Constantes
│   │   └── validators.ts                  # Validaciones
│   │
│   ├── hooks/
│   │   ├── use-auth.ts                    # Hook autenticación
│   │   ├── use-employees.ts               # Hook empleados
│   │   ├── use-attendance.ts              # Hook asistencia
│   │   ├── use-projects.ts                # Hook proyectos
│   │   ├── use-geolocation.ts             # Hook GPS
│   │   ├── use-pagination.ts              # Hook paginación
│   │   └── use-media-query.ts             # Hook responsive
│   │
│   ├── services/
│   │   ├── api.ts                         # Cliente Axios/Fetch
│   │   ├── auth.service.ts               # Auth API
│   │   ├── employee.service.ts
│   │   ├── attendance.service.ts
│   │   ├── project.service.ts
│   │   ├── report.service.ts
│   │   └── geolocation.service.ts
│   │
│   ├── stores/
│   │   ├── auth.store.ts                  # Zustand auth
│   │   ├── ui.store.ts                    # Estado UI
│   │   └── attendance.store.ts            # Estado asistencia
│   │
│   ├── types/
│   │   ├── api.ts                         # Tipos API
│   │   ├── auth.ts                        # Tipos auth
│   │   ├── employee.ts
│   │   ├── attendance.ts
│   │   ├── project.ts
│   │   └── index.ts
│   │
│   └── utils/
│       ├── format.ts                      # Formatos (fechas, moneda)
│       ├── geo.ts                         # Utilidades GPS
│       └── permissions.ts                 # Helpers permisos
│
├── .env.local
├── .env.example
├── .eslintrc.json
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## Docker

```
docker/
├── backend.Dockerfile
├── frontend.Dockerfile
├── docker-compose.yml
├── docker-compose.prod.yml
├── nginx/
│   ├── nginx.conf
│   └── ssl/
├── prometheus/
│   └── prometheus.yml
└── grafana/
    ├── datasources.yml
    └── dashboards/
        └── app-dashboard.json
```

## Kubernetes

```
k8s/
├── backend/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── hpa.yaml
│   └── configmap.yaml
├── frontend/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── configmap.yaml
├── database/
│   ├── statefulset.yaml
│   └── service.yaml
├── redis/
│   ├── deployment.yaml
│   └── service.yaml
├── ingress/
│   ├── ingress.yaml
│   └── certificate.yaml
└── monitoring/
    ├── prometheus-deployment.yaml
    └── grafana-deployment.yaml
```

## Principios de la Estructura

### 1. **Separación por Capas (Clean Architecture)**
```
Controller → Service → Repository (Prisma) → Database
```
- **Controller**: Maneja HTTP, valida entrada
- **Service**: Lógica de negocio
- **PrismaService**: Acceso a datos
- Cada capa solo conoce a la inferior

### 2. **Modularidad**
- Cada módulo es autocontenido
- Puede ser desarrollado y probado independientemente
- Comunicación entre módulos vía servicios compartidos o eventos

### 3. **Principios SOLID**
- **S**: Cada clase tiene una responsabilidad
- **O**: Abierto para extensión, cerrado para modificación
- **L**: Sustitución de interfaces
- **I**: Interfaces específicas
- **D**: Inyección de dependencias

### 4. **Convenciones de Nomenclatura**

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| **Archivos** | kebab-case | `attendance.service.ts` |
| **Clases** | PascalCase | `AttendanceService` |
| **Métodos** | camelCase | `findAll()` |
| **DTOs** | PascalCase | `CreateEmployeeDto` |
| **Interfaces** | PascalCase + I | `IJwtPayload` |
| **Módulos Nest** | PascalCase + Module | `AuthModule` |
