// ==========================================================================
// Overtime Service - Solicitudes de horas extra
// ==========================================================================

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/services/audit.service';
import {
  CreateOvertimeDto,
  UpdateOvertimeDto,
  ApproveOvertimeDto,
  OvertimeFilterDto,
  OvertimeStatus,
} from '../dto/overtime.dto';
import { buildPaginationMeta, getPaginationArgs } from '../../../shared/utils/pagination.util';

@Injectable()
export class OvertimeService {
  private readonly logger = new Logger(OvertimeService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  // ─── LISTAR SOLICITUDES ────────────────────────────────────────────────

  async findAll(tenantId: string, filter: OvertimeFilterDto, page: number = 1, limit: number = 20) {
    const where: any = { tenantId };

    if (filter.status) where.status = filter.status;
    if (filter.employeeId) where.employeeId = filter.employeeId;
    if (filter.projectId) where.projectId = filter.projectId;

    if (filter.dateFrom || filter.dateTo) {
      where.date = {};
      if (filter.dateFrom) where.date.gte = new Date(filter.dateFrom);
      if (filter.dateTo) {
        const endDate = new Date(filter.dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.date.lte = endDate;
      }
    }

    const [requests, total] = await Promise.all([
      this.prisma.overtimeRequest.findMany({
        where,
        ...getPaginationArgs(page, limit),
        orderBy: { createdAt: 'desc' },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              code: true,
              position: true,
              department: true,
            },
          },
          project: {
            select: { id: true, name: true, code: true },
          },
          approvedBy: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      }),
      this.prisma.overtimeRequest.count({ where }),
    ]);

    return buildPaginationMeta(requests, total, page, limit);
  }

  // ─── DETALLE ───────────────────────────────────────────────────────────

  async findOne(tenantId: string, id: string) {
    const request = await this.prisma.overtimeRequest.findFirst({
      where: { id, tenantId },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            code: true,
            position: true,
            department: true,
          },
        },
        project: {
          select: { id: true, name: true, code: true },
        },
        approvedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Solicitud de horas extra no encontrada');
    }

    return request;
  }

  // ─── CREAR SOLICITUD ───────────────────────────────────────────────────

  async create(tenantId: string, dto: CreateOvertimeDto, userId: string) {
    // Verificar empleado
    const employee = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId, tenantId, status: 'ACTIVE' },
    });
    if (!employee) {
      throw new NotFoundException('Empleado no encontrado o inactivo');
    }

    // Verificar que no exista solicitud duplicada para la misma fecha
    const requestDate = new Date(dto.date);
    requestDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(requestDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const existing = await this.prisma.overtimeRequest.findFirst({
      where: {
        tenantId,
        employeeId: dto.employeeId,
        date: { gte: requestDate, lt: nextDay },
        status: { in: ['PENDING', 'APPROVED'] },
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Ya existe una solicitud de horas extra ${existing.status.toLowerCase()} para esta fecha`,
      );
    }

    const overtime = await this.prisma.overtimeRequest.create({
      data: {
        tenantId,
        employeeId: dto.employeeId,
        projectId: dto.projectId || null,
        date: requestDate,
        requestedMinutes: dto.requestedMinutes,
        reason: dto.reason,
        overtimeType: dto.overtimeType || 'PRE_APPROVED',
        status: 'PENDING',
      },
      include: {
        employee: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    await this.auditService.log({
      tenantId,
      userId,
      action: 'CREATE',
      entity: 'overtime',
      entityId: overtime.id,
      description: `Solicitud de horas extra: ${overtime.employee.firstName} ${overtime.employee.lastName} - ${dto.requestedMinutes}min`,
      newValue: {
        employeeId: dto.employeeId,
        requestedMinutes: dto.requestedMinutes,
        reason: dto.reason,
      },
    });

    return overtime;
  }

  // ─── APROBAR SOLICITUD ─────────────────────────────────────────────────

  async approve(
    tenantId: string,
    id: string,
    dto: ApproveOvertimeDto,
    userId: string,
    userRole: string,
  ) {
    const request = await this.prisma.overtimeRequest.findFirst({
      where: { id, tenantId },
      include: {
        employee: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException(
        `No se puede aprobar: la solicitud está ${request.status.toLowerCase()}`,
      );
    }

    if (dto.approvedMinutes > request.requestedMinutes) {
      throw new BadRequestException(
        'Los minutos aprobados no pueden exceder los solicitados',
      );
    }

    const updated = await this.prisma.overtimeRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedMinutes: dto.approvedMinutes,
        approvedById: userId,
        approvedAt: new Date(),
        notes: dto.notes || null,
      },
    });

    await this.auditService.log({
      tenantId,
      userId,
      action: 'APPROVE',
      entity: 'overtime',
      entityId: id,
      description: `Horas extra aprobadas: ${request.employee.firstName} ${request.employee.lastName} - ${dto.approvedMinutes}min`,
      oldValue: { status: request.status, requestedMinutes: request.requestedMinutes },
      newValue: { status: 'APPROVED', approvedMinutes: dto.approvedMinutes },
    });

    return updated;
  }

  // ─── RECHAZAR SOLICITUD ────────────────────────────────────────────────

  async reject(
    tenantId: string,
    id: string,
    dto: UpdateOvertimeDto,
    userId: string,
  ) {
    const request = await this.prisma.overtimeRequest.findFirst({
      where: { id, tenantId },
      include: {
        employee: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException(
        `No se puede rechazar: la solicitud está ${request.status.toLowerCase()}`,
      );
    }

    const updated = await this.prisma.overtimeRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: dto.rejectionReason || null,
        approvedById: userId,
        approvedAt: new Date(),
      },
    });

    await this.auditService.log({
      tenantId,
      userId,
      action: 'REJECT',
      entity: 'overtime',
      entityId: id,
      description: `Horas extra rechazadas: ${request.employee.firstName} ${request.employee.lastName}`,
      oldValue: { status: request.status },
      newValue: { status: 'REJECTED', reason: dto.rejectionReason },
    });

    return updated;
  }

  // ─── CANCELAR SOLICITUD ────────────────────────────────────────────────

  async cancel(tenantId: string, id: string, userId: string) {
    const request = await this.prisma.overtimeRequest.findFirst({
      where: { id, tenantId },
    });

    if (!request) throw new NotFoundException('Solicitud no encontrada');

    if (request.status !== 'PENDING') {
      throw new BadRequestException('Solo se pueden cancelar solicitudes pendientes');
    }

    const updated = await this.prisma.overtimeRequest.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    await this.auditService.log({
      tenantId,
      userId,
      action: 'UPDATE',
      entity: 'overtime',
      entityId: id,
      description: 'Solicitud de horas extra cancelada',
      oldValue: { status: request.status },
      newValue: { status: 'CANCELLED' },
    });

    return updated;
  }

  // ─── ESTADÍSTICAS ──────────────────────────────────────────────────────

  async getStats(tenantId: string, employeeId?: string) {
    const where: any = { tenantId };
    if (employeeId) where.employeeId = employeeId;

    const now = new Date();
    const firstDayMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [pending, approved, rejected, monthlyApproved] = await Promise.all([
      this.prisma.overtimeRequest.count({ where: { ...where, status: 'PENDING' } }),
      this.prisma.overtimeRequest.count({ where: { ...where, status: 'APPROVED' } }),
      this.prisma.overtimeRequest.count({ where: { ...where, status: 'REJECTED' } }),
      this.prisma.overtimeRequest.aggregate({
        where: {
          ...where,
          status: 'APPROVED',
          date: { gte: firstDayMonth, lte: lastDayMonth },
        },
        _sum: { approvedMinutes: true },
      }),
    ]);

    return {
      summary: {
        pending,
        approved,
        rejected,
        total: pending + approved + rejected,
      },
      monthlyApprovedMinutes: monthlyApproved._sum.approvedMinutes || 0,
      monthlyApprovedHours: Math.round((monthlyApproved._sum.approvedMinutes || 0) / 60),
    };
  }
}
