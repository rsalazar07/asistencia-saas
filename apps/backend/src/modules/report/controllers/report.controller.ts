// ==========================================================================
// Report Controller - Endpoints de reportes
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
import { ReportService } from '../services/report.service';
import {
  GenerateReportDto,
  ReportFilterDto,
  DashboardMetricsDto,
} from '../dto/report.dto';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Permissions } from '../../../shared/decorators/permissions.decorator';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post('generate')
  @Roles('TENANT_ADMIN', 'MANAGER')
  @Permissions('reports:write')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generar reporte personalizado' })
  async generate(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: GenerateReportDto,
  ) {
    return this.reportService.generateReport(tenantId, userId, dto);
  }

  @Get('daily')
  @Roles('TENANT_ADMIN', 'MANAGER')
  @Permissions('reports:read')
  @ApiOperation({ summary: 'Reporte diario de asistencia' })
  async daily(
    @CurrentUser('tenantId') tenantId: string,
    @Query('date') date?: string,
  ) {
    const reportDate = date ? new Date(date) : new Date();
    return this.reportService.generateDaily(tenantId, reportDate);
  }

  @Get('monthly')
  @Roles('TENANT_ADMIN', 'MANAGER')
  @Permissions('reports:read')
  @ApiOperation({ summary: 'Reporte mensual' })
  async monthly(
    @CurrentUser('tenantId') tenantId: string,
    @Query('year') year?: number,
    @Query('month') month?: number,
  ) {
    const y = year || new Date().getFullYear();
    const m = month || new Date().getMonth() + 1;
    return this.reportService.generateMonthly(tenantId, y, m);
  }

  @Get('employee')
  @Roles('TENANT_ADMIN', 'MANAGER')
  @Permissions('reports:read')
  @ApiOperation({ summary: 'Reporte por empleado' })
  async employee(
    @CurrentUser('tenantId') tenantId: string,
    @Query('employeeId') employeeId: string,
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
  ) {
    return this.reportService.generateEmployee(
      tenantId,
      employeeId,
      new Date(dateFrom),
      new Date(dateTo),
    );
  }

  @Get('department')
  @Roles('TENANT_ADMIN', 'MANAGER')
  @Permissions('reports:read')
  @ApiOperation({ summary: 'Reporte por departamento' })
  async department(
    @CurrentUser('tenantId') tenantId: string,
    @Query('department') department: string,
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
  ) {
    return this.reportService.generateDepartment(
      tenantId,
      department,
      new Date(dateFrom),
      new Date(dateTo),
    );
  }

  @Get('project')
  @Roles('TENANT_ADMIN', 'MANAGER')
  @Permissions('reports:read')
  @ApiOperation({ summary: 'Reporte por proyecto' })
  async project(
    @CurrentUser('tenantId') tenantId: string,
    @Query('projectId') projectId: string,
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
  ) {
    return this.reportService.generateProject(
      tenantId,
      projectId,
      new Date(dateFrom),
      new Date(dateTo),
    );
  }

  @Get('dashboard')
  @Roles('TENANT_ADMIN', 'MANAGER')
  @Permissions('reports:read')
  @ApiOperation({ summary: 'Métricas del dashboard' })
  async dashboard(
    @CurrentUser('tenantId') tenantId: string,
    @Query() dto: DashboardMetricsDto,
  ) {
    return this.reportService.getDashboardMetrics(tenantId, dto);
  }
}
