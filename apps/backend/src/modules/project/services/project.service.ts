// ==========================================================================
// Project Service - Lógica de proyectos
// ==========================================================================

import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto, AssignEmployeeDto, ProjectFilterDto } from '../dto/project.dto';
import { AuditService } from '../../audit/services/audit.service';
import { buildPaginationMeta, getPaginationArgs } from '../../../shared/utils/pagination.util';

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAll(tenantId: string, filter: ProjectFilterDto, page: number = 1, limit: number = 20) {
    const where: any = { tenantId };

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { code: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        ...getPaginationArgs(page, limit),
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              assignments: { where: { isActive: true } },
              attendances: true,
            },
          },
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    // Calcular horas totales por proyecto
    const projectsWithHours = await Promise.all(
      projects.map(async (project) => {
        const totalMinutes = await this.prisma.attendance.aggregate({
          where: { projectId: project.id, isComplete: true },
          _sum: { workedMinutes: true },
        });

        return {
          ...project,
          totalHoursLogged: Math.round((totalMinutes._sum.workedMinutes || 0) / 60),
          assignedEmployees: project._count.assignments,
        };
      }),
    );

    return buildPaginationMeta(projectsWithHours, total, page, limit);
  }

  async findOne(tenantId: string, id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, tenantId },
      include: {
        assignments: {
          where: { isActive: true },
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                photoUrl: true,
                position: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    // Estadísticas de asistencia
    const attendanceAgg = await this.prisma.attendance.aggregate({
      where: { projectId: id, isComplete: true },
      _sum: { workedMinutes: true, overtimeMinutes: true },
    });

    // Horas del mes actual
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthAgg = await this.prisma.attendance.aggregate({
      where: {
        projectId: id,
        isComplete: true,
        date: { gte: firstDay, lte: lastDay },
      },
      _sum: { workedMinutes: true },
    });

    return {
      ...project,
      attendanceStats: {
        totalHoursLogged: Math.round((attendanceAgg._sum.workedMinutes || 0) / 60),
        hoursThisMonth: Math.round((monthAgg._sum.workedMinutes || 0) / 60),
        overtimeHours: Math.round((attendanceAgg._sum.overtimeMinutes || 0) / 60),
        employeeCount: project.assignments.length,
      },
    };
  }

  async create(tenantId: string, dto: CreateProjectDto, userId: string) {
    // Verificar código único
    if (dto.code) {
      const existing = await this.prisma.project.findFirst({
        where: { tenantId, code: dto.code },
      });
      if (existing) {
        throw new ConflictException(`Ya existe un proyecto con código ${dto.code}`);
      }
    }

    const project = await this.prisma.project.create({
      data: {
        tenantId,
        name: dto.name,
        code: dto.code || null,
        description: dto.description || null,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        color: dto.color || null,
        budget: dto.budget || null,
      },
    });

    await this.auditService.log({
      tenantId,
      userId,
      action: 'CREATE',
      entity: 'project',
      entityId: project.id,
      description: `Proyecto creado: ${project.name}`,
      newValue: { name: dto.name, code: dto.code },
    });

    return project;
  }

  async update(tenantId: string, id: string, dto: UpdateProjectDto, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, tenantId },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const oldValue = {
      name: project.name,
      status: project.status,
    };

    const updated = await this.prisma.project.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.code !== undefined && { code: dto.code }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.startDate !== undefined && { startDate: dto.startDate ? new Date(dto.startDate) : null }),
        ...(dto.endDate !== undefined && { endDate: dto.endDate ? new Date(dto.endDate) : null }),
        ...(dto.status && { status: dto.status }),
        ...(dto.color !== undefined && { color: dto.color }),
        ...(dto.budget !== undefined && { budget: dto.budget }),
      },
    });

    await this.auditService.log({
      tenantId,
      userId,
      action: 'UPDATE',
      entity: 'project',
      entityId: id,
      description: `Proyecto actualizado: ${updated.name}`,
      oldValue,
      newValue: { name: updated.name, status: updated.status },
    });

    return updated;
  }

  async assignEmployee(tenantId: string, projectId: string, dto: AssignEmployeeDto, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, tenantId },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const employee = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId, tenantId },
    });

    if (!employee) {
      throw new NotFoundException('Empleado no encontrado');
    }

    // Verificar que no esté ya asignado
    const existing = await this.prisma.projectAssignment.findFirst({
      where: {
        projectId,
        employeeId: dto.employeeId,
        isActive: true,
      },
    });

    if (existing) {
      throw new ConflictException('El empleado ya está asignado a este proyecto');
    }

    const assignment = await this.prisma.projectAssignment.create({
      data: {
        tenantId,
        projectId,
        employeeId: dto.employeeId,
        role: dto.role || null,
        hourlyRate: dto.hourlyRate || null,
        startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
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
      entity: 'project_assignment',
      entityId: assignment.id,
      description: `Empleado ${assignment.employee.firstName} ${assignment.employee.lastName} asignado a ${project.name}`,
    });

    return assignment;
  }

  async removeAssignment(tenantId: string, projectId: string, assignmentId: string, userId: string) {
    const assignment = await this.prisma.projectAssignment.findFirst({
      where: { id: assignmentId, projectId, tenantId },
      include: {
        employee: { select: { firstName: true, lastName: true } },
        project: { select: { name: true } },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Asignación no encontrada');
    }

    await this.prisma.projectAssignment.update({
      where: { id: assignmentId },
      data: { isActive: false, endDate: new Date() },
    });

    await this.auditService.log({
      tenantId,
      userId,
      action: 'DELETE',
      entity: 'project_assignment',
      entityId: assignmentId,
      description: `Empleado ${assignment.employee.firstName} ${assignment.employee.lastName} removido de ${assignment.project.name}`,
    });

    return { message: 'Asignación removida exitosamente' };
  }
}
