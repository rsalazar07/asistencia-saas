// ==========================================================================
// Decorador @Roles() - Restringe acceso por roles
// ==========================================================================
// Uso: @Roles('TENANT_ADMIN', 'MANAGER') @Post() create() {}
// ==========================================================================

import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
