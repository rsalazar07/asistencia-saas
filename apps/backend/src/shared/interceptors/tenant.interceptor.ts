// ==========================================================================
// Tenant Interceptor - Inyecta tenantId en todas las queries de Prisma
// ==========================================================================

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.tenantId;

    // Adjuntar tenantId al request para que los servicios lo usen
    request.tenantId = tenantId;

    return next.handle();
  }
}
