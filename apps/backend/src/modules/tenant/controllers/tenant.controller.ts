// ==========================================================================
// Tenant Controller - Endpoints de gestión de empresa
// ==========================================================================

import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { TenantService } from '../services/tenant.service';
import { UpdateTenantDto } from '../dto/create-tenant.dto';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';

@ApiTags('Tenant')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get()
  @Roles('TENANT_ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Obtener configuración de la empresa' })
  async getTenant(@CurrentUser('tenantId') tenantId: string) {
    return this.tenantService.getTenant(tenantId);
  }

  @Patch()
  @Roles('TENANT_ADMIN')
  @ApiOperation({ summary: 'Actualizar configuración de la empresa' })
  async updateTenant(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateTenantDto,
  ) {
    return this.tenantService.updateTenant(tenantId, dto, userId);
  }

  @Get('stats')
  @Roles('TENANT_ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Obtener estadísticas de la empresa' })
  async getStats(@CurrentUser('tenantId') tenantId: string) {
    return this.tenantService.getTenantStats(tenantId);
  }

  @Post('logo')
  @Roles('TENANT_ADMIN')
  @UseInterceptors(FileInterceptor('logo'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir logo de la empresa' })
  async uploadLogo(
    @CurrentUser('tenantId') tenantId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.tenantService.uploadLogo(tenantId, file);
  }
}
