import { Business, ServiceItem, Appointment, DaySchedule } from '@/types';

export interface TimeSlot {
  time: string; // e.g. "09:00 AM"
  isoString: string; // ISO 8601 string
  isAvailable: boolean;
}

export function formatTime12Hour(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const displayMinute = minute < 10 ? `0${minute}` : minute;
  return `${displayHour}:${displayMinute} ${period}`;
}

export function parseTimeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + (m || 0);
}

export function computeAvailableSlots(
  targetDateStr: string, // YYYY-MM-DD
  business: Business,
  service: ServiceItem,
  existingAppointments: Appointment[]
): TimeSlot[] {
  const targetDate = new Date(`${targetDateStr}T00:00:00`);
  const dayIndex = targetDate.getDay();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
  const dayKey = dayNames[dayIndex];

  const schedule: DaySchedule | undefined = business.businessHours?.[dayKey];
  if (!schedule || !schedule.isOpen) {
    return [];
  }

  const openMinutes = parseTimeToMinutes(schedule.openTime);
  const closeMinutes = parseTimeToMinutes(schedule.closeTime);
  const duration = service.durationMinutes || 30;

  const breakStartMinutes = schedule.breakStart ? parseTimeToMinutes(schedule.breakStart) : -1;
  const breakEndMinutes = schedule.breakEnd ? parseTimeToMinutes(schedule.breakEnd) : -1;

  // Active appointments on this date
  const activeBookings = existingAppointments.filter((appt) => {
    if (appt.status === 'cancelled' || appt.status === 'rejected') return false;
    const apptDate = appt.startAt.split('T')[0];
    return apptDate === targetDateStr;
  });

  const slots: TimeSlot[] = [];

  for (let current = openMinutes; current + duration <= closeMinutes; current += duration) {
    // Check if slot falls during break
    if (breakStartMinutes !== -1 && breakEndMinutes !== -1) {
      if (
        (current >= breakStartMinutes && current < breakEndMinutes) ||
        (current + duration > breakStartMinutes && current + duration <= breakEndMinutes)
      ) {
        continue;
      }
    }

    const slotHour = Math.floor(current / 60);
    const slotMin = current % 60;
    const timeLabel = formatTime12Hour(slotHour, slotMin);

    const padH = slotHour < 10 ? `0${slotHour}` : `${slotHour}`;
    const padM = slotMin < 10 ? `0${slotMin}` : `${slotMin}`;
    const isoString = `${targetDateStr}T${padH}:${padM}:00`;

    // Check collision with existing appointments
    const slotStartTime = new Date(isoString).getTime();
    const slotEndTime = slotStartTime + duration * 60 * 1000;

    const isConflict = activeBookings.some((appt) => {
      const apptStart = new Date(appt.startAt).getTime();
      const apptEnd = new Date(appt.endAt).getTime();
      return (
        (slotStartTime >= apptStart && slotStartTime < apptEnd) ||
        (slotEndTime > apptStart && slotEndTime <= apptEnd) ||
        (slotStartTime <= apptStart && slotEndTime >= apptEnd)
      );
    });

    slots.push({
      time: timeLabel,
      isoString,
      isAvailable: !isConflict,
    });
  }

  return slots;
}
