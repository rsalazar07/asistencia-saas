// ==========================================================================
// Attendance Service - Lógica de control de asistencia
// ==========================================================================

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CheckInDto, CheckOutDto, AttendanceFilterDto, AttendanceSummaryDto } from '../dto/attendance.dto';
import { AuditService } from '../../audit/services/audit.service';
import { GeofenceValidator } from '../validators/geofence.validator';
import { TimeValidator } from '../validators/time.validator';
import { buildPaginationMeta, getPaginationArgs } from '../../../shared/utils/pagination.util';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  // ─── CHECK-IN ───────────────────────────────────────────────────────────

  async checkIn(tenantId: string, dto: CheckInDto, userId: string, ipAddress?: string) {
    // Verificar empleado
    const employee = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId, tenantId, status: 'ACTIVE' },
      include: {
        workSchedule: {
          include: { details: true, geoFence: true },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException('Empleado no encontrado o inactivo');
    }

    // Verificar que no tenga ya un check-in hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingAttendance = await this.prisma.attendance.findFirst({
      where: {
        tenantId,
        employeeId: dto.employeeId,
        date: { gte: today, lt: tomorrow },
      },
    });

    if (existingAttendance) {
      if (!existingAttendance.checkOut) {
        throw new BadRequestException(
          'Ya tienes un check-in activo. Registra tu salida primero.',
        );
      }
      throw new BadRequestException(
        'Ya registraste tu asistencia completa hoy.',
      );
    }

    // Verificar geocerca
    let geofenceVerified = false;
    let geofenceDistance = 0;
    let geofenceName = '';

    if (employee.workSchedule?.geoFence) {
      const fence = employee.workSchedule.geoFence;
      const result = GeofenceValidator.isInside(
        { latitude: dto.latitude, longitude: dto.longitude },
        {
          id: fence.id,
          name: fence.name,
          latitude: fence.latitude,
          longitude: fence.longitude,
          radius: fence.radius,
        },
      );
      geofenceVerified = result.inside;
      geofenceDistance = result.distance;
      geofenceName = fence.name;

      if (!result.inside) {
        throw new BadRequestException(
          `Estás fuera del área permitida (${fence.name}). Distancia: ${Math.round(result.distance)}m. Radio máximo: ${fence.radius}m.`,
        );
      }
    }

    // Calcular estado de entrada
    let status: any = 'ON_TIME';
    let lateMinutes = 0;

    if (employee.workSchedule?.details) {
      const daySchedule = employee.workSchedule.details.find(
        (d) => d.dayOfWeek === new Date().getDay(),
      );
      if (daySchedule) {
        const checkInStatus = TimeValidator.getCheckInStatus(new Date(), {
          startTime: daySchedule.startTime,
          endTime: daySchedule.endTime,
          graceMinutes: daySchedule.graceMinutes,
          breakStart: daySchedule.breakStart || undefined,
          breakEnd: daySchedule.breakEnd || undefined,
        });
        status = checkInStatus.status;
        lateMinutes = checkInStatus.lateMinutes;
      }
    }

    // Obtener dirección aproximada
    const address = await GeofenceValidator.getAddress(
      dto.latitude,
      dto.longitude,
    );

    // Crear registro de asistencia
    const attendance = await this.prisma.attendance.create({
      data: {
        tenantId,
        employeeId: dto.employeeId,
        projectId: dto.projectId || null,
        date: today,
        checkIn: new Date(),
        checkInLat: dto.latitude,
        checkInLng: dto.longitude,
        checkInMethod: dto.method || 'GPS',
        checkInPhoto: dto.photo || null,
        checkInAddress: address,
        status,
        lateMinutes,
        isComplete: false,
      },
    });

    // Audit log
    await this.auditService.log({
      tenantId,
      userId,
      action: 'CHECK_IN',
      entity: 'attendance',
      entityId: attendance.id,
      description: `Check-in: ${employee.firstName} ${employee.lastName}`,
      newValue: {
        employeeId: dto.employeeId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        status,
      },
      ipAddress,
      userAgent: null,
    });

    this.logger.log(`Check-in: ${employee.firstName} ${employee.lastName} - ${status}`);

    return {
      id: attendance.id,
      employeeId: dto.employeeId,
      checkIn: attendance.checkIn,
      checkInLat: dto.latitude,
      checkInLng: dto.longitude,
      checkInAddress: address,
      status,
      lateMinutes,
      geofenceVerified,
      geofenceDistance,
      message:
        status === 'ON_TIME'
          ? 'Entrada registrada - Buen día!'
          : `Entrada registrada con ${lateMinutes} minutos de tardanza`,
    };
  }

  // ─── CHECK-OUT ──────────────────────────────────────────────────────────

  async checkOut(tenantId: string, dto: CheckOutDto, userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Buscar registro de asistencia de hoy
    const attendance = await this.prisma.attendance.findFirst({
      where: {
        tenantId,
        employeeId: dto.employeeId,
        date: { gte: today, lt: tomorrow },
        checkOut: null,
      },
      include: {
        employee: {
          include: {
            workSchedule: {
              include: { details: true },
            },
          },
        },
      },
    });

    if (!attendance) {
      throw new BadRequestException(
        'No tienes un check-in activo para hoy. Registra tu entrada primero.',
      );
    }

    // Obtener dirección
    const address = await GeofenceValidator.getAddress(
      dto.latitude,
      dto.longitude,
    );

    // Calcular minutos trabajados y horas extra
    const now = new Date();
    let workedMinutes = 0;
    let breakMinutes = 0;
    let overtimeMinutes = 0;

    if (attendance.employee.workSchedule?.details) {
      const daySchedule = attendance.employee.workSchedule.details.find(
        (d) => d.dayOfWeek === now.getDay(),
      );

      if (daySchedule) {
        const worked = TimeValidator.calculateWorkedMinutes(
          attendance.checkIn,
          now,
          {
            startTime: daySchedule.startTime,
            endTime: daySchedule.endTime,
            graceMinutes: daySchedule.graceMinutes,
            breakStart: daySchedule.breakStart || undefined,
            breakEnd: daySchedule.breakEnd || undefined,
          },
        );
        workedMinutes = worked.workedMinutes;
        breakMinutes = worked.breakMinutes;

        const overtime = TimeValidator.calculateOvertime(now, {
          startTime: daySchedule.startTime,
          endTime: daySchedule.endTime,
          graceMinutes: daySchedule.graceMinutes,
        });
        overtimeMinutes = overtime.overtimeMinutes;
      }
    }

    const updated = await this.prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: now,
        checkOutLat: dto.latitude,
        checkOutLng: dto.longitude,
        checkOutMethod: dto.method || 'GPS',
        checkOutPhoto: dto.photo || null,
        checkOutAddress: address,
        workedMinutes,
        breakMinutes,
        overtimeMinutes,
        isComplete: true,
        notes: dto.notes || null,
      },
    });

    // Audit log
    await this.auditService.log({
      tenantId,
      userId,
      action: 'CHECK_OUT',
      entity: 'attendance',
      entityId: attendance.id,
      description: `Check-out empleado completado`,
      newValue: {
        workedMinutes,
        overtimeMinutes,
      },
    });

    this.logger.log(
      `Check-out: ${attendance.employee.firstName} ${attendance.employee.lastName} - ${workedMinutes}min trabajados`,
    );

    return {
      id: updated.id,
      employeeId: dto.employeeId,
      checkIn: attendance.checkIn,
      checkOut: now,
      status: attendance.status,
      workedMinutes,
      breakMinutes,
      overtimeMinutes,
      isComplete: true,
      message: 'Salida registrada - Jornada completada',
    };
  }

  // ─── HISTORIAL ──────────────────────────────────────────────────────────

  async findAll(
    tenantId: string,
    filter: AttendanceFilterDto,
    page: number = 1,
    limit: number = 20,
  ) {
    const where: any = { tenantId };

    if (filter.employeeId) {
      where.employeeId = filter.employeeId;
    }

    if (filter.projectId) {
      where.projectId = filter.projectId;
    }

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.dateFrom || filter.dateTo) {
      where.date = {};
      if (filter.dateFrom) {
        where.date.gte = new Date(filter.dateFrom);
      }
      if (filter.dateTo) {
        const endDate = new Date(filter.dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.date.lte = endDate;
      }
    }

    const orderBy: any = {};
    orderBy[filter.sortBy || 'date'] = filter.sortOrder?.toLowerCase() || 'desc';

    const [attendances, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        ...getPaginationArgs(page, limit),
        orderBy,
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              code: true,
              photoUrl: true,
              position: true,
            },
          },
          project: {
            select: { id: true, name: true, code: true, color: true },
          },
        },
      }),
      this.prisma.attendance.count({ where }),
    ]);

    return buildPaginationMeta(attendances, total, page, limit);
  }

  // ─── CURRENT STATUS ─────────────────────────────────────────────────────

  async getCurrentStatus(tenantId: string, employeeId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, tenantId },
      include: {
        workSchedule: {
          include: { details: true },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException('Empleado no encontrado');
    }

    const currentAttendance = await this.prisma.attendance.findFirst({
      where: {
        tenantId,
        employeeId,
        date: { gte: today, lt: tomorrow },
      },
    });

    // Obtener horario de hoy
    const dayOfWeek = new Date().getDay();
    const todaySchedule = employee.workSchedule?.details?.find(
      (d) => d.dayOfWeek === dayOfWeek,
    );

    return {
      checkedIn: !!currentAttendance,
      checkedOut: currentAttendance?.isComplete || false,
      currentAttendance: currentAttendance
        ? {
            id: currentAttendance.id,
            checkIn: currentAttendance.checkIn,
            checkInLat: currentAttendance.checkInLat,
            checkInLng: currentAttendance.checkInLng,
            status: currentAttendance.status,
          }
        : null,
      todaySchedule: todaySchedule
        ? {
            startTime: todaySchedule.startTime,
            endTime: todaySchedule.endTime,
            graceMinutes: todaySchedule.graceMinutes,
            isWorkingDay: todaySchedule.isWorkingDay,
            breakStart: todaySchedule.breakStart,
            breakEnd: todaySchedule.breakEnd,
          }
        : null,
    };
  }

  // ─── SUMMARY ────────────────────────────────────────────────────────────

  async getSummary(tenantId: string, dto: AttendanceSummaryDto) {
    const where: any = { tenantId };

    if (dto.employeeId) {
      where.employeeId = dto.employeeId;
    }

    if (dto.projectId) {
      where.projectId = dto.projectId;
    }

    if (dto.dateFrom || dto.dateTo) {
      where.date = {};
      if (dto.dateFrom) where.date.gte = new Date(dto.dateFrom);
      if (dto.dateTo) {
        const endDate = new Date(dto.dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.date.lte = endDate;
      }
    }

    const attendances = await this.prisma.attendance.findMany({ where });

    const totalRecords = attendances.length;
    const onTime = attendances.filter((a) => a.status === 'ON_TIME').length;
    const late = attendances.filter((a) => a.status === 'LATE').length;
    const totalWorkedMinutes = attendances.reduce(
      (sum, a) => sum + (a.workedMinutes || 0),
      0,
    );
    const totalOvertimeMinutes = attendances.reduce(
      (sum, a) => sum + (a.overtimeMinutes || 0),
      0,
    );

    // Agrupar por día
    const recordsByDayMap = new Map<string, { present: number; late: number; absent: number }>();
    for (const a of attendances) {
      const dateKey = a.date.toISOString().split('T')[0];
      const day = recordsByDayMap.get(dateKey) || { present: 0, late: 0, absent: 0 };
      day.present++;
      if (a.status === 'LATE') day.late++;
      recordsByDayMap.set(dateKey, day);
    }

    const recordsByDay = Array.from(recordsByDayMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalRecords,
      onTime,
      late,
      absent: 0,
      averageWorkedMinutes: totalRecords > 0 ? Math.round(totalWorkedMinutes / totalRecords) : 0,
      totalOvertimeMinutes,
      recordsByDay,
    };
  }
}
