// ==========================================================================
// DTO para Registro de Nueva Empresa
// ==========================================================================

import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Nombre comercial de la empresa',
    example: 'Mi Empresa SAC',
  })
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  companyName: string;

  @ApiPropertyOptional({
    description: 'Razón social de la empresa',
    example: 'Mi Empresa Sociedad Anónima Cerrada',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  legalName?: string;

  @ApiPropertyOptional({
    description: 'RUC / Identificación fiscal',
    example: '20123456789',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{11}$/, { message: 'El RUC debe tener 11 dígitos' })
  rut?: string;

  @ApiProperty({
    description: 'Email del administrador',
    example: 'admin@miempresa.pe',
  })
  @IsEmail({}, { message: 'El email no tiene un formato válido' })
  adminEmail: string;

  @ApiProperty({
    description: 'Contraseña del administrador',
    example: 'SecurePass123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(128, { message: 'La contraseña no puede exceder 128 caracteres' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
    {
      message:
        'La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales',
    },
  )
  adminPassword: string;

  @ApiProperty({
    description: 'Nombre del administrador',
    example: 'Carlos',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  adminFirstName: string;

  @ApiProperty({
    description: 'Apellido del administrador',
    example: 'López',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  adminLastName: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto',
    example: '+51999888777',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Zona horaria',
    example: 'America/Lima',
    default: 'America/Lima',
  })
  @IsOptional()
  @IsString()
  timezone?: string;
}
