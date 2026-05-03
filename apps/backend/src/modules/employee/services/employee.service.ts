// ==========================================================================
// Employee Service - Lógica de negocio de empleados
// ==========================================================================

import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateEmployeeDto, UpdateEmployeeDto, EmployeeFilterDto } from '../dto/create-employee.dto';
import { AuditService } from '../../audit/services/audit.service';
import { DocumentValidator } from '../validators/document.validator';
import { buildPaginationMeta, getPaginationArgs } from '../../../shared/utils/pagination.util';
import { EmployeeStatus } from '@prisma/client';

@Injectable()
export class EmployeeService {
  private readonly logger = new Logger(EmployeeService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAll(tenantId: string, filter: EmployeeFilterDto, page: number = 1, limit: number = 20) {
    const where: any = { tenantId };

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.department) {
      where.department = filter.department;
    }

    if (filter.search) {
      where.OR = [
        { firstName: { contains: filter.search, mode: 'insensitive' } },
        { lastName: { contains: filter.search, mode: 'insensitive' } },
        { documentNumber: { contains: filter.search } },
        { email: { contains: filter.search, mode: 'insensitive' } },
        { code: { contains: filter.search } },
      ];
    }

    if (filter.projectId) {
      where.projectAssignments = {
        some: {
          projectId: filter.projectId,
          isActive: true,
        },
      };
    }

    const [employees, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        ...getPaginationArgs(page, limit),
        orderBy: { lastName: 'asc' },
        include: {
          workSchedule: {
            select: { id: true, name: true },
          },
          projectAssignments: {
            where: { isActive: true },
            include: {
              project: {
                select: { id: true, name: true, code: true, color: true },
              },
            },
          },
          _count: {
            select: { attendances: true },
          },
        },
      }),
      this.prisma.employee.count({ where }),
    ]);

    return buildPaginationMeta(employees, total, page, limit);
  }

  async findOne(tenantId: string, id: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, tenantId },
      include: {
        workSchedule: {
          include: {
            details: true,
            geoFence: true,
          },
        },
        projectAssignments: {
          where: { isActive: true },
          include: {
            project: {
              select: { id: true, name: true, code: true, color: true, status: true },
            },
          },
        },
        attendances: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    });

    if (!employee) {
      throw new NotFoundException('Empleado no encontrado');
    }

    // Calcular estadísticas del mes actual
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthAttendances = await this.prisma.attendance.findMany({
      where: {
        tenantId,
        employeeId: id,
        date: { gte: firstDay, lte: lastDay },
      },
    });

    const attendanceStats = {
      total: monthAttendances.length,
      onTime: monthAttendances.filter((a) => a.status === 'ON_TIME').length,
      late: monthAttendances.filter((a) => a.status === 'LATE').length,
      absent: 0, // Se calcula contra los días laborables
      totalWorkedMinutes: monthAttendances.reduce(
        (sum, a) => sum + (a.workedMinutes || 0),
        0,
      ),
    };

    return {
      ...employee,
      attendanceStats,
    };
  }

  async create(tenantId: string, dto: CreateEmployeeDto, userId: string) {
    // Validar documento
    const validation = DocumentValidator.validate(dto.documentType, dto.documentNumber);
    if (!validation.valid) {
      throw new BadRequestException(validation.message);
    }

    // Verificar documento único en el tenant
    const existing = await this.prisma.employee.findFirst({
      where: {
        tenantId,
        documentNumber: dto.documentNumber,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe un empleado con documento ${dto.documentNumber}`,
      );
    }

    // Si no se especifica horario, usar el default
    let workScheduleId = dto.workScheduleId;
    if (!workScheduleId) {
      const defaultSchedule = await this.prisma.workSchedule.findFirst({
        where: { tenantId, isDefault: true },
      });
      if (defaultSchedule) {
        workScheduleId = defaultSchedule.id;
      }
    }

    const employee = await this.prisma.employee.create({
      data: {
        tenantId,
        code: dto.code || null,
        firstName: dto.firstName,
        lastName: dto.lastName,
        documentType: dto.documentType,
        documentNumber: dto.documentNumber,
        email: dto.email || null,
        phone: dto.phone || null,
        address: dto.address || null,
        position: dto.position || null,
        department: dto.department || null,
        hireDate: dto.hireDate ? new Date(dto.hireDate) : new Date(),
        workScheduleId: workScheduleId || null,
        emergencyContact: dto.emergencyContact || null,
        emergencyPhone: dto.emergencyPhone || null,
        notes: dto.notes || null,
      },
    });

    await this.auditService.log({
      tenantId,
      userId,
      action: 'CREATE',
      entity: 'employee',
      entityId: employee.id,
      description: `Empleado creado: ${employee.firstName} ${employee.lastName}`,
      newValue: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        documentNumber: dto.documentNumber,
        position: dto.position,
      },
    });

    return employee;
  }

  async update(tenantId: string, id: string, dto: UpdateEmployeeDto, userId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, tenantId },
    });

    if (!employee) {
      throw new NotFoundException('Empleado no encontrado');
    }

    const oldValue = {
      firstName: employee.firstName,
      lastName: employee.lastName,
      position: employee.position,
      department: employee.department,
      status: employee.status,
    };

    const updated = await this.prisma.employee.update({
      where: { id },
      data: {
        ...(dto.firstName && { firstName: dto.firstName }),
        ...(dto.lastName && { lastName: dto.lastName }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.position !== undefined && { position: dto.position }),
        ...(dto.department !== undefined && { department: dto.department }),
        ...(dto.status && { status: dto.status }),
        ...(dto.workScheduleId !== undefined && { workScheduleId: dto.workScheduleId }),
        ...(dto.emergencyContact !== undefined && { emergencyContact: dto.emergencyContact }),
        ...(dto.emergencyPhone !== undefined && { emergencyPhone: dto.emergencyPhone }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.code !== undefined && { code: dto.code }),
      },
    });

    await this.auditService.log({
      tenantId,
      userId,
      action: 'UPDATE',
      entity: 'employee',
      entityId: id,
      description: `Empleado actualizado: ${updated.firstName} ${updated.lastName}`,
      oldValue,
      newValue: {
        firstName: updated.firstName,
        lastName: updated.lastName,
        position: updated.position,
        department: updated.department,
        status: updated.status,
      },
    });

    return updated;
  }

  async deactivate(tenantId: string, id: string, userId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, tenantId },
    });

    if (!employee) {
      throw new NotFoundException('Empleado no encontrado');
    }

    const updated = await this.prisma.employee.update({
      where: { id },
      data: {
        status: 'INACTIVE',
        terminationDate: new Date(),
      },
    });

    // Desactivar asignaciones activas
    await this.prisma.projectAssignment.updateMany({
      where: { employeeId: id, isActive: true },
      data: { isActive: false, endDate: new Date() },
    });

    await this.auditService.log({
      tenantId,
      userId,
      action: 'DELETE',
      entity: 'employee',
      entityId: id,
      description: `Empleado desactivado: ${employee.firstName} ${employee.lastName}`,
      oldValue: { status: employee.status },
      newValue: { status: 'INACTIVE' },
    });

    return { message: 'Empleado desactivado exitosamente' };
  }

  async getDepartments(tenantId: string) {
    const departments = await this.prisma.employee.findMany({
      where: { tenantId },
      select: { department: true },
      distinct: ['department'],
      orderBy: { department: 'asc' },
    });

    return departments
      .map((d) => d.department)
      .filter((d): d is string => d !== null);
  }
}
