# 📊 Diagrama de Base de Datos - Asistencia SaaS

## Modelo Entidad-Relación

```
┌──────────────────────┐
│       TENANT         │──┐
│──────────────────────│  │
│ id (PK)              │  │
│ name                 │  │
│ legalName            │  │
│ rut                  │  │
│ status               │  │
│ maxEmployees         │  │
│ timezone             │  │
│ config (JSON)        │  │
└──────────────────────┘  │
                          │
┌──────────────────────┐  │  ┌──────────────────────┐
│        USER          │──┤  │     WORK_SCHEDULE     │
│──────────────────────│  │  │──────────────────────│
│ id (PK)              │  │  │ id (PK)              │
│ tenantId (FK) ───────┘  │  │ tenantId (FK) ───────┘
│ email (UQ)             │  │  name                 │
│ passwordHash           │  │  isDefault            │
│ role (enum)            │  │                       │
│ employeeId (FK) ───────┤  │  ┌──────────────────┐ │
└──────────────────────┘  │  │  │WORK_SCHEDULE_DAY │ │
                          │  │  │──────────────────│ │
┌──────────────────────┐  │  │  │ id (PK)          │ │
│      EMPLOYEE        │──┤  │  │ scheduleId (FK) ─┘ │
│──────────────────────│  │  │  │ dayOfWeek         │
│ id (PK)              │  │  │  │ startTime         │
│ tenantId (FK) ───────┘  │  │  │ endTime           │
│ documentNumber (UQ)     │  │  │ graceMinutes      │
│ firstName               │  │  └──────────────────┘ │
│ lastName                │  └──────────────────────┘
│ position                │
│ department              │  ┌──────────────────────┐
│ status                  │  │      GEOFENCE        │
│ workScheduleId (FK) ────┘  │──────────────────────│
└──────────────────────┘     │ id (PK)              │
                             │ tenantId (FK) ───────┐
┌──────────────────────┐     │ name                 │
│      PROJECT         │     │ latitude             │
│──────────────────────│     │ longitude            │
│ id (PK)              │     │ radius (meters)      │
│ tenantId (FK) ───────┐     │ workScheduleId (FK)  │
│ name                 │     └──────────────────────┘
│ code                 │
│ status               │  ┌──────────────────────────────┐
│ color                │  │      ATTENDANCE              │
└──────────────────────┘  │──────────────────────────────│
                          │ id (PK)                      │
┌──────────────────────┐  │ tenantId (FK) ───────────────┐
│ PROJECT_ASSIGNMENT   │  │ employeeId (FK) ─────────────┤
│──────────────────────│  │ projectId (FK) ──────────────┤
│ id (PK)              │  │ date                         │
│ tenantId (FK) ───────┐  │ checkIn / checkOut           │
│ projectId (FK) ──────┤  │ checkInLat / checkInLng      │
│ employeeId (FK) ─────┤  │ checkOutLat / checkOutLng    │
│ role                 │  │ status (enum)                │
│ hourlyRate           │  │ workedMinutes                │
│ isActive             │  │ lateMinutes                  │
└──────────────────────┘  │ overtimeMinutes              │
                          │ approvalStatus               │
┌──────────────────────┐  │ approvedById (FK) ──────────┐
│   OVERTIME_REQUEST   │  └──────────────────────────────┘
│──────────────────────│
│ id (PK)              │  ┌──────────────────────┐
│ tenantId (FK) ───────┐  │     AUDIT_LOG        │
│ employeeId (FK) ─────┤  │──────────────────────│
│ attendanceId (FK) ───┤  │ id (PK)              │
│ date                 │  │ tenantId (FK) ───────┐
│ startTime/endTime    │  │ userId (FK) ─────────┤
│ totalMinutes         │  │ action (enum)        │
│ reason               │  │ entity               │
│ status               │  │ entityId             │
│ approvedById (FK) ───┘  │ oldValue (JSON)      │
└──────────────────────┘  │ newValue (JSON)      │
                          │ ipAddress            │
┌──────────────────────┐  └──────────────────────┘
│       SESSION        │
│──────────────────────│  ┌──────────────────────┐
│ id (PK)              │  │                      │
│ userId (FK) ─────────┘  │   LEYENDA:           │
│ refreshToken (UQ)       │   PK = Primary Key   │
│ expiresAt               │   FK = Foreign Key   │
│ isRevoked               │   UQ = Unique        │
└──────────────────────┘  │   (JSON) = JSON col  │
                          └──────────────────────┘
```

## Convenciones de Nomenclatura

| Convención | Regla |
|-----------|-------|
| **Tablas** | snake_case, plural |
| **Columnas** | camelCase (Prisma) → snake_case (DB) |
| **PK** | `id` (UUID v4) |
| **FK** | `{tabla}Id` (ej: `tenantId`) |
| **Timestamps** | `createdAt`, `updatedAt` |
| **Enums** | UPPER_CASE en DB, PascalCase en Prisma |
| **Soft delete** | No usado, se usa `status` o `isActive` |

## Índices Clave

```sql
-- Performance para consultas frecuentes
CREATE INDEX idx_attendance_tenant_date ON attendances(tenant_id, date);
CREATE INDEX idx_attendance_employee_date ON attendances(employee_id, date);
CREATE INDEX idx_employees_tenant_status ON employees(tenant_id, status);
CREATE INDEX idx_audit_logs_tenant_created ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_sessions_expires ON sessions(expires_at) WHERE is_revoked = false;
```

## Políticas de Retención de Datos

| Tabla | Retención | Acción |
|-------|-----------|--------|
| `attendances` | 5 años | Archive a cold storage |
| `audit_logs` | 2 años | Delete automático |
| `sessions` | 90 días después de expirar | Delete automático |
| `overtime_requests` | 3 años | Archive |
