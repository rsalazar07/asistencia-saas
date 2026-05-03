// ==========================================================================
// Decorador @Permissions() - Restringe acceso por permisos específicos
// ==========================================================================
// Uso: @Permissions('employees:write') @Post() create() {}
// ==========================================================================

import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
