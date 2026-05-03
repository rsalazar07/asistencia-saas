// ==========================================================================
// Interface para el Payload del JWT
// ==========================================================================

export interface JwtPayload {
  /** ID del usuario (sub) */
  sub: string;

  /** Email del usuario */
  email: string;

  /** ID del tenant */
  tenantId: string;

  /** Nombre del tenant */
  tenantName: string;

  /** Rol del usuario */
  role: 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'MANAGER' | 'EMPLOYEE';

  /** Lista de permisos */
  permissions: string[];

  /** Emitido en (timestamp) */
  iat?: number;

  /** Expira en (timestamp) */
  exp?: number;
}
