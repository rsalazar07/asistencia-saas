// ==========================================================================
// Decorador @CurrentUser() - Obtiene el usuario autenticado
// ==========================================================================
// Uso: @Get('profile') getProfile(@CurrentUser() user: JwtPayload) {}
// ==========================================================================

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Si se solicita un campo específico, retornar solo ese campo
    if (data && user) {
      return user[data];
    }

    return user;
  },
);
