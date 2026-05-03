// ==========================================================================
// Tenant Guard - Aísla datos por tenant en cada request
// ==========================================================================

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    // Skip if route is @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const user = request.user;

    // SUPER_ADMIN puede acceder a cualquier tenant
    if (user.role === 'SUPER_ADMIN') {
      // Si se especifica X-Tenant-Id en el header, usar ese
      const headerTenantId = request.headers['x-tenant-id'];
      if (headerTenantId) {
        request.tenantId = headerTenantId;
      } else {
        request.tenantId = user.tenantId;
      }
      return true;
    }

    // Para el resto, inyectar su tenantId del JWT
    if (!user.tenantId) {
      throw new ForbiddenException('Usuario no tiene tenant asignado');
    }

    request.tenantId = user.tenantId;
    return true;
  }
}
