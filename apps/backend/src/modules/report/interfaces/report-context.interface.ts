// ==========================================================================
// Report Context - Contexto para plantillas de reportes
// ==========================================================================

export interface ReportContext {
  tenant: {
    id: string;
    name: string;
    logo?: string;
    address?: string;
    phone?: string;
  };
  generatedAt: Date;
  generatedBy: string;
  dateRange: {
    from: Date;
    to: Date;
  };
  filters: Record<string, any>;
}

export interface DailyReportData {
  date: string;
  totalEmployees: number;
  present: number;
  late: number;
  absent: number;
  onTime: number;
  averageWorkedMinutes: number;
  employees: {
    id: string;
    name: string;
    checkIn?: Date;
    checkOut?: Date;
    status: string;
    lateMinutes: number;
    workedMinutes: number;
    department?: string;
  }[];
}

export interface MonthlyReportData {
  month: string;
  year: number;
  totalEmployees: number;
  totalWorkDays: number;
  summary: {
    totalAttendances: number;
    onTime: number;
    late: number;
    absent: number;
    averageWorkedMinutes: number;
    totalOvertimeMinutes: number;
  };
  employees: {
    id: string;
    name: string;
    department?: string;
    totalPresent: number;
    totalLate: number;
    totalAbsent: number;
    totalWorkedMinutes: number;
    totalOvertimeMinutes: number;
    punctuality: number; // porcentaje
  }[];
  dailyRecords: {
    date: string;
    present: number;
    late: number;
    absent: number;
  }[];
}

export interface EmployeeReportData {
  employee: {
    id: string;
    name: string;
    code?: string;
    department?: string;
    position?: string;
    documentNumber: string;
  };
  period: { from: Date; to: Date };
  summary: {
    totalDays: number;
    presentDays: number;
    lateDays: number;
    absentDays: number;
    totalWorkedMinutes: number;
    totalOvertimeMinutes: number;
    punctuality: number;
  };
  dailyRecords: {
    date: string;
    dayOfWeek: string;
    checkIn?: Date;
    checkOut?: Date;
    status: string;
    lateMinutes: number;
    workedMinutes: number;
    overtimeMinutes: number;
  }[];
}

export interface DepartmentReportData {
  department: string;
  period: { from: Date; to: Date };
  employeeCount: number;
  summary: {
    totalAttendances: number;
    onTime: number;
    late: number;
    absent: number;
    punctualityRate: number;
  };
}

export interface ProjectReportData {
  project: {
    id: string;
    name: string;
    code?: string;
    status: string;
  };
  period: { from: Date; to: Date };
  assignedEmployees: number;
  summary: {
    totalHoursLogged: number;
    totalOvertimeHours: number;
    averageHoursPerDay: number;
    totalDays: number;
  };
}
