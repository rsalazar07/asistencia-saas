# 🌐 API REST Endpoints - Asistencia SaaS

## Convenciones Generales

```
Base URL: /api/v1
Formato: JSON
Auth: Bearer JWT Token
Paginación: ?page=1&limit=20
Fechas: ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
```

### Headers Requeridos
```http
Authorization: Bearer <access_token>
X-Tenant-Id: <tenant_uuid>  # Inyectado automáticamente desde JWT
Content-Type: application/json
```

### Formato de Respuesta Estándar

```typescript
// Éxito
{
  "success": true,
  "data": T,
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  },
  "timestamp": "2025-01-15T10:30:00.000Z"
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Mensaje descriptivo",
    "details": [
      { "field": "email", "message": "El email no es válido" }
    ]
  },
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | OK |
| 201 | Creado |
| 204 | Sin contenido |
| 400 | Bad Request |
| 401 | No autorizado |
| 403 | Prohibido |
| 404 | No encontrado |
| 409 | Conflicto |
| 422 | Entidad no procesable |
| 429 | Too Many Requests |
| 500 | Error interno |

---

## 📋 Índice de Endpoints

| Grupo | Prefijo | Módulo |
|-------|---------|--------|
| [Auth](#-auth) | `/auth` | Autenticación |
| [Tenant](#-tenant) | `/tenant` | Gestión de empresa |
| [Users](#-users) | `/users` | Usuarios del sistema |
| [Employees](#-employees) | `/employees` | Gestión de empleados |
| [Attendance](#-attendance) | `/attendance` | Control de asistencia |
| [Projects](#-projects) | `/projects` | Gestión de proyectos |
| [Reports](#-reports) | `/reports` | Reportes |
| [Geolocation](#-geolocation) | `/geolocation` | Geolocalización |
| [Overtime](#-overtime) | `/overtime` | Horas extra |
| [Audit](#-audit) | `/audit` | Auditoría |
| [Health](#-health) | `/health` | Health check |

---

## 🔐 Auth

### POST /auth/register
Registrar una nueva empresa con admin.

```typescript
// Request
POST /api/v1/auth/register
{
  "companyName": "Mi Empresa SAC",
  "legalName": "Mi Empresa Sociedad Anónima Cerrada",
  "rut": "20123456789",
  "adminEmail": "admin@miempresa.pe",
  "adminPassword": "SecurePass123!",
  "adminFirstName": "Carlos",
  "adminLastName": "López",
  "phone": "+51999888777",
  "timezone": "America/Lima"
}

// Response 201
{
  "success": true,
  "data": {
    "tenant": { "id": "uuid", "name": "Mi Empresa SAC" },
    "user": { "id": "uuid", "email": "admin@miempresa.pe", "role": "TENANT_ADMIN" },
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG..."
  }
}
```

### POST /auth/login
Iniciar sesión.

```typescript
// Request
POST /api/v1/auth/login
{
  "email": "admin@miempresa.pe",
  "password": "SecurePass123!"
}

// Response 200
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJSUzI1NiIs...",
    "expiresIn": 900,
    "user": {
      "id": "uuid",
      "email": "admin@miempresa.pe",
      "firstName": "Carlos",
      "lastName": "López",
      "role": "TENANT_ADMIN",
      "tenantId": "uuid",
      "tenantName": "Mi Empresa SAC",
      "logoUrl": "https://..."
    }
  }
}
```

### POST /auth/refresh
Renovar access token.

```typescript
// Request
POST /api/v1/auth/refresh
{
  "refreshToken": "eyJhbGciOiJSUzI1NiIs..."
}

// Response 200
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJSUzI1NiIs...",
    "expiresIn": 900
  }
}
```

### POST /auth/logout
Cerrar sesión (revocar refresh token).

```typescript
// Request
POST /api/v1/auth/logout
Headers: { Authorization: "Bearer <token>" }
{
  "refreshToken": "eyJhbGciOiJSUzI1NiIs..."
}

// Response 200
{
  "success": true,
  "data": { "message": "Sesión cerrada exitosamente" }
}
```

### POST /auth/forgot-password
Solicitar restablecimiento de contraseña.

```typescript
// Request
POST /api/v1/auth/forgot-password
{
  "email": "admin@miempresa.pe"
}

// Response 200
{
  "success": true,
  "data": { "message": "Si el email existe, recibirás un enlace de recuperación" }
}
```

### POST /auth/reset-password
Restablecer contraseña con token.

```typescript
// Request
POST /api/v1/auth/reset-password
{
  "token": "reset-token-uuid",
  "password": "NewSecurePass123!"
}

// Response 200
{
  "success": true,
  "data": { "message": "Contraseña restablecida exitosamente" }
}
```

### GET /auth/me
Obtener información del usuario autenticado.

```typescript
// Request
GET /api/v1/auth/me
Headers: { Authorization: "Bearer <token>" }

// Response 200
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "admin@miempresa.pe",
    "firstName": "Carlos",
    "lastName": "López",
    "role": "TENANT_ADMIN",
    "isActive": true,
    "lastLoginAt": "2025-01-15T10:30:00.000Z",
    "tenant": {
      "id": "uuid",
      "name": "Mi Empresa SAC",
      "logoUrl": "https://...",
      "status": "ACTIVE"
    }
  }
}
```

---

## 🏢 Tenant

### GET /tenant
Obtener configuración de la empresa.

```typescript
// Request
GET /api/v1/tenant
Headers: { Authorization: "Bearer <token>" }

// Response 200
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Mi Empresa SAC",
    "legalName": "Mi Empresa Sociedad Anónima Cerrada",
    "rut": "20123456789",
    "email": "info@miempresa.pe",
    "phone": "+51999888777",
    "address": "Av. Principal 123, Lima",
    "logoUrl": "https://storage.example.com/logos/logo.png",
    "status": "ACTIVE",
    "maxEmployees": 100,
    "maxProjects": 30,
    "timezone": "America/Lima",
    "config": {
      "requirePhoto": false,
      "requireGps": true,
      "geofenceRadius": 100,
      "allowedIpRanges": []
    },
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### PATCH /tenant
Actualizar configuración de la empresa.

```typescript
// Request
PATCH /api/v1/tenant
Headers: { Authorization: "Bearer <token>" }
{
  "name": "Mi Empresa Actualizada SAC",
  "phone": "+51999888777",
  "address": "Av. Nueva 456, Lima",
  "config": {
    "requirePhoto": true,
    "requireGps": true
  }
}

// Response 200
{
  "success": true,
  "data": { /* tenant actualizado */ }
}
```

### POST /tenant/logo
Subir logo de la empresa.

```typescript
// Request
POST /api/v1/tenant/logo
Headers: { 
  Authorization: "Bearer <token>",
  Content-Type: "multipart/form-data"
}
Body: FormData { logo: File (jpg, png, max 2MB) }

// Response 200
{
  "success": true,
  "data": {
    "logoUrl": "https://storage.example.com/logos/uuid-logo.png"
  }
}
```

### GET /tenant/stats
Obtener estadísticas del tenant.

```typescript
// Request
GET /api/v1/tenant/stats
Headers: { Authorization: "Bearer <token>" }

// Response 200
{
  "success": true,
  "data": {
    "totalEmployees": 45,
    "activeEmployees": 42,
    "totalProjects": 8,
    "activeProjects": 6,
    "todayAttendance": 38,
    "todayLate": 3,
    "todayAbsent": 4,
    "storageUsed": "256 MB",
    "storageLimit": "5 GB"
  }
}
```

---

## 👥 Users

### GET /users
Listar usuarios del sistema (solo admin/manager).

```typescript
// Request
GET /api/v1/users?page=1&limit=20&role=MANAGER&search=Carlos
Headers: { Authorization: "Bearer <token>" }

// Response 200
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "gerente@miempresa.pe",
      "firstName": "Carlos",
      "lastName": "García",
      "role": "MANAGER",
      "isActive": true,
      "lastLoginAt": "2025-01-15T10:30:00.000Z",
      "employeeId": "uuid"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 }
}
```

### POST /users
Crear usuario del sistema.

```typescript
// Request
POST /api/v1/users
Headers: { Authorization: "Bearer <token>" }
{
  "email": "nuevo@miempresa.pe",
  "password": "SecurePass123!",
  "firstName": "Nuevo",
  "lastName": "Usuario",
  "role": "MANAGER",
  "employeeId": "uuid-opcional"
}

// Response 201
{
  "success": true,
  "data": { "id": "uuid", "email": "nuevo@miempresa.pe", "role": "MANAGER" }
}
```

### PATCH /users/:id
Actualizar usuario.

```typescript
// Request
PATCH /api/v1/users/uuid
{
  "firstName": "Actualizado",
  "role": "EMPLOYEE",
  "isActive": false
}
```

### DELETE /users/:id
Eliminar usuario.

```typescript
// Request
DELETE /api/v1/users/uuid
// Response 204 (No Content)
```

---

## 👤 Employees

### GET /employees
Listar empleados con filtros.

```typescript
// Request
GET /api/v1/employees?page=1&limit=20
  &status=ACTIVE
  &department=TI
  &search=Juan
  &projectId=uuid
  &sortBy=lastName
  &sortOrder=ASC

Headers: { Authorization: "Bearer <token>" }

// Response 200
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "code": "EMP-001",
      "firstName": "Juan",
      "lastName": "Pérez",
      "documentType": "DNI",
      "documentNumber": "12345678",
      "email": "juan@miempresa.pe",
      "phone": "+51999123456",
      "position": "Desarrollador Senior",
      "department": "TI",
      "status": "ACTIVE",
      "hireDate": "2024-01-15T00:00:00.000Z",
      "photoUrl": null,
      "workSchedule": {
        "id": "uuid",
        "name": "Horario Oficina"
      },
      "projects": [
        { "id": "uuid", "name": "Plataforma E-commerce", "role": "Tech Lead" }
      ]
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 45, "totalPages": 3 }
}
```

### POST /employees
Crear empleado.

```typescript
// Request
POST /api/v1/employees
Headers: { Authorization: "Bearer <token>" }
{
  "code": "EMP-002",
  "firstName": "María",
  "lastName": "López",
  "documentType": "DNI",
  "documentNumber": "23456789",
  "email": "maria@miempresa.pe",
  "phone": "+51999234567",
  "address": "Av. Secundaria 456, Lima",
  "position": "Diseñadora UX",
  "department": "Diseño",
  "hireDate": "2025-02-01",
  "workScheduleId": "uuid",
  "emergencyContact": "Pedro López",
  "emergencyPhone": "+51999345678",
  "photoUrl": null,
  "notes": "Conocimientos avanzados en Figma"
}

// Response 201
{
  "success": true,
  "data": { /* empleado creado */ }
}
```

### GET /employees/:id
Obtener detalle de empleado.

```typescript
// Request
GET /api/v1/employees/uuid

// Response 200
{
  "success": true,
  "data": {
    "id": "uuid",
    "firstName": "Juan",
    "lastName": "Pérez",
    "documentNumber": "12345678",
    "position": "Desarrollador Senior",
    "department": "TI",
    "status": "ACTIVE",
    "hireDate": "2024-01-15T00:00:00.000Z",
    "workSchedule": { /* schedule completo con días */ },
    "projects": [ /* lista de proyectos activos */ ],
    "todayAttendance": {
      "checkIn": "2025-01-15T08:05:00.000Z",
      "checkOut": null,
      "status": "ON_TIME"
    },
    "attendanceStats": {
      "thisMonth": {
        "total": 20,
        "onTime": 18,
        "late": 2,
        "absent": 0
      }
    }
  }
}
```

### PATCH /employees/:id
Actualizar empleado.

```typescript
// Request
PATCH /api/v1/employees/uuid
{
  "position": "Tech Lead",
  "department": "Arquitectura",
  "workScheduleId": "new-uuid",
  "status": "ACTIVE"
}
```

### DELETE /employees/:id
Desactivar empleado (soft delete - cambia a INACTIVE).

```typescript
// Request
DELETE /api/v1/employees/uuid
// Response 200
{
  "success": true,
  "data": { "message": "Empleado desactivado exitosamente" }
}
```

### POST /employees/import
Importar empleados desde Excel/CSV.

```typescript
// Request
POST /api/v1/employees/import
Headers: { 
  Authorization: "Bearer <token>",
  Content-Type: "multipart/form-data"
}
Body: FormData { 
  file: File (xlsx/csv, max 5MB),
  updateExisting: true
}

// Response 200
{
  "success": true,
  "data": {
    "imported": 45,
    "updated": 3,
    "errors": [
      { "row": 12, "error": "Documento duplicado: 12345678" }
    ]
  }
}
```

### GET /employees/export
Exportar empleados a Excel.

```typescript
// Request
GET /api/v1/employees/export?status=ACTIVE&department=TI
Headers: { Authorization: "Bearer <token>" }

// Response 200 (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)
// Archivo Excel binario
```

---

## 📍 Attendance

### POST /attendance/check-in
Registrar entrada.

```typescript
// Request
POST /api/v1/attendance/check-in
Headers: { Authorization: "Bearer <token>" }
{
  "employeeId": "uuid",
  "latitude": -12.046374,
  "longitude": -77.042793,
  "accuracy": 15,           // metros de precisión GPS
  "method": "GPS",           // GPS | MANUAL | QR
  "photo": "base64...",      // opcional, foto del momento
  "projectId": "uuid",       // opcional, proyecto al que asiste
  "deviceInfo": {
    "platform": "web",
    "userAgent": "Mozilla/5.0...",
    "ipAddress": "190.12.34.56"
  }
}

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "employeeId": "uuid",
    "checkIn": "2025-01-15T08:05:00.000Z",
    "checkInLat": -12.046374,
    "checkInLng": -77.042793,
    "checkInAddress": "Av. Principal 123, Lima",
    "status": "ON_TIME",           // ON_TIME | LATE
    "lateMinutes": 0,
    "geofenceVerified": true,
    "geofenceDistance": 45,        // metros desde el centro
    "message": "Entrada registrada - Buen día!"
  }
}
```

### POST /attendance/check-out
Registrar salida.

```typescript
// Request
POST /api/v1/attendance/check-out
Headers: { Authorization: "Bearer <token>" }
{
  "employeeId": "uuid",
  "latitude": -12.046374,
  "longitude": -77.042793,
  "accuracy": 12,
  "method": "GPS",
  "photo": "base64...",
  "notes": "Jornada completada"
}

// Response 200
{
  "success": true,
  "data": {
    "id": "uuid",
    "employeeId": "uuid",
    "checkIn": "2025-01-15T08:05:00.000Z",
    "checkOut": "2025-01-15T17:02:00.000Z",
    "status": "ON_TIME",
    "workedMinutes": 477,        // 8h - 1h break = 7h57min
    "breakMinutes": 60,
    "overtimeMinutes": 0,
    "isComplete": true,
    "message": "Salida registrada - Jornada completada"
  }
}
```

### GET /attendance
Historial de asistencia con filtros.

```typescript
// Request
GET /api/v1/attendance?page=1&limit=20
  &employeeId=uuid
  &projectId=uuid
  &dateFrom=2025-01-01
  &dateTo=2025-01-31
  &status=LATE
  &sortBy=date
  &sortOrder=DESC

// Response 200
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "date": "2025-01-15",
      "employee": {
        "id": "uuid",
        "firstName": "Juan",
        "lastName": "Pérez",
        "code": "EMP-001",
        "photoUrl": null
      },
      "checkIn": "2025-01-15T08:05:00.000Z",
      "checkOut": "2025-01-15T17:02:00.000Z",
      "checkInLat": -12.046374,
      "checkInLng": -77.042793,
      "checkOutLat": -12.046374,
      "checkOutLng": -77.042793,
      "status": "ON_TIME",
      "workedMinutes": 477,
      "lateMinutes": 0,
      "overtimeMinutes": 0,
      "isComplete": true,
      "project": {
        "id": "uuid",
        "name": "Plataforma E-commerce"
      }
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 120, "totalPages": 6 }
}
```

### GET /attendance/current
Ver estado actual del empleado (si ya marcó entrada/salida hoy).

```typescript
// Request
GET /api/v1/attendance/current
  ?employeeId=uuid
Headers: { Authorization: "Bearer <token>" }

// Response 200
{
  "success": true,
  "data": {
    "checkedIn": true,
    "checkedOut": false,
    "currentAttendance": {
      "id": "uuid",
      "checkIn": "2025-01-15T08:05:00.000Z",
      "checkInLat": -12.046374,
      "checkInLng": -77.042793,
      "status": "ON_TIME"
    },
    "todaySchedule": {
      "startTime": "08:00",
      "endTime": "17:00",
      "graceMinutes": 15,
      "isWorkingDay": true
    }
  }
}
```

### GET /attendance/summary
Resumen de asistencia.

```typescript
// Request
GET /api/v1/attendance/summary
  ?dateFrom=2025-01-01
  &dateTo=2025-01-31
  &employeeId=uuid       // opcional
  &projectId=uuid        // opcional

// Response 200
{
  "success": true,
  "data": {
    "totalRecords": 120,
    "onTime": 105,
    "late": 10,
    "absent": 5,
    "averageWorkedMinutes": 465,
    "totalOvertimeMinutes": 240,
    "recordsByDay": [
      { "date": "2025-01-15", "present": 18, "late": 2, "absent": 1 },
      { "date": "2025-01-16", "present": 20, "late": 0, "absent": 1 }
    ]
  }
}
```

---

## 📋 Projects

### GET /projects
Listar proyectos.

```typescript
// Request
GET /api/v1/projects?page=1&limit=20
  &status=ACTIVE
  &search=E-commerce
  &sortBy=name
  &sortOrder=ASC

// Response 200
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Plataforma E-commerce",
      "code": "P001",
      "description": "Desarrollo de tienda online",
      "status": "ACTIVE",
      "startDate": "2025-01-01",
      "endDate": "2025-06-30",
      "color": "#3B82F6",
      "budget": 150000.00,
      "assignedEmployees": 8,
      "totalHoursLogged": 1200,
      "completionPercentage": 65
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 8, "totalPages": 1 }
}
```

### POST /projects
Crear proyecto.

```typescript
// Request
POST /api/v1/projects
{
  "name": "App Móvil POS",
  "code": "P004",
  "description": "Sistema de punto de venta para tablets",
  "startDate": "2025-03-01",
  "endDate": "2025-08-31",
  "color": "#10B981",
  "budget": 200000.00
}
```

### GET /projects/:id
Detalle de proyecto.

```typescript
// Request
GET /api/v1/projects/uuid

// Response 200
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Plataforma E-commerce",
    "code": "P001",
    "status": "ACTIVE",
    "assignedEmployees": [
      {
        "id": "uuid",
        "firstName": "Juan",
        "lastName": "Pérez",
        "role": "Tech Lead",
        "hoursThisMonth": 160,
        "totalHours": 480
      }
    ],
    "attendanceStats": {
      "totalHoursLogged": 1200,
      "hoursThisMonth": 320,
      "overtimeHours": 45,
      "employeeCount": 8
    },
    "progress": {
      "plannedHours": 2000,
      "actualHours": 1200,
      "completionPercentage": 65
    }
  }
}
```

### PATCH /projects/:id
Actualizar proyecto.

### POST /projects/:id/assign
Asignar empleados al proyecto.

```typescript
// Request
POST /api/v1/projects/uuid/assign
{
  "employeeId": "uuid",
  "role": "Frontend Developer",
  "hourlyRate": 35.00,
  "startDate": "2025-03-01",
  "endDate": "2025-08-31"
}
```

### DELETE /projects/:id/assign/:assignmentId
Remover asignación de empleado.

---

## 📊 Reports

### POST /reports/attendance
Generar reporte de asistencia.

```typescript
// Request
POST /api/v1/reports/attendance
Headers: { Authorization: "Bearer <token>" }
{
  "format": "pdf",              // pdf | excel | csv
  "dateFrom": "2025-01-01",
  "dateTo": "2025-01-31",
  "employeeId": "uuid",         // opcional: todos si no se especifica
  "projectId": "uuid",          // opcional
  "groupBy": "employee",        // employee | project | day
  "includeDetails": true,
  "includeSummary": true
}

// Response 200
{
  "success": true,
  "data": {
    "reportId": "uuid",
    "status": "GENERATING",     // GENERATING | READY | FAILED
    "url": null,                 // disponible cuando status = READY
    "message": "Reporte en proceso, recibirás una notificación"
  }
}
```

### GET /reports/:id/status
Ver estado del reporte.

```typescript
// Request
GET /api/v1/reports/uuid/status

// Response 200
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "READY",
    "progress": 100,
    "url": "https://storage.example.com/reports/uuid-report.pdf",
    "expiresAt": "2025-02-14T10:30:00.000Z",
    "fileSize": "2.4 MB",
    "format": "pdf"
  }
}
```

### POST /reports/employees
Generar reporte de empleados.

```typescript
// Request
POST /api/v1/reports/employees
{
  "format": "excel",
  "status": "ACTIVE",
  "department": "TI",
  "includeAttendance": true
}
```

### POST /reports/projects
Generar reporte de proyectos.

```typescript
// Request
POST /api/v1/reports/projects
{
  "format": "excel",
  "status": "ACTIVE",
  "includeFinancials": true
}
```

### POST /reports/overtime
Generar reporte de horas extra.

---

## 📍 Geolocation

### GET /geolocation/fences
Listar cercas virtuales.

```typescript
// Request
GET /api/v1/geolocation/fences

// Response 200
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Oficina Principal",
      "address": "Av. Principal 123, Lima",
      "latitude": -12.046374,
      "longitude": -77.042793,
      "radius": 100,
      "isActive": true,
      "workSchedule": {
        "id": "uuid",
        "name": "Horario Oficina"
      }
    }
  ]
}
```

### POST /geolocation/fences
Crear cerca virtual.

```typescript
// Request
POST /api/v1/geolocation/fences
{
  "name": "Sucursal Sur",
  "address": "Av. Sur 789, Lima",
  "latitude": -12.125000,
  "longitude": -77.030000,
  "radius": 150,
  "workScheduleId": "uuid"    // opcional
}
```

### PATCH /geolocation/fences/:id
Actualizar cerca virtual.

### DELETE /geolocation/fences/:id
Eliminar cerca virtual.

### POST /geolocation/verify
Verificar si una ubicación está dentro de una geocerca.

```typescript
// Request
POST /api/v1/geolocation/verify
{
  "latitude": -12.046374,
  "longitude": -77.042793,
  "fenceId": "uuid"            // opcional: verifica en todas si no se especifica
}

// Response 200
{
  "success": true,
  "data": {
    "isInside": true,
    "distance": 45,            // metros desde el centro
    "fence": {
      "id": "uuid",
      "name": "Oficina Principal",
      "latitude": -12.046374,
      "longitude": -77.042793,
      "radius": 100
    }
  }
}
```

---

## ⏰ Overtime

### POST /overtime/request
Solicitar horas extra.

```typescript
// Request
POST /api/v1/overtime/request
{
  "employeeId": "uuid",
  "date": "2025-01-15",
  "startTime": "18:00",
  "endTime": "20:30",
  "reason": "Entrega de sprint",
  "attendanceId": "uuid"      // opcional: vinculado a asistencia
}
```

### GET /overtime
Listar solicitudes de horas extra.

```typescript
// Request
GET /api/v1/overtime?page=1&limit=20
  &employeeId=uuid
  &status=PENDING
  &dateFrom=2025-01-01
  &dateTo=2025-01-31

// Response 200
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "employee": {
        "id": "uuid",
        "firstName": "Juan",
        "lastName": "Pérez"
      },
      "date": "2025-01-15",
      "startTime": "18:00",
      "endTime": "20:30",
      "totalMinutes": 150,
      "reason": "Entrega de sprint",
      "status": "PENDING",
      "createdAt": "2025-01-15T17:30:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 12, "totalPages": 1 }
}
```

### PATCH /overtime/:id/approve
Aprobar/rechazar solicitud.

```typescript
// Request
PATCH /api/v1/overtime/uuid/approve
{
  "status": "APPROVED",        // APPROVED | REJECTED
  "notes": "Aprobado, trabajo urgente del proyecto"
}
```

---

## 📝 Audit

### GET /audit/logs
Listar logs de auditoría.

```typescript
// Request
GET /api/v1/audit/logs?page=1&limit=50
  &userId=uuid
  &action=CREATE
  &entity=employee
  &entityId=uuid
  &dateFrom=2025-01-01
  &dateTo=2025-01-31
  &sortBy=createdAt
  &sortOrder=DESC

// Response 200
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "email": "admin@miempresa.pe",
        "firstName": "Admin",
        "lastName": "Principal"
      },
      "action": "CREATE",
      "entity": "employee",
      "entityId": "uuid",
      "description": "Creó empleado: Juan Pérez",
      "newValue": { "firstName": "Juan", "lastName": "Pérez", "position": "Developer" },
      "ipAddress": "190.12.34.56",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 50, "total": 1250, "totalPages": 25 }
}
```

### GET /audit/stats
Estadísticas de auditoría.

```typescript
// Request
GET /api/v1/audit/stats
  &dateFrom=2025-01-01
  &dateTo=2025-01-31

// Response 200
{
  "success": true,
  "data": {
    "totalActions": 1250,
    "byAction": {
      "CREATE": 150,
      "UPDATE": 200,
      "DELETE": 10,
      "LOGIN": 300,
      "CHECK_IN": 400,
      "CHECK_OUT": 380,
      "EXPORT": 10
    },
    "byUser": [
      { "userId": "uuid", "name": "Admin Principal", "count": 450 },
      { "userId": "uuid", "name": "Carlos García", "count": 280 }
    ],
    "mostActiveDay": "2025-01-15",
    "peakHour": "08:00-09:00"
  }
}
```

---

## ❤️ Health

### GET /health
Verificar estado del servidor.

```typescript
// Request
GET /api/v1/health

// Response 200
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptime": 1234567,
    "version": "1.0.0",
    "timestamp": "2025-01-15T10:30:00.000Z",
    "checks": {
      "database": { "status": "healthy", "latencyMs": 5 },
      "redis": { "status": "healthy", "latencyMs": 2 },
      "storage": { "status": "healthy", "latencyMs": 15 }
    }
  }
}
```

### GET /health/ready
Readiness check (para K8s).

```typescript
// Response 200 | 503
{
  "status": "ready",
  "checks": {
    "database": "connected",
    "redis": "connected",
    "queue": "connected"
  }
}
```

---

## 📐 Matriz de Permisos por Endpoint

| Endpoint | SUPER_ADMIN | TENANT_ADMIN | MANAGER | EMPLOYEE |
|----------|:-----------:|:------------:|:-------:|:--------:|
| **Auth** | | | | |
| POST /auth/register | ✅ | ❌ | ❌ | ❌ |
| POST /auth/login | ✅ | ✅ | ✅ | ✅ |
| POST /auth/refresh | ✅ | ✅ | ✅ | ✅ |
| POST /auth/logout | ✅ | ✅ | ✅ | ✅ |
| GET /auth/me | ✅ | ✅ | ✅ | ✅ |
| **Tenant** | | | | |
| GET /tenant | ✅ | ✅ | ❌ | ❌ |
| PATCH /tenant | ✅ | ✅ | ❌ | ❌ |
| POST /tenant/logo | ✅ | ✅ | ❌ | ❌ |
| GET /tenant/stats | ✅ | ✅ | ✅ | ❌ |
| **Users** | | | | |
| GET /users | ✅ | ✅ | ✅ | ❌ |
| POST /users | ✅ | ✅ | ❌ | ❌ |
| PATCH /users/:id | ✅ | ✅ | ❌ | ❌ |
| DELETE /users/:id | ✅ | ✅ | ❌ | ❌ |
| **Employees** | | | | |
| GET /employees | ✅ | ✅ | ✅ | ❌ |
| GET /employees/:id | ✅ | ✅ | ✅ | ✅ (propio) |
| POST /employees | ✅ | ✅ | ✅ | ❌ |
| PATCH /employees/:id | ✅ | ✅ | ✅ | ❌ |
| DELETE /employees/:id | ✅ | ✅ | ✅ | ❌ |
| POST /employees/import | ✅ | ✅ | ❌ | ❌ |
| **Attendance** | | | | |
| POST /attendance/check-in | ✅ | ✅ | ✅ | ✅ |
| POST /attendance/check-out | ✅ | ✅ | ✅ | ✅ |
| GET /attendance | ✅ | ✅ | ✅ | ✅ (propio) |
| GET /attendance/current | ✅ | ✅ | ✅ | ✅ |
| GET /attendance/summary | ✅ | ✅ | ✅ | ❌ |
| **Projects** | | | | |
| GET /projects | ✅ | ✅ | ✅ | ❌ |
| POST /projects | ✅ | ✅ | ✅ | ❌ |
| PATCH /projects/:id | ✅ | ✅ | ✅ | ❌ |
| POST /projects/:id/assign | ✅ | ✅ | ✅ | ❌ |
| **Reports** | | | | |
| POST /reports/* | ✅ | ✅ | ✅ | ❌ |
| **Geolocation** | | | | |
| GET /geolocation/fences | ✅ | ✅ | ✅ | ❌ |
| POST /geolocation/fences | ✅ | ✅ | ✅ | ❌ |
| POST /geolocation/verify | ✅ | ✅ | ✅ | ✅ |
| **Overtime** | | | | |
| GET /overtime | ✅ | ✅ | ✅ | ✅ (propio) |
| POST /overtime/request | ✅ | ✅ | ✅ | ✅ |
| PATCH /overtime/:id/approve | ✅ | ✅ | ✅ | ❌ |
| **Audit** | | | | |
| GET /audit/logs | ✅ | ✅ | ❌ | ❌ |
| GET /audit/stats | ✅ | ✅ | ❌ | ❌ |

## 📦 Resumen de Endpoints

| Módulo | Endpoints | Descripción |
|--------|-----------|-------------|
| **Auth** | 7 | Register, Login, Refresh, Logout, Forgot, Reset, Me |
| **Tenant** | 4 | Get, Update, Logo, Stats |
| **Users** | 4 | List, Create, Update, Delete |
| **Employees** | 7 | List, Create, Get, Update, Delete, Import, Export |
| **Attendance** | 5 | CheckIn, CheckOut, History, Current, Summary |
| **Projects** | 6 | List, Create, Get, Update, Assign, Remove |
| **Reports** | 5 | Attendance, Employees, Projects, Overtime, Status |
| **Geolocation** | 4 | List, Create, Update, Delete, Verify |
| **Overtime** | 3 | Request, List, Approve |
| **Audit** | 2 | Logs, Stats |
| **Health** | 2 | Health, Readiness |
| **Total** | **~50** | |
