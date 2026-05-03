// ==========================================================================
// JWT Refresh Strategy - Passport Strategy para Refresh Tokens
// ==========================================================================

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private configService: ConfigService) {
    const jwtSecret = configService.get<string>(
      'auth.jwt.refreshToken.secret',
    );

    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
      algorithms: [
        configService.get<string>('auth.jwt.refreshToken.algorithm') as any,
      ],
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const refreshToken = req.body?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token no proporcionado');
    }

    return {
      ...payload,
      refreshToken,
    };
  }
}
