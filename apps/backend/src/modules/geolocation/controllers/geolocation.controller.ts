// ==========================================================================
// Geolocation Controller - Endpoints de geolocalización
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
import { GeolocationService } from '../services/geolocation.service';
import {
  CreateGeoFenceDto,
  UpdateGeoFenceDto,
  VerifyLocationDto,
} from '../dto/geolocation.dto';
import { PaginationDto } from '../../../shared/dto/pagination.dto';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Permissions } from '../../../shared/decorators/permissions.decorator';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';

@ApiTags('Geolocation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('geolocation')
export class GeolocationController {
  constructor(private readonly geolocationService: GeolocationService) {}

  @Get('fences')
  @Roles('TENANT_ADMIN', 'MANAGER')
  @Permissions('geolocation:read')
  @ApiOperation({ summary: 'Listar geocercas' })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.geolocationService.findAll(tenantId, pagination.page, pagination.limit);
  }

  @Get('fences/:id')
  @Roles('TENANT_ADMIN', 'MANAGER')
  @Permissions('geolocation:read')
  @ApiOperation({ summary: 'Obtener geocerca' })
  async findOne(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.geolocationService.findOne(tenantId, id);
  }

  @Post('fences')
  @Roles('TENANT_ADMIN')
  @Permissions('geolocation:write')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear geocerca' })
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateGeoFenceDto,
  ) {
    return this.geolocationService.create(tenantId, dto, userId);
  }

  @Patch('fences/:id')
  @Roles('TENANT_ADMIN')
  @Permissions('geolocation:write')
  @ApiOperation({ summary: 'Actualizar geocerca' })
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateGeoFenceDto,
  ) {
    return this.geolocationService.update(tenantId, id, dto, userId);
  }

  @Delete('fences/:id')
  @Roles('TENANT_ADMIN')
  @Permissions('geolocation:delete')
  @ApiOperation({ summary: 'Eliminar geocerca' })
  async delete(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.geolocationService.delete(tenantId, id, userId);
  }

  @Post('verify')
  @Permissions('geolocation:read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar ubicación GPS' })
  async verifyLocation(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: VerifyLocationDto,
  ) {
    return this.geolocationService.verifyLocation(tenantId, dto);
  }
}
