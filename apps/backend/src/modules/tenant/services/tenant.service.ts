// ==========================================================================
// Tenant Service - Gestión de empresas
// ==========================================================================

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateTenantDto } from '../dto/create-tenant.dto';
import { AuditService } from '../../audit/services/audit.service';

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async getTenant(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Empresa no encontrada');
    }

    return tenant;
  }

  async updateTenant(tenantId: string, dto: UpdateTenantDto, userId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Empresa no encontrada');
    }

    const updated = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.legalName && { legalName: dto.legalName }),
        ...(dto.email && { email: dto.email }),
        ...(dto.phone && { phone: dto.phone }),
        ...(dto.address && { address: dto.address }),
        ...(dto.timezone && { timezone: dto.timezone }),
        ...(dto.config && { config: dto.config }),
      },
    });

    await this.auditService.log({
      tenantId,
      userId,
      action: 'UPDATE',
      entity: 'tenant',
      entityId: tenantId,
      description: 'Configuración de empresa actualizada',
      oldValue: {
        name: tenant.name,
        email: tenant.email,
        config: tenant.config,
      },
      newValue: {
        name: updated.name,
        email: updated.email,
        config: updated.config,
      },
    });

    return updated;
  }

  async getTenantStats(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalEmployees,
      activeEmployees,
      totalProjects,
      activeProjects,
      todayAttendance,
    ] = await Promise.all([
      this.prisma.employee.count({ where: { tenantId } }),
      this.prisma.employee.count({
        where: { tenantId, status: 'ACTIVE' },
      }),
      this.prisma.project.count({ where: { tenantId } }),
      this.prisma.project.count({
        where: { tenantId, status: 'ACTIVE' },
      }),
      this.prisma.attendance.count({
        where: {
          tenantId,
          date: { gte: today, lt: tomorrow },
          checkIn: { not: null },
        },
      }),
    ]);

    const todayLate = await this.prisma.attendance.count({
      where: {
        tenantId,
        date: { gte: today, lt: tomorrow },
        status: 'LATE',
      },
    });

    return {
      totalEmployees,
      activeEmployees,
      totalProjects,
      activeProjects,
      todayAttendance,
      todayLate,
      todayAbsent: activeEmployees - todayAttendance,
    };
  }

  async uploadLogo(tenantId: string, file: Express.Multer.File) {
    // TODO: Implementar subida a S3/MinIO
    const logoUrl = `/uploads/logos/${tenantId}-${Date.now()}.${file.originalname.split('.').pop()}`;

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { logoUrl },
    });

    return { logoUrl };
  }
}
