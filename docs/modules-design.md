# 🧩 Diseño de Módulos - Asistencia SaaS

## Resumen de Módulos Implementados

| # | Módulo | Estado | Archivos | SLOC |
|---|--------|--------|----------|------|
| 1 | **Auth** | ✅ Completo | 12 | ~1,200 |
| 2 | **Tenant** | ✅ Completo | 5 | ~800 |
| 3 | **Employee** | ✅ Completo | 6 | ~1,500 |
| 4 | **Attendance** | ✅ Completo | 7 | ~2,500 |
| 5 | **Project** | ✅ Completo | 6 | ~1,800 |
| 6 | **Audit** | ✅ Completo | 2 | ~150 |
| | **Shared** | ✅ Completo | 17 | ~2,500 |
| | **Config** | ✅ Completo | 3 | ~400 |
| | **Prisma** | ✅ Completo | 2 | ~100 |
| | **Total** | | **~60** | **~11,000** |

## Diagrama de Dependencias entre Módulos

```
┌─────────────────────────────────────────────────────────────────┐
│                        APP MODULE                               │
│  (Configuración global, Guards, Interceptors, Filters)           │
└─────────────────────────────────────────────────────────────────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  PrismaModule │ │  AuditModule  │ │  Throttler   │ │  Schedule    │
│  (Global)     │ │  (Global)     │ │  (Rate Lim.) │ │  (Cron)      │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
         │              │
         ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     MÓDULOS DE DOMINIO                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┐    ┌──────────┐    ┌───────────┐    ┌──────────┐  │
│  │  Auth   │───►│  Tenant  │───►│ Employee  │───►│Attendance│  │
│  │         │    │          │    │           │    │          │  │
│  │ JWT     │    │ Settings │    │ CRUD      │    │ CheckIn  │  │
│  │ Register│    │ Config   │    │ Import    │    │ CheckOut │  │
│  │ Login   │    │ Stats    │    │ Validación │    │ Geofence │  │
│  │ Refresh │    │ Logo     │    │          │    │          │  │
│  └─────────┘    └──────────┘    └───────────┘    └──────────┘  │
│                                        │              │          │
│                                        ▼              ▼          │
│                                ┌───────────┐    ┌──────────┐    │
│                                │  Project  │◄───│ Overtime │    │
│                                │           │    │          │    │
│                                │ CRUD      │    │ Requests │    │
│                                │ Asignación│    │ Approval │    │
│                                │ Costos    │    │ Cálculo  │    │
│                                └───────────┘    └──────────┘    │
│                                      │                          │
│                                      ▼                          │
│                              ┌───────────────┐                  │
│                              │    Report     │                  │
│                              │               │                  │
│                              │Daily/Monthly   │                  │
│                              │Employee/Dept   │                  │
│                              │Export (JSON)   │                  │
│                              └───────────────┘                  │
│                                                                  │
│  ┌────────────────┐    ┌──────────────┐                         │
│  │  Geolocation   │    │   Health     │                         │
│  │                │    │              │                         │
│  │ GeoFence CRUD  │    │ System Check │                         │
│  │ Verify Loc     │    │ Liveness     │                         │
│  │ Distance Calc  │    │ Readiness    │                         │
│  └────────────────┘    └──────────────┘                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

## Capas por Módulo

Cada módulo sigue la misma estructura de Clean Architecture:

```
{module}/
├── {module}.module.ts          ← Configuración del módulo NestJS
├── {module}.controller.ts      ← Endpoints HTTP (Router)
├── {module}.service.ts         ← Lógica de negocio
├── dto/                        ← Data Transfer Objects
│   ├── create-{entity}.dto.ts
│   ├── update-{entity}.dto.ts
│   └── {entity}-filter.dto.ts
├── validators/                 ← Validaciones específicas
│   ├── document.validator.ts
│   ├── geofence.validator.ts
│   └── time.validator.ts
└── tests/                      ← Tests unitarios
    └── {module}.service.spec.ts
```

## Patrones de Diseño Utilizados

### 1. Repository Pattern (via Prisma)
```typescript
// PrismaService actúa como Repository
@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) {}
  
  async findAll(tenantId: string) {
    return this.prisma.employee.findMany({
      where: { tenantId },
    });
  }
}
```

### 2. Dependency Injection (NestJS)
```typescript
// Inversión de dependencias
@Module({
  providers: [EmployeeService],  // Registrar
  controllers: [EmployeeController],
  exports: [EmployeeService],    // Exportar
})
export class EmployeeModule {}
```

### 3. DTO Pattern (class-validator)
```typescript
// Validación en la capa de transporte
export class CreateEmployeeDto {
  @IsString()
  @MinLength(2)
  firstName: string;
  
  @IsEmail()
  email: string;
}
```

### 4. Strategy Pattern (Passport)
```typescript
// Diferentes estrategias de autenticación
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  async validate(payload: JwtPayload) { /* ... */ }
}
```

### 5. Guard Pattern
```typescript
// Protección de rutas
@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean { /* ... */ }
}
```

## Flujo de una Operación Típica

Ejemplo: **Crear empleado**

```
1. HTTP POST /api/v1/employees
       │
       ▼
2. JwtAuthGuard           → Verifica JWT, extrae tenantId
       │
       ▼
3. TenantGuard            → Inyecta tenantId en request
       │
       ▼
4. RolesGuard             → Verifica rol TENANT_ADMIN o MANAGER
       │
       ▼
5. PermissionsGuard       → Verifica permiso employees:write
       │
       ▼
6. ValidationPipe         → Valida CreateEmployeeDto
       │
       ▼
7. EmployeeController     → Llama a EmployeeService.create()
       │
       ▼
8. EmployeeService        → Lógica de negocio
   ├── Validar documento (DocumentValidator)
   ├── Verificar duplicados
   ├── Crear en BD (Prisma)
   ├── Audit log (AuditService)
   └── Retornar resultado
       │
       ▼
9. TransformInterceptor   → Envuelve en { success, data, timestamp }
       │
       ▼
10. HTTP 201 Created      → Respuesta al cliente
```
