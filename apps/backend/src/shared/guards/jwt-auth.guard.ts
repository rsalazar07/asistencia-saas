// ==========================================================================
// JWT Auth Guard - Protege rutas con autenticación JWT
// ==========================================================================

import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    // Verificar si la ruta está marcada como @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context) as boolean | Promise<boolean>;
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      let message = 'No autorizado';

      if (info) {
        switch (info.name) {
          case 'TokenExpiredError':
            message = 'Token expirado, por favor renueve su sesión';
            break;
          case 'JsonWebTokenError':
            message = 'Token inválido';
            break;
          case 'NotBeforeError':
            message = 'Token no está activo todavía';
            break;
          default:
            message = info.message || 'Token inválido';
        }
      }

      throw err || new UnauthorizedException(message);
    }

    return user;
  }
}
