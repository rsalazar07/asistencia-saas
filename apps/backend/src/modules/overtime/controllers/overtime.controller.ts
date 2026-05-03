// ==========================================================================
// Overtime Controller - Endpoints de horas extra
// ==========================================================================

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OvertimeService } from '../services/overtime.service';
import {
  CreateOvertimeDto,
  UpdateOvertimeDto,
  ApproveOvertimeDto,
  OvertimeFilterDto,
} from '../dto/overtime.dto';
import { PaginationDto } from '../../../shared/dto/pagination.dto';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Permissions } from '../../../shared/decorators/permissions.decorator';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';

@ApiTags('Overtime')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('overtime')
export class OvertimeController {
  constructor(private readonly overtimeService: OvertimeService) {}

  @Get()
  @Roles('TENANT_ADMIN', 'MANAGER')
  @Permissions('overtime:read')
  @ApiOperation({ summary: 'Listar solicitudes de horas extra' })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query() pagination: PaginationDto,
    @Query() filter: OvertimeFilterDto,
  ) {
    return this.overtimeService.findAll(tenantId, filter, pagination.page, pagination.limit);
  }

  @Get('stats')
  @Roles('TENANT_ADMIN', 'MANAGER')
  @Permissions('overtime:read')
  @ApiOperation({ summary: 'Estadísticas de horas extra' })
  async getStats(
    @CurrentUser('tenantId') tenantId: string,
    @Query('employeeId') employeeId?: string,
  ) {
    return this.overtimeService.getStats(tenantId, employeeId);
  }

  @Get(':id')
  @Roles('TENANT_ADMIN', 'MANAGER')
  @Permissions('overtime:read')
  @ApiOperation({ summary: 'Detalle de solicitud' })
  async findOne(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.overtimeService.findOne(tenantId, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions('overtime:write')
  @ApiOperation({ summary: 'Crear solicitud de horas extra' })
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateOvertimeDto,
  ) {
    return this.overtimeService.create(tenantId, dto, userId);
  }

  @Post(':id/approve')
  @Roles('TENANT_ADMIN', 'MANAGER')
  @Permissions('overtime:approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Aprobar solicitud de horas extra' })
  async approve(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') userRole: string,
    @Param('id') id: string,
    @Body() dto: ApproveOvertimeDto,
  ) {
    return this.overtimeService.approve(tenantId, id, dto, userId, userRole);
  }

  @Post(':id/reject')
  @Roles('TENANT_ADMIN', 'MANAGER')
  @Permissions('overtime:approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rechazar solicitud de horas extra' })
  async reject(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateOvertimeDto,
  ) {
    return this.overtimeService.reject(tenantId, id, dto, userId);
  }

  @Delete(':id')
  @Permissions('overtime:write')
  @ApiOperation({ summary: 'Cancelar solicitud (solo pendientes)' })
  async cancel(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.overtimeService.cancel(tenantId, id, userId);
  }
}
