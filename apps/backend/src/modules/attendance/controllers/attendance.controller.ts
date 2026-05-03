// ==========================================================================
// Attendance Controller - Endpoints de asistencia
// ==========================================================================

import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AttendanceService } from '../services/attendance.service';
import { CheckInDto, CheckOutDto, AttendanceFilterDto, AttendanceSummaryDto } from '../dto/attendance.dto';
import { PaginationDto } from '../../../shared/dto/pagination.dto';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Permissions } from '../../../shared/decorators/permissions.decorator';
import { Public } from '../../../shared/decorators/public.decorator';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';

@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  @UseGuards(JwtAuthGuard)
  @Permissions('attendance:write')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar entrada (check-in)' })
  async checkIn(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CheckInDto,
  ) {
    return this.attendanceService.checkIn(tenantId, dto, userId);
  }

  @Post('check-out')
  @UseGuards(JwtAuthGuard)
  @Permissions('attendance:write')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar salida (check-out)' })
  async checkOut(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CheckOutDto,
  ) {
    return this.attendanceService.checkOut(tenantId, dto, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TENANT_ADMIN', 'MANAGER')
  @Permissions('attendance:read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Historial de asistencia' })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query() pagination: PaginationDto,
    @Query() filter: AttendanceFilterDto,
  ) {
    return this.attendanceService.findAll(
      tenantId,
      filter,
      pagination.page,
      pagination.limit,
    );
  }

  @Get('current')
  @UseGuards(JwtAuthGuard)
  @Permissions('attendance:read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Estado actual del check-in' })
  async getCurrentStatus(
    @CurrentUser('tenantId') tenantId: string,
    @Query('employeeId') employeeId: string,
  ) {
    return this.attendanceService.getCurrentStatus(tenantId, employeeId);
  }

  @Get('summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TENANT_ADMIN', 'MANAGER')
  @Permissions('attendance:read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resumen de asistencia' })
  async getSummary(
    @CurrentUser('tenantId') tenantId: string,
    @Query() dto: AttendanceSummaryDto,
  ) {
    return this.attendanceService.getSummary(tenantId, dto);
  }
}
