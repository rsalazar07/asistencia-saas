// ==========================================================================
// Time Validator - Valida horarios, tardanzas y horas trabajadas
// ==========================================================================

interface TimeSlot {
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  graceMinutes: number;
  breakStart?: string; // "HH:mm"
  breakEnd?: string; // "HH:mm"
}

export class TimeValidator {
  /**
   * Convierte string "HH:mm" a minutos desde medianoche
   */
  static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Determina el estado de entrada (ON_TIME o LATE)
   */
  static getCheckInStatus(
    checkInTime: Date,
    schedule: TimeSlot,
  ): { status: 'ON_TIME' | 'LATE'; lateMinutes: number } {
    const checkInMinutes =
      checkInTime.getHours() * 60 + checkInTime.getMinutes();
    const scheduledStart = this.timeToMinutes(schedule.startTime);
    const graceEnd = scheduledStart + schedule.graceMinutes;

    if (checkInMinutes <= graceEnd) {
      return { status: 'ON_TIME', lateMinutes: 0 };
    }

    return {
      status: 'LATE',
      lateMinutes: checkInMinutes - scheduledStart,
    };
  }

  /**
   * Calcula minutos trabajados (descontando refrigerio)
   */
  static calculateWorkedMinutes(
    checkIn: Date,
    checkOut: Date,
    schedule: TimeSlot,
  ): { workedMinutes: number; breakMinutes: number } {
    const totalMinutes = Math.round(
      (checkOut.getTime() - checkIn.getTime()) / 60000,
    );

    let breakMinutes = 0;
    if (schedule.breakStart && schedule.breakEnd) {
      const breakStart = this.timeToMinutes(schedule.breakStart);
      const breakEnd = this.timeToMinutes(schedule.breakEnd);
      breakMinutes = breakEnd - breakStart;
    }

    const workedMinutes = totalMinutes - breakMinutes;

    return {
      workedMinutes: Math.max(0, workedMinutes),
      breakMinutes,
    };
  }

  /**
   * Calcula horas extra
   */
  static calculateOvertime(
    checkOut: Date,
    schedule: TimeSlot,
  ): { overtimeMinutes: number } {
    const checkoutMinutes =
      checkOut.getHours() * 60 + checkOut.getMinutes();
    const scheduledEnd = this.timeToMinutes(schedule.endTime);

    const overtimeMinutes = Math.max(0, checkoutMinutes - scheduledEnd);

    return { overtimeMinutes };
  }

  /**
   * Verifica si el día actual es laborable según el horario
   */
  static isWorkingDay(scheduleDays: { dayOfWeek: number; isWorkingDay: boolean }[]): boolean {
    const today = new Date().getDay(); // 0=Dom, 1=Lun...
    const dayConfig = scheduleDays.find((d) => d.dayOfWeek === today);
    return dayConfig?.isWorkingDay ?? true;
  }
}
