// ==========================================================================
// DTO - Geocercas y ubicaciones
// ==========================================================================

import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGeoFenceDto {
  @ApiProperty({ description: 'Nombre de la geocerca' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ description: 'Latitud del centro', example: -12.046374 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ description: 'Longitud del centro', example: -77.042793 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty({ description: 'Radio en metros', example: 100 })
  @IsNumber()
  @Min(10)
  @Max(5000)
  radius: number;

  @ApiPropertyOptional({ description: 'Color para UI' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ description: 'Dirección o referencia' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'WorkSchedule ID asociado' })
  @IsOptional()
  @IsString()
  workScheduleId?: string;
}

export class UpdateGeoFenceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  radius?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  workScheduleId?: string;
}

export class VerifyLocationDto {
  @ApiProperty({ description: 'Latitud GPS' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ description: 'Longitud GPS' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiPropertyOptional({ description: 'ID de geocerca específica' })
  @IsOptional()
  @IsString()
  geoFenceId?: string;

  @ApiPropertyOptional({ description: 'ID del empleado' })
  @IsOptional()
  @IsString()
  employeeId?: string;
}
