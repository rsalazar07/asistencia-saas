// ==========================================================================
// DTO - Solicitudes de horas extra
// ==========================================================================

import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum OvertimeStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export class CreateOvertimeDto {
  @ApiProperty({ description: 'ID del empleado' })
  @IsString()
  employeeId: string;

  @ApiProperty({ description: 'Fecha de la hora extra' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Minutos solicitados', example: 120 })
  @IsNumber()
  @Min(15)
  @Max(480)
  requestedMinutes: number;

  @ApiProperty({ description: 'Motivo/justificación' })
  @IsString()
  reason: string;

  @ApiPropertyOptional({ description: 'ID del proyecto asociado' })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({ enum: ['PRE_APPROVED', 'TIME_BANK', 'COMPENSATORY'], default: 'PRE_APPROVED' })
  @IsOptional()
  @IsString()
  overtimeType?: string = 'PRE_APPROVED';
}

export class UpdateOvertimeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(15)
  @Max(480)
  requestedMinutes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ enum: OvertimeStatus })
  @IsOptional()
  @IsEnum(OvertimeStatus)
  status?: OvertimeStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

export class ApproveOvertimeDto {
  @ApiProperty({ description: 'Minutos aprobados' })
  @IsNumber()
  @Min(15)
  @Max(480)
  approvedMinutes: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class OvertimeFilterDto {
  @ApiPropertyOptional({ enum: OvertimeStatus })
  @IsOptional()
  @IsEnum(OvertimeStatus)
  status?: OvertimeStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
