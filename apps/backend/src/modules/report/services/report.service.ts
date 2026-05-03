// ==========================================================================
// Report Service - Generación de reportes
// ==========================================================================

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/services/audit.service';
import {
  GenerateReportDto,
  ReportType,
  ExportFormat,
  ReportFilterDto,
  ReportScheduleDto,
  DashboardMetricsDto,
} from '../dto/report.dto';
import {
  ReportContext,
  DailyReportData,
  MonthlyReportData,
  EmployeeReportData,
  DepartmentReportData,
  ProjectReportData,
} from '../interfaces/report-context.interface';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  // ─── REPORTE DIARIO ────────────────────────────────────────────────────

  async generateDaily(tenantId: string, date: Date): Promise<DailyReportData> {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const [employees, attendances] = await Promise.all([
      this.prisma.employee.findMany({
        where: { tenantId, status: 'ACTIVE' },
        select: { id: true, firstName: true, lastName: true, department: true },
      }),
      this.prisma.attendance.findMany({
        where: {
          tenantId,
          date: { gte: dayStart, lte: dayEnd },
        },
        include: {
          employee: {
            select: { id: true, firstName: true, lastName: true, department: true },
          },
        },
      }),
    ]);

    const attendanceMap = new Map(attendances.map((a) => [a.employeeId, a]));

    const employeeRecords = employees.map((emp) => {
      const att = attendanceMap.get(emp.id);
      return {
        id: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        department: emp.department || undefined,
        checkIn: att?.checkIn || undefined,
        checkOut: att?.checkOut || undefined,
        status: att?.status || 'MISSING',
        lateMinutes: att?.lateMinutes || 0,
        workedMinutes: att?.workedMinutes || 0,
      };
    });

    const present = attendances.length;
    const late = attendances.filter((a) => a.status === 'LATE').length;
    const onTime = attendances.filter((a) => a.status === 'ON_TIME').length;
    const absent = employees.length - present;
    const avgWorked = present > 0
      ? Math.round(attendances.reduce((s, a) => s + (a.workedMinutes || 0), 0) / present)
      : 0;

    return {
      date: dayStart.toISOString().split('T')[0],
      totalEmployees: employees.length,
      present,
      late,
      absent,
      onTime,
      averageWorkedMinutes: avgWorked,
      employees: employeeRecords,
    };
  }

  // ─── REPORTE MENSUAL ───────────────────────────────────────────────────

  async generateMonthly(tenantId: string, year: number, month: number): Promise<MonthlyReportData> {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0, 23, 59, 59, 999);

    const [employees, attendances] = await Promise.all([
      this.prisma.employee.findMany({
        where: { tenantId, status: 'ACTIVE' },
        select: { id: true, firstName: true, lastName: true, department: true },
      }),
      this.prisma.attendance.findMany({
        where: {
          tenantId,
          date: { gte: firstDay, lte: lastDay },
        },
        include: {
          employee: {
            select: { id: true, firstName: true, lastName: true, department: true },
          },
        },
        orderBy: { date: 'asc' },
      }),
    ]);

    // Resumen por empleado
    const employeeMap = new Map<string, {
      totalPresent: number;
      totalLate: number;
      totalAbsent: number;
      totalWorkedMinutes: number;
      totalOvertimeMinutes: number;
    }>();

    for (const emp of employees) {
      employeeMap.set(emp.id, {
        totalPresent: 0,
        totalLate: 0,
        totalAbsent: 0,
        totalWorkedMinutes: 0,
        totalOvertimeMinutes: 0,
      });
    }

    // Registros por día
    const dailyMap = new Map<string, { present: number; late: number }>();

    for (const att of attendances) {
      const dateKey = att.date.toISOString().split('T')[0];
      const day = dailyMap.get(dateKey) || { present: 0, late: 0 };
      day.present++;
      if (att.status === 'LATE') day.late++;
      dailyMap.set(dateKey, day);

      const empData = employeeMap.get(att.employeeId);
      if (empData) {
        empData.totalPresent++;
        if (att.status === 'LATE') empData.totalLate++;
        empData.totalWorkedMinutes += att.workedMinutes || 0;
        empData.totalOvertimeMinutes += att.overtimeMinutes || 0;
      }
    }

    // Calcular ausencias
    const workDays = dailyMap.size;
    for (const emp of employees) {
      const data = employeeMap.get(emp.id);
      if (data) {
        data.totalAbsent = workDays - data.totalPresent;
      }
    }

    const totalAttendances = attendances.length;
    const onTime = attendances.filter((a) => a.status === 'ON_TIME').length;
    const late = attendances.filter((a) => a.status === 'LATE').length;
    const avgWorked = totalAttendances > 0
      ? Math.round(attendances.reduce((s, a) => s + (a.workedMinutes || 0), 0) / totalAttendances)
      : 0;

    return {
      month: firstDay.toLocaleString('es-PE', { month: 'long' }),
      year,
      totalEmployees: employees.length,
      totalWorkDays: workDays,
      summary: {
        totalAttendances,
        onTime,
        late,
        absent: (employees.length * workDays) - totalAttendances,
        averageWorkedMinutes: avgWorked,
        totalOvertimeMinutes: attendances.reduce((s, a) => s + (a.overtimeMinutes || 0), 0),
      },
      employees: employees.map((emp) => {
        const data = employeeMap.get(emp.id) || {
          totalPresent: 0, totalLate: 0, totalAbsent: 0,
          totalWorkedMinutes: 0, totalOvertimeMinutes: 0,
        };
        return {
          id: emp.id,
          name: `${emp.firstName} ${emp.lastName}`,
          department: emp.department || undefined,
          ...data,
          punctuality: workDays > 0
            ? Math.round(((workDays - data.totalLate - data.totalAbsent) / workDays) * 100)
            : 100,
        };
      }),
      dailyRecords: Array.from(dailyMap.entries())
        .map(([date, data]) => ({
          date,
          present: data.present,
          late: data.late,
          absent: employees.length - data.present,
        }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    };
  }

  // ─── REPORTE POR EMPLEADO ──────────────────────────────────────────────

  async generateEmployee(
    tenantId: string,
    employeeId: string,
    from: Date,
    to: Date,
  ): Promise<EmployeeReportData> {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, tenantId },
    });

    if (!employee) {
      throw new NotFoundException('Empleado no encontrado');
    }

    const toEnd = new Date(to);
    toEnd.setHours(23, 59, 59, 999);

    const attendances = await this.prisma.attendance.findMany({
      where: {
        tenantId,
        employeeId,
        date: { gte: from, lte: toEnd },
      },
      orderBy: { date: 'asc' },
    });

    const totalDays = attendances.length;
    const lateDays = attendances.filter((a) => a.status === 'LATE').length;
    const presentDays = attendances.filter((a) => a.isComplete).length;
    const absentDays = 0; // Se calcularía contra días laborables

    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    return {
      employee: {
        id: employee.id,
        name: `${employee.firstName} ${employee.lastName}`,
        code: employee.code || undefined,
        department: employee.department || undefined,
        position: employee.position || undefined,
        documentNumber: employee.documentNumber,
      },
      period: { from, to },
      summary: {
        totalDays,
        presentDays,
        lateDays,
        absentDays,
        totalWorkedMinutes: attendances.reduce((s, a) => s + (a.workedMinutes || 0), 0),
        totalOvertimeMinutes: attendances.reduce((s, a) => s + (a.overtimeMinutes || 0), 0),
        punctuality: totalDays > 0
          ? Math.round(((totalDays - lateDays) / totalDays) * 100)
          : 100,
      },
      dailyRecords: attendances.map((a) => ({
        date: a.date.toISOString().split('T')[0],
        dayOfWeek: daysOfWeek[a.date.getDay()],
        checkIn: a.checkIn || undefined,
        checkOut: a.checkOut || undefined,
        status: a.status,
        lateMinutes: a.lateMinutes || 0,
        workedMinutes: a.workedMinutes || 0,
        overtimeMinutes: a.overtimeMinutes || 0,
      })),
    };
  }

  // ─── REPORTE POR DEPARTAMENTO ─────────────────────────────────────────

  async generateDepartment(
    tenantId: string,
    department: string,
    from: Date,
    to: Date,
  ): Promise<DepartmentReportData> {
    const toEnd = new Date(to);
    toEnd.setHours(23, 59, 59, 999);

    const employees = await this.prisma.employee.findMany({
      where: { tenantId, department, status: 'ACTIVE' },
    });

    const attendances = await this.prisma.attendance.findMany({
      where: {
        tenantId,
        date: { gte: from, lte: toEnd },
        employee: { department },
      },
    });

    const totalAttendances = attendances.length;
    const onTime = attendances.filter((a) => a.status === 'ON_TIME').length;
    const late = attendances.filter((a) => a.status === 'LATE').length;

    return {
      department,
      period: { from, to },
      employeeCount: employees.length,
      summary: {
        totalAttendances,
        onTime,
        late,
        absent: (employees.length * this._getBusinessDays(from, to)) - totalAttendances,
        punctualityRate: totalAttendances > 0
          ? Math.round((onTime / totalAttendances) * 100)
          : 100,
      },
    };
  }

  // ─── REPORTE POR PROYECTO ─────────────────────────────────────────────

  async generateProject(
    tenantId: string,
    projectId: string,
    from: Date,
    to: Date,
  ): Promise<ProjectReportData> {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, tenantId },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const toEnd = new Date(to);
    toEnd.setHours(23, 59, 59, 999);

    const [assignments, attendances] = await Promise.all([
      this.prisma.projectAssignment.count({
        where: { projectId, isActive: true },
      }),
      this.prisma.attendance.findMany({
        where: {
          tenantId,
          projectId,
          date: { gte: from, lte: toEnd },
          isComplete: true,
        },
      }),
    ]);

    const totalMinutes = attendances.reduce((s, a) => s + (a.workedMinutes || 0), 0);
    const overtimeMinutes = attendances.reduce((s, a) => s + (a.overtimeMinutes || 0), 0);
    const businessDays = this._getBusinessDays(from, to);

    return {
      project: {
        id: project.id,
        name: project.name,
        code: project.code || undefined,
        status: project.status,
      },
      period: { from, to },
      assignedEmployees: assignments,
      summary: {
        totalHoursLogged: Math.round(totalMinutes / 60),
        totalOvertimeHours: Math.round(overtimeMinutes / 60),
        averageHoursPerDay: businessDays > 0
          ? Math.round(totalMinutes / 60 / businessDays)
          : 0,
        totalDays: businessDays,
      },
    };
  }

  // ─── GENERACIÓN CON MÚLTIPLES FORMATOS ─────────────────────────────────

  async generateReport(tenantId: string, userId: string, dto: GenerateReportDto) {
    const from = dto.dateFrom ? new Date(dto.dateFrom) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const to = dto.dateTo ? new Date(dto.dateTo) : new Date();

    let data: any;

    switch (dto.type) {
      case ReportType.DAILY:
        data = await this.generateDaily(tenantId, from);
        break;
      case ReportType.MONTHLY:
        data = await this.generateMonthly(tenantId, from.getFullYear(), from.getMonth() + 1);
        break;
      case ReportType.EMPLOYEE:
        if (!dto.employeeId) throw new BadRequestException('employeeId requerido para reporte de empleado');
        data = await this.generateEmployee(tenantId, dto.employeeId, from, to);
        break;
      case ReportType.DEPARTMENT:
        if (!dto.department) throw new BadRequestException('department requerido');
        data = await this.generateDepartment(tenantId, dto.department, from, to);
        break;
      case ReportType.PROJECT:
        if (!dto.projectId) throw new BadRequestException('projectId requerido');
        data = await this.generateProject(tenantId, dto.projectId, from, to);
        break;
      default:
        throw new BadRequestException(`Tipo de reporte no soportado: ${dto.type}`);
    }

    // Audit
    await this.auditService.log({
      tenantId,
      userId,
      action: 'EXPORT',
      entity: 'report',
      entityId: `${dto.type}_${Date.now()}`,
      description: `Reporte generado: ${dto.type} en formato ${dto.format}`,
      newValue: {
        type: dto.type,
        format: dto.format,
        dateFrom: from,
        dateTo: to,
      },
    });

    this.logger.log(`Reporte generado: ${dto.type} (${dto.format})`);

    return {
      type: dto.type,
      format: dto.format,
      generatedAt: new Date(),
      data,
    };
  }

  // ─── DASHBOARD METRICS ─────────────────────────────────────────────────

  async getDashboardMetrics(tenantId: string, dto: DashboardMetricsDto) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const firstDayMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const from = dto.dateFrom ? new Date(dto.dateFrom) : firstDayMonth;
    const to = dto.dateTo ? new Date(dto.dateTo) : lastDayMonth;

    const [totalEmployees, activeEmployees, todayAttendances, periodAttendances, projects, departments] =
      await Promise.all([
        this.prisma.employee.count({ where: { tenantId } }),
        this.prisma.employee.count({ where: { tenantId, status: 'ACTIVE' } }),
        this.prisma.attendance.count({
          where: {
            tenantId,
            date: { gte: today, lte: lastDayMonth },
            ...(dto.projectId ? { projectId: dto.projectId } : {}),
          },
        }),
        this.prisma.attendance.findMany({
          where: {
            tenantId,
            date: { gte: from, lte: to },
            ...(dto.projectId ? { projectId: dto.projectId } : {}),
          },
        }),
        this.prisma.project.count({
          where: { tenantId, status: 'ACTIVE' },
        }),
        this.prisma.employee.findMany({
          where: { tenantId, department: { not: null } },
          select: { department: true },
          distinct: ['department'],
        }),
      ]);

    const workedMinutes = periodAttendances.reduce((s, a) => s + (a.workedMinutes || 0), 0);
    const overtimeMinutes = periodAttendances.reduce((s, a) => s + (a.overtimeMinutes || 0), 0);
    const lateCount = periodAttendances.filter((a) => a.status === 'LATE').length;

    return {
      snapshot: {
        totalEmployees,
        activeEmployees,
        todayCheckIns: todayAttendances,
        activeProjects: projects,
        departments: departments.length,
      },
      period: {
        from,
        to,
        totalAttendances: periodAttendances.length,
        onTime: periodAttendances.filter((a) => a.status === 'ON_TIME').length,
        late: lateCount,
        punctualityRate: periodAttendances.length > 0
          ? Math.round(((periodAttendances.length - lateCount) / periodAttendances.length) * 100)
          : 100,
      },
      hours: {
        totalWorkedHours: Math.round(workedMinutes / 60),
        totalOvertimeHours: Math.round(overtimeMinutes / 60),
        averageDailyHours: periodAttendances.length > 0
          ? Math.round((workedMinutes / periodAttendances.length) / 60 * 10) / 10
          : 0,
      },
    };
  }

  // ─── HELPERS ───────────────────────────────────────────────────────────

  private _getBusinessDays(from: Date, to: Date): number {
    let count = 0;
    const current = new Date(from);
    while (current <= to) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++;
      current.setDate(current.getDate() + 1);
    }
    return count;
  }
}
