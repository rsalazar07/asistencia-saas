// ==========================================================================
// DTO para Refresh Token
// ==========================================================================

import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token para renovar el access token',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsUUID('4', { message: 'El refresh token no es válido' })
  refreshToken: string;
}
