// ==========================================================================
// Employee Controller - Endpoints de empleados
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
import { EmployeeService } from '../services/employee.service';
import { CreateEmployeeDto, UpdateEmployeeDto, EmployeeFilterDto } from '../dto/create-employee.dto';
import { PaginationDto } from '../../../shared/dto/pagination.dto';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Permissions } from '../../../shared/decorators/permissions.decorator';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';

@ApiTags('Employees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  @Roles('TENANT_ADMIN', 'MANAGER')
  @Permissions('employees:read')
  @ApiOperation({ summary: 'Listar empleados' })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query() pagination: PaginationDto,
    @Query() filter: EmployeeFilterDto,
  ) {
    return this.employeeService.findAll(
      tenantId,
      filter,
      pagination.page,
      pagination.limit,
    );
  }

  @Get('departments')
  @Roles('TENANT_ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Listar departamentos' })
  async getDepartments(@CurrentUser('tenantId') tenantId: string) {
    return this.employeeService.getDepartments(tenantId);
  }

  @Get(':id')
  @Roles('TENANT_ADMIN', 'MANAGER')
  @Permissions('employees:read')
  @ApiOperation({ summary: 'Obtener detalle de empleado' })
  async findOne(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.employeeService.findOne(tenantId, id);
  }

  @Post()
  @Roles('TENANT_ADMIN', 'MANAGER')
  @Permissions('employees:write')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear empleado' })
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateEmployeeDto,
  ) {
    return this.employeeService.create(tenantId, dto, userId);
  }

  @Patch(':id')
  @Roles('TENANT_ADMIN', 'MANAGER')
  @Permissions('employees:write')
  @ApiOperation({ summary: 'Actualizar empleado' })
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
  ) {
    return this.employeeService.update(tenantId, id, dto, userId);
  }

  @Delete(':id')
  @Roles('TENANT_ADMIN', 'MANAGER')
  @Permissions('employees:delete')
  @ApiOperation({ summary: 'Desactivar empleado' })
  async deactivate(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.employeeService.deactivate(tenantId, id, userId);
  }
}
