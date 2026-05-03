// ==========================================================================
// Project Controller - Endpoints de proyectos
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
import { ProjectService } from '../services/project.service';
import { CreateProjectDto, UpdateProjectDto, AssignEmployeeDto, ProjectFilterDto } from '../dto/project.dto';
import { PaginationDto } from '../../../shared/dto/pagination.dto';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Permissions } from '../../../shared/decorators/permissions.decorator';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';

@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @Roles('TENANT_ADMIN', 'MANAGER')
  @Permissions('projects:read')
  @ApiOperation({ summary: 'Listar proyectos' })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query() pagination: PaginationDto,
    @Query() filter: ProjectFilterDto,
  ) {
    return this.projectService.findAll(tenantId, filter, pagination.page, pagination.limit);
  }

  @Get(':id')
  @Roles('TENANT_ADMIN', 'MANAGER')
  @Permissions('projects:read')
  @ApiOperation({ summary: 'Obtener detalle de proyecto' })
  async findOne(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.projectService.findOne(tenantId, id);
  }

  @Post()
  @Roles('TENANT_ADMIN', 'MANAGER')
  @Permissions('projects:write')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear proyecto' })
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectService.create(tenantId, dto, userId);
  }

  @Patch(':id')
  @Roles('TENANT_ADMIN', 'MANAGER')
  @Permissions('projects:write')
  @ApiOperation({ summary: 'Actualizar proyecto' })
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectService.update(tenantId, id, dto, userId);
  }

  @Post(':id/assign')
  @Roles('TENANT_ADMIN', 'MANAGER')
  @Permissions('projects:write')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Asignar empleado al proyecto' })
  async assignEmployee(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('id') projectId: string,
    @Body() dto: AssignEmployeeDto,
  ) {
    return this.projectService.assignEmployee(tenantId, projectId, dto, userId);
  }

  @Delete(':projectId/assign/:assignmentId')
  @Roles('TENANT_ADMIN', 'MANAGER')
  @Permissions('projects:write')
  @ApiOperation({ summary: 'Remover asignación de empleado' })
  async removeAssignment(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('projectId') projectId: string,
    @Param('assignmentId') assignmentId: string,
  ) {
    return this.projectService.removeAssignment(tenantId, projectId, assignmentId, userId);
  }
}
