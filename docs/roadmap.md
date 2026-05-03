# 🗺️ Roadmap de Desarrollo - Asistencia SaaS

> **Última actualización:** 2026-05-02
> **Estado actual:** FASE 6 Completada · FASE 7 en progreso

---

## 📊 Leyenda

| Símbolo | Significado |
|:-------:|-------------|
| ✅ | Completado |
| 🔄 | En progreso |
| ⏳ | Pendiente |
| 📝 | Planificado |
| 🚀 | Prioridad alta |
| 📌 | Prioridad media |
| 🧊 | Prioridad baja / icebox |

---

## FASE 1: 🏛️ Arquitectura del Sistema ✅

> **Objetivo:** Definir la arquitectura completa del sistema SaaS multi-tenant.

| # | Tarea | Estado | Esfuerzo |
|:-:|-------|:------:|:--------:|
| 1.1 | Decidir stack tecnológico (NestJS + Prisma + PostgreSQL + Redis) | ✅ | 1h |
| 1.2 | Definir estrategia multi-tenant (Shared Table) | ✅ | 30m |
| 1.3 | Diseñar estructura de Clean Architecture | ✅ | 2h |
| 1.4 | Definir patrones y convenciones de código (SOLID, DRY) | ✅ | 1h |
| 1.5 | Documentar decisiones arquitectónicas (ADRs) | ✅ | 1h |

---

## FASE 2: 💾 Base de Datos ✅

> **Objetivo:** Diseñar el esquema de base de datos multi-tenant.

| # | Tarea | Estado | Esfuerzo |
|:-:|-------|:------:|:--------:|
| 2.1 | Diseñar modelo Tenant (empresas) | ✅ | 1h |
| 2.2 | Diseñar modelo User + Employee | ✅ | 2h |
| 2.3 | Diseñar modelo WorkSchedule + GeoFence | ✅ | 1.5h |
| 2.4 | Diseñar modelo Project + ProjectAssignment | ✅ | 1.5h |
| 2.5 | Diseñar modelo Attendance + OvertimeRequest | ✅ | 2h |
| 2.6 | Diseñar modelo AuditLog + Session | ✅ | 1h |
| 2.7 | Crear schema.prisma con 12 modelos + enums | ✅ | 4h |
| 2.8 | Crear seed.ts con datos demo | ✅ | 2h |

---

## FASE 3: 📁 Estructura de Carpetas ✅

> **Objetivo:** Crear estructura profesional del proyecto.

| # | Tarea | Estado | Esfuerzo |
|:-:|-------|:------:|:--------:|
| 3.1 | Crear estructura backend (~119 carpetas, Clean Architecture) | ✅ | 3h |
| 3.2 | Crear estructura frontend (Next.js App Router) | ✅ | 2h |
| 3.3 | Configurar package.json, tsconfig, nest-cli | ✅ | 1.5h |
| 3.4 | Configurar ESLint, Prettier, Husky | ✅ | 1h |

---

## FASE 4: 🔌 Endpoints API ✅

> **Objetivo:** Diseñar y documentar todos los endpoints REST.

| # | Tarea | Estado | Esfuerzo |
|:-:|-------|:------:|:--------:|
| 4.1 | Diseñar endpoints de Auth (register, login, refresh, logout) | ✅ | 2h |
| 4.2 | Diseñar endpoints de Tenant | ✅ | 1.5h |
| 4.3 | Diseñar endpoints de Employee | ✅ | 2h |
| 4.4 | Diseñar endpoints de Attendance (check-in/out, historial) | ✅ | 2h |
| 4.5 | Diseñar endpoints de Project + assignments | ✅ | 1.5h |
| 4.6 | Diseñar endpoints de Report | ✅ | 1h |
| 4.7 | Diseñar endpoints de Geolocation | ✅ | 1h |
| 4.8 | Diseñar endpoints de Overtime | ✅ | 1h |
| 4.9 | Diseñar endpoints de Notifications | ✅ | 1h |
| 4.10 | Documentar con Swagger/OpenAPI (~50 endpoints) | ✅ | 3h |

---

## FASE 5: 🔐 Autenticación y Seguridad ✅

> **Objetivo:** Implementar el flujo completo de autenticación.

| # | Tarea | Estado | Esfuerzo |
|:-:|-------|:------:|:--------:|
| 5.1 | Configurar JWT RS256 + RSA key pair | ✅ | 2h |
| 5.2 | Implementar Passport JWT Strategy | ✅ | 1.5h |
| 5.3 | Implementar JWT Refresh Strategy | ✅ | 1.5h |
| 5.4 | Crear AuthService (register, login, refreshTokens, logout) | ✅ | 4h |
| 5.5 | Crear AuthController con rate limiting | ✅ | 2h |
| 5.6 | Implementar RolesGuard + PermissionsGuard | ✅ | 2h |
| 5.7 | Implementar TenantGuard + TenantInterceptor | ✅ | 2h |
| 5.8 | Implementar JwtAuthGuard (global, con @Public()) | ✅ | 1.5h |
| 5.9 | Crear decoradores: @CurrentUser, @Roles, @Permissions, @Public | ✅ | 1.5h |
| 5.10 | Crear filtro global HttpExceptionFilter | ✅ | 1h |
| 5.11 | Crear interceptores: Transform, Logging, Timeout | ✅ | 2h |
| 5.12 | Configurar rate limiting por endpoint | ✅ | 1h |
| 5.13 | Configurar ThrottlerModule global | ✅ | 30m |

---

## FASE 6: 🧩 Módulos de Dominio ✅

> **Objetivo:** Implementar todos los módulos de negocio.

| # | Módulo | Estado | Esfuerzo | Endpoints |
|:-:|--------|:------:|:--------:|:---------:|
| 6.1 | **Tenant** - CRUD empresas, stats, logo | ✅ | 6h | 5 |
| 6.2 | **Employee** - CRUD empleados, validación documentos | ✅ | 8h | 6 |
| 6.3 | **Attendance** - Check-in/out, geofence, GPS, tiempo | ✅ | 12h | 6 |
| 6.4 | **Project** - CRUD proyectos, asignaciones | ✅ | 8h | 6 |
| 6.5 | **Audit** - Logging de auditoría global | ✅ | 3h | - |
| 6.6 | **Shared** - Guards, decorators, interceptors, utils | ✅ | 4h | - |

---

## FASE 7: 🗺️ Roadmap (Esta Fase) 🔄

> **Objetivo:** Definir roadmap por fases y priorizar sprints.

| # | Tarea | Estado | Esfuerzo |
|:-:|-------|:------:|:--------:|
| 7.1 | Definir fases de implementación (este documento) | 🔄 | 1h |
| 7.2 | Priorizar sprints según MVP | ⏳ | 1h |
| 7.3 | Estimar esfuerzo total del proyecto | ✅ | 30m |
| 7.4 | Identificar dependencias entre tareas | ✅ | 1h |

---

## FASE 8: 🧪 Módulos Faltantes (Backend) ⏳

> **Objetivo:** Completar los módulos backend que faltan.

### 8.1 📊 Módulo Report 🚀

| # | Tarea | Prioridad | Esfuerzo |
|:-:|-------|:---------:|:--------:|
| 8.1.1 | Crear DTOs de filtros de reportes | 🚀 | 1h |
| 8.1.2 | Implementar ReportService (generación de reportes) | 🚀 | 6h |
| 8.1.3 | Integrar Bull Queue para procesamiento async | 🚀 | 3h |
| 8.1.4 | Implementar exportación PDF (PDFKit/Puppeteer) | 🚀 | 4h |
| 8.1.5 | Implementar exportación Excel (ExcelJS) | 📌 | 3h |
| 8.1.6 | Implementar exportación CSV | 📌 | 1h |
| 8.1.7 | Reporte diario de asistencia | 🚀 | 2h |
| 8.1.8 | Reporte mensual por empleado | 🚀 | 2h |
| 8.1.9 | Dashboard de métricas agregadas | 📌 | 4h |

### 8.2 📍 Módulo Geolocation 📌

| # | Tarea | Prioridad | Esfuerzo |
|:-:|-------|:---------:|:--------:|
| 8.2.1 | CRUD de Geocercas (GeoFence) | 🚀 | 4h |
| 8.2.2 | Verificación de ubicación en tiempo real | 🚀 | 3h |
| 8.2.3 | Historial de ubicaciones | 📌 | 2h |
| 8.2.4 | Alertas por salida de zona | 📌 | 2h |

### 8.3 ⏰ Módulo Overtime 📌

| # | Tarea | Prioridad | Esfuerzo |
|:-:|-------|:---------:|:--------:|
| 8.3.1 | Solicitud de horas extra con justificación | 🚀 | 3h |
| 8.3.2 | Flujo de aprobación (manager/tenant_admin) | 🚀 | 3h |
| 8.3.3 | Cálculo automático de horas extra | 🚀 | 2h |
| 8.3.4 | Reporte de horas extra por período | 📌 | 2h |

### 8.4 🔔 Módulo Notifications 🧊

| # | Tarea | Prioridad | Esfuerzo |
|:-:|-------|:---------:|:--------:|
| 8.4.1 | Notificaciones in-app | 📌 | 3h |
| 8.4.2 | Notificaciones por email (Nodemailer) | 📌 | 3h |
| 8.4.3 | Recordatorios de check-in/out | 🧊 | 2h |
| 8.4.4 | Alertas de tardanza recurrente | 🧊 | 2h |

### 8.5 ❤️ Módulo Health 🧊

| # | Tarea | Prioridad | Esfuerzo |
|:-:|-------|:---------:|:--------:|
| 8.5.1 | Health check endpoints | 📌 | 1h |
| 8.5.2 | Métricas de sistema (memoria, CPU, conexiones) | 🧊 | 2h |
| 8.5.3 | Endpoint readiness/liveness para K8s | 🧊 | 1h |

---

## FASE 9: 🐳 Infraestructura Docker ⏳

> **Objetivo:** Contenerizar todo el sistema.

| # | Tarea | Prioridad | Esfuerzo |
|:-:|-------|:---------:|:--------:|
| 9.1 | Dockerfile para backend (multi-stage) | 🚀 | 3h |
| 9.2 | Dockerfile para frontend | 🚀 | 2h |
| 9.3 | Docker Compose (PostgreSQL + Redis + Backend + Frontend) | 🚀 | 3h |
| 9.4 | Docker Compose para desarrollo (hot reload) | 🚀 | 2h |
| 9.5 | Configurar MinIO (S3 para fotos/logos) | 📌 | 2h |
| 9.6 | Configurar Nginx como reverse proxy | 📌 | 2h |
| 9.7 | Configurar SSL/TLS (Let's Encrypt) | 📌 | 1h |

---

## FASE 10: ☸️ Kubernetes ⏳

> **Objetivo:** Preparar despliegue en Kubernetes.

| # | Tarea | Prioridad | Esfuerzo |
|:-:|-------|:---------:|:--------:|
| 10.1 | Manifiestos Deployment + Service para backend | 🧊 | 3h |
| 10.2 | Manifiestos Deployment + Service para frontend | 🧊 | 2h |
| 10.3 | ConfigMaps + Secrets | 🧊 | 2h |
| 10.4 | Ingress Controller + TLS | 🧊 | 2h |
| 10.5 | HPA (Horizontal Pod Autoscaler) | 🧊 | 2h |
| 10.6 | StatefulSet para PostgreSQL + Redis | 🧊 | 3h |

---

## FASE 11: 📱 Frontend (Next.js) ⏳

> **Objetivo:** Construir la interfaz de usuario.

### 11.1 ⚛️ Core Frontend 🚀

| # | Tarea | Prioridad | Esfuerzo |
|:-:|-------|:---------:|:--------:|
| 11.1.1 | Configurar proyecto (Next.js 14+, Tailwind, shadcn/ui) | 🚀 | 4h |
| 11.1.2 | Crear layout base (Sidebar + Header responsivo) | 🚀 | 4h |
| 11.1.3 | Implementar ThemeProvider (dark/light mode) | 🚀 | 2h |
| 11.1.4 | Crear API client (Axios + interceptors + refresh token) | 🚀 | 4h |
| 11.1.5 | Estado global (React Context/Zustand para tenant + auth) | 🚀 | 3h |
| 11.1.6 | Protección de rutas (middleware + guards) | 🚀 | 2h |

### 11.2 🔐 Auth UI 🚀

| # | Tarea | Prioridad | Esfuerzo |
|:-:|-------|:---------:|:--------:|
| 11.2.1 | Página de Login | 🚀 | 3h |
| 11.2.2 | Página de registro de tenant | 🚀 | 3h |
| 11.2.3 | Página de recuperación de contraseña | 📌 | 2h |
| 11.2.4 | Manejo de sesión expirada (redirect + refresh) | 🚀 | 2h |

### 11.3 🏢 Tenant UI 🚀

| # | Tarea | Prioridad | Esfuerzo |
|:-:|-------|:---------:|:--------:|
| 11.3.1 | Dashboard de la empresa | 🚀 | 6h |
| 11.3.2 | Configuración de empresa | 📌 | 4h |
| 11.3.3 | Gestión de usuarios/admin | 🚀 | 4h |

### 11.4 👥 Employee UI 🚀

| # | Tarea | Prioridad | Esfuerzo |
|:-:|-------|:---------:|:--------:|
| 11.4.1 | Lista de empleados (DataTable) | 🚀 | 5h |
| 11.4.2 | Formulario crear/editar empleado | 🚀 | 4h |
| 11.4.3 | Perfil de empleado con estadísticas | 🚀 | 4h |
| 11.4.4 | Filtros por departamento/estado | 📌 | 2h |
| 11.4.5 | Importar empleados (CSV) | 🧊 | 3h |

### 11.5 📋 Attendance UI 🚀

| # | Tarea | Prioridad | Esfuerzo |
|:-:|-------|:---------:|:--------:|
| 11.5.1 | Botón Check-in/Check-out con GPS | 🚀 | 6h |
| 11.5.2 | Mapa de ubicación actual | 🚀 | 3h |
| 11.5.3 | Historial de asistencia (calendario) | 🚀 | 5h |
| 11.5.4 | Dashboard de asistencia en tiempo real | 🚀 | 6h |
| 11.5.5 | Vista de "¿Quién está trabajando ahora?" | 📌 | 3h |

### 11.6 📊 Report UI 📌

| # | Tarea | Prioridad | Esfuerzo |
|:-:|-------|:---------:|:--------:|
| 11.6.1 | Reporte diario | 📌 | 4h |
| 11.6.2 | Reporte mensual | 📌 | 4h |
| 11.6.3 | Descarga PDF/Excel | 📌 | 3h |
| 11.6.4 | Gráficos y dashboards | 📌 | 6h |

### 11.7 📱 Mobile-First 📌

| # | Tarea | Prioridad | Esfuerzo |
|:-:|-------|:---------:|:--------:|
| 11.7.1 | PWA (Progressive Web App) | 📌 | 4h |
| 11.7.2 | Instalable en homescreen | 📌 | 2h |
| 11.7.3 | Geolocalización desde navegador móvil | 🚀 | 3h |
| 11.7.4 | Modo offline básico | 🧊 | 6h |

---

## FASE 12: 🧪 Testing ⏳

> **Objetivo:** Asegurar calidad del código.

| # | Tarea | Prioridad | Esfuerzo |
|:-:|-------|:---------:|:--------:|
| 12.1 | Tests unitarios módulo Auth | 🚀 | 4h |
| 12.2 | Tests unitarios módulo Employee | 🚀 | 3h |
| 12.3 | Tests unitarios módulo Attendance | 🚀 | 4h |
| 12.4 | Tests unitarios módulo Project | 🚀 | 3h |
| 12.5 | Tests de integración (E2E) | 📌 | 8h |
| 12.6 | Configurar CI/CD (GitHub Actions) | 📌 | 4h |

---

## FASE 13: 🚀 Producción ⏳

> **Objetivo:** Preparar para despliegue en producción.

| # | Tarea | Prioridad | Esfuerzo |
|:-:|-------|:---------:|:--------:|
| 13.1 | Configurar dominio + DNS | 🧊 | 1h |
| 13.2 | Configurar Cloudflare/CDN | 🧊 | 2h |
| 13.3 | Monitoreo con Prometheus + Grafana | 🧊 | 6h |
| 13.4 | Logs centralizados (ELK/Loki) | 🧊 | 4h |
| 13.5 | Backup automático de BD | 🧊 | 2h |
| 13.6 | Disaster recovery plan | 🧊 | 3h |

---

## 📐 Estimación de Esfuerzo Total

| Fase | Horas Estimadas | Horas Reales (completado) |
|:----:|:---------------:|:-------------------------:|
| FASE 1 | ~6h | ✅ ~6h |
| FASE 2 | ~13h | ✅ ~13h |
| FASE 3 | ~8h | ✅ ~8h |
| FASE 4 | ~16h | ✅ ~16h |
| FASE 5 | ~22h | ✅ ~22h |
| FASE 6 | ~41h | ✅ ~41h |
| **Backend Completo** | **~106h** | **✅ ~106h** |
| FASE 7 (Roadmap) | ~3h | 🔄 ~3h |
| FASE 8 (Módulos faltantes) | ~67h | ⏳ |
| FASE 9 (Docker) | ~15h | ⏳ |
| FASE 10 (K8s) | ~14h | 🧊 |
| FASE 11 (Frontend) | ~115h | ⏳ |
| FASE 12 (Testing) | ~22h | ⏳ |
| FASE 13 (Producción) | ~18h | 🧊 |
| **Total Proyecto** | **~360h** | |

---

## 🏆 Hitos (Milestones)

| Hito | Fecha Objetivo | Dependencias |
|------|:--------------:|:------------:|
| **M1 - MVP** | Sprint 1-2 | FASE 8.1, 8.2, 8.3, 9.1, 9.3, 11.1-11.5 |
| **M2 - Reportes** | Sprint 3 | FASE 8.1 completa, 11.6 |
| **M3 - Infraestructura Cloud** | Sprint 4 | FASE 9, 10 |
| **M4 - Notificaciones** | Sprint 5 | FASE 8.4, 11.7 |
| **M5 - Producción** | Sprint 6 | FASE 12, 13 |

---

## 🚀 Próximos 3 Sprints (Prioridad Inmediata)

### Sprint 1: Módulos Backend Restantes + Docker
```
Duración: 2 semanas (80h estimadas)
Prioridad: 🚀 MVP

Tareas:
├── [8.1] Módulo Report (PDF/Excel/CSV + Bull Queue)  → 20h
├── [8.2] Módulo Geolocation (GeoFence CRUD + verificación) → 10h
├── [8.3] Módulo Overtime (Solicitudes + aprobación)  → 10h
├── [8.5] Módulo Health (health checks)  → 3h
├── [9.1-9.3] Docker Compose + Dockerfiles  → 10h
└── Testing de módulos completados  → 10h
```

### Sprint 2: Frontend Core + Auth + Employee
```
Duración: 2 semanas (80h estimadas)
Prioridad: 🚀 MVP

Tareas:
├── [11.1] Core Frontend (layout, API client, estado)  → 15h
├── [11.2] Auth UI (login, register)  → 10h
├── [11.3] Tenant UI (dashboard, settings)  → 14h
├── [11.4] Employee UI (lista, formulario, perfil)  → 15h
└── [11.7.3] Geolocalización móvil  → 3h
```

### Sprint 3: Attendance UI + Primeros Reportes
```
Duración: 2 semanas (80h estimadas)
Prioridad: 🚀 MVP

Tareas:
├── [11.5] Attendance UI (check-in/out, mapa, historial)  → 20h
├── [11.6] Report UI básico (reporte diario/mensual)  → 10h
├── [12.1-12.4] Tests unitarios modulares  → 14h
└── [11.1.6] Protección de rutas + middleware  → 5h
```
