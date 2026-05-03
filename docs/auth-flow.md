# 🔐 Sistema de Autenticación - Asistencia SaaS

## Arquitectura de Autenticación

```
┌─────────────────────────────────────────────────────────────────┐
│                    DIAGRAMA DE FLUJO COMPLETO                    │
└─────────────────────────────────────────────────────────────────┘

REGISTRO:
┌──────┐     ┌──────────┐     ┌──────────┐     ┌──────────────┐
│ User │────►│ Auth     │────►│ Prisma   │────►│ PostgreSQL   │
│      │     │ Service  │     │ Service  │     │              │
│      │     │          │     │          │     │ • Tenant     │
│      │     │ 1. Valid.│     │ 1. Crear │     │ • User       │
│      │     │ 2. Hash  │     │    TX    │     │ • Session    │
│      │     │    pwd   │     │ 2. Commit│     │              │
│      │     │ 3. JWT   │     │          │     │              │
│      │◄────│ 4. Return│     │          │     │              │
│      │     │    token │     │          │     │              │
└──────┘     └──────────┘     └──────────┘     └──────────────┘

LOGIN:
┌──────┐     ┌──────────┐     ┌──────────┐     ┌──────────────┐
│ User │────►│ Auth     │────►│ Prisma   │────►│ PostgreSQL   │
│      │     │ Service  │     │ Service  │     │              │
│      │     │          │     │          │     │ • Find user  │
│      │     │ 1. Find  │     │ 1. Query │     │ • Get tenant │
│      │     │    user  │────►│    user  │────►│              │
│      │     │ 2. Verify│     │          │     │              │
│      │     │    pwd   │     │          │     │              │
│      │     │ 3. Gen   │     │          │     │              │
│      │     │    tokens│     │          │     │              │
│      │◄────│ 4. Save  │     │ 2. Save  │────►│ • Session    │
│      │     │    sess. │◄────│ session  │     │              │
│      │     │ 5. Return│     │          │     │              │
│      │     │    tokens│     │          │     │              │
└──────┘     └──────────┘     └──────────┘     └──────────────┘

CADA REQUEST:
┌──────┐     ┌──────────┐     ┌──────────┐     ┌──────────────┐
│ User │────►│ JWT Auth │────►│ Tenant   │────►│ Controller   │
│      │     │ Guard    │     │ Guard    │     │              │
│      │     │          │     │          │     │              │
│      │     │ 1. Verify│     │ 2. Inject│     │ 3. Process   │
│      │     │    JWT   │     │    tenant│     │    request   │
│      │     │ 2. Extract│    │ 3. Verify│     │ 4. Return    │
│      │◄────│    user   │     │    access│     │    response  │
│      │     │ 3. Attach │     │          │     │              │
│      │     │    to req │     │          │     │              │
└──────┘     └──────────┘     └──────────┘     └──────────────┘
```

## Tokens

### Access Token (JWT)

```typescript
// Header
{
  "alg": "RS256",
  "typ": "JWT"
}

// Payload
{
  "sub": "user-uuid",                    // ID del usuario
  "email": "admin@empresa.pe",          // Email
  "tenantId": "tenant-uuid",            // ID de la empresa
  "tenantName": "Mi Empresa SAC",       // Nombre de la empresa
  "role": "TENANT_ADMIN",              // Rol del usuario
  "permissions": ["employees:read", "employees:write", ...],
  "iat": 1736932200,                    // Emitido
  "exp": 1736933100                     // Expira (15 min)
}

// Firma: RSA256 (RS256) con clave privada
```

### Refresh Token

```typescript
// Almacenado en BD (no JWT - más seguro)
{
  "id": "session-uuid",
  "userId": "user-uuid",
  "refreshToken": "uuid-v4",           // Token aleatorio
  "deviceInfo": "Mozilla/5.0...",
  "ipAddress": "190.12.34.56",
  "expiresAt": "2025-01-22T10:30:00Z", // 7 días
  "isRevoked": false
}

// En el cliente: almacenado en httpOnly cookie o localStorage seguro
```

## Flujo Completo de Autenticación

### 1. Registro de Nueva Empresa

```typescript
POST /api/v1/auth/register

// 1. Validar datos de entrada (class-validator)
// 2. Verificar que email no exista
// 3. Iniciar transacción:
//    a. Crear Tenant (empresa)
//    b. Crear horario laboral default
//    c. Crear usuario TENANT_ADMIN
//    d. Hashear contraseña (bcrypt, 12 rounds)
// 4. Generar tokens:
//    - Access Token (15 min)
//    - Refresh Token (7 días)
// 5. Guardar sesión en BD
// 6. Retornar tokens + datos del usuario
```

### 2. Login

```typescript
POST /api/v1/auth/login

// 1. Validar email + password
// 2. Buscar usuario por email
// 3. Verificar contraseña con bcrypt
// 4. Verificar que el tenant esté ACTIVO
// 5. Verificar que el usuario esté ACTIVO
// 6. Actualizar lastLoginAt
// 7. Generar nuevos tokens
// 8. Guardar sesión
// 9. Retornar tokens + datos de usuario + tenant
```

### 3. Request Autenticado

```typescript
GET /api/v1/employees
Authorization: Bearer <access_token>

// 1. JwtAuthGuard:
//    a. Extraer token del header
//    b. Verificar firma RSA256
//    c. Verificar expiración
//    d. Extraer payload
//    e. Buscar usuario en BD (opcional, cache)
//    f. Adjuntar user a request

// 2. TenantGuard:
//    a. Extraer tenantId del JWT
//    b. Verificar que el tenant exista y esté activo
//    c. Inyectar tenantId en todas las queries

// 3. RolesGuard (opcional):
//    a. Verificar que el rol tenga acceso al endpoint
//    b. Denegar con 403 si no tiene permisos

// 4. Controller procesa la request
```

### 4. Refresh Token

```typescript
POST /api/v1/auth/refresh

// 1. Recibir refresh token del body
// 2. Buscar sesión por refreshToken
// 3. Validar:
//    a. Sesión existe
//    b. No está revocada
//    c. No ha expirado
// 4. Revocar sesión actual
// 5. Generar nuevos tokens:
//    - Nuevo Access Token
//    - Nuevo Refresh Token
// 6. Guardar nueva sesión
// 7. Retornar nuevos tokens
```

### 5. Logout

```typescript
POST /api/v1/auth/logout

// 1. Recibir refresh token
// 2. Marcar sesión como revocada (isRevoked = true)
// 3. Retornar confirmación
```

## Seguridad

### Protección de Contraseñas

```typescript
import * as bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### Políticas de Contraseñas

```typescript
const PASSWORD_POLICY = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true,
  passwordHistory: 5,       // No repetir últimas 5
  maxAttempts: 5,            // Bloquear tras 5 intentos
  lockoutDuration: 15 * 60,  // 15 minutos
  expiryDays: 90,            // Expira cada 90 días
};
```

### Rate Limiting

```typescript
// Por endpoint
{
  "/auth/login": { windowMs: 15 * 60 * 1000, max: 5 },    // 5 intentos/15min
  "/auth/register": { windowMs: 60 * 60 * 1000, max: 3 }, // 3 registros/hora
  "/auth/forgot-password": { windowMs: 60 * 60 * 1000, max: 3 },
  "/api/*": { windowMs: 60 * 1000, max: 100 }              // 100 req/min general
}
```

### Headers de Seguridad (Helmet)

```typescript
{
  "Content-Security-Policy": "default-src 'self'",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(self), camera=(self)"
}
```

## Estructura de Archivos de Auth

```
src/modules/auth/
├── auth.module.ts              # Módulo NestJS
├── auth.controller.ts          # Endpoints de auth
├── auth.service.ts             # Lógica de negocio
├── strategies/
│   ├── jwt.strategy.ts         # Estrategia JWT (Passport)
│   └── jwt-refresh.strategy.ts # Estrategia Refresh
├── guards/
│   ├── jwt-auth.guard.ts       # Guard de JWT
│   └── local-auth.guard.ts     # Guard local
├── dto/
│   ├── login.dto.ts            # Validación login
│   ├── register.dto.ts         # Validación registro
│   ├── refresh-token.dto.ts    # Validación refresh
│   ├── forgot-password.dto.ts  # Validación forgot
│   └── reset-password.dto.ts   # Validación reset
└── tests/
    └── auth.service.spec.ts    # Tests unitarios
```

## Configuración JWT

```typescript
// src/config/auth.config.ts
export default () => ({
  jwt: {
    accessToken: {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
      algorithm: 'RS256',
    },
    refreshToken: {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
      algorithm: 'RS256',
    },
  },
  bcrypt: {
    saltRounds: 12,
  },
  session: {
    maxDevices: 5,             // Máximo 5 sesiones simultáneas
  },
});
```

## Middleware Chain

```typescript
// Orden de ejecución en cada request
@Controller('api/v1')
@UseGuards(JwtAuthGuard)       // 1. Verificar JWT
@UseGuards(TenantGuard)        // 2. Validar tenant
@UseGuards(RolesGuard)         // 3. Verificar rol
@UseInterceptors(LoggingInterceptor)   // 4. Logging
@UseInterceptors(TransformInterceptor) // 5. Transformar respuesta
export class AppController {}
```

## Decoradores Personalizados

```typescript
// @CurrentUser() - Obtener usuario autenticado
@Get('profile')
getProfile(@CurrentUser() user: UserEntity) {
  return user;
}

// @Roles('ADMIN') - Restringir por rol
@Post('employees')
@Roles('TENANT_ADMIN', 'MANAGER')
createEmployee() {}

// @Public() - Endpoint público (sin JWT)
@Public()
@Post('auth/login')
login() {}

// @Permissions('employees:write') - Permiso específico
@Delete('employees/:id')
@Permissions('employees:delete')
deleteEmployee() {}
```

## Manejo de Errores de Auth

```typescript
@Catch(UnauthorizedException)
export class AuthExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(401).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: this.getErrorMessage(exception),
        timestamp: new Date().toISOString(),
      },
    });
  }

  private getErrorMessage(exception: UnauthorizedException): string {
    const response = exception.getResponse() as any;
    
    switch (response.message) {
      case 'jwt expired':
        return 'Token expirado, por favor renueve su sesión';
      case 'invalid signature':
        return 'Token inválido';
      case 'jwt malformed':
        return 'Formato de token incorrecto';
      default:
        return 'No autorizado';
    }
  }
}
```
