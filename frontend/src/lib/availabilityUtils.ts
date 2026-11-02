/**
 * Utility functions for Exception-Based Priest Availability System.
 * 
 * Default Working Hours: 07:00 AM to 09:00 PM (Configurable per priest).
 * Available Windows = [Working Window (or Custom Specific Hours)] MINUS [Leaves] MINUS [Blackouts] MINUS [Bookings].
 */

export interface PriestException {
  id: string;
  priestId: string;
  date: string; // YYYY-MM-DD
  type: 'FULL_DAY_LEAVE' | 'PARTIAL_BLACKOUT' | 'CUSTOM_HOURS';
  exceptionType?: 'BLOCK' | 'CUSTOM_HOURS';
  startTime?: string; // HH:mm
  endTime?: string;   // HH:mm
  reason?: string;
  createdAt: string;
}

export interface CalculatedSlot {
  id: string;
  priestId: string;
  slotDate: string;
  date: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  status: 'AVAILABLE' | 'BOOKED';
  isBlocked?: boolean;
  blockedReason?: string;
}

interface TimeInterval {
  start: number; // Minutes from 00:00
  end: number;   // Minutes from 00:00
}

/** Convert "HH:MM" (e.g. "07:30") to total minutes from midnight */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

/** Convert minutes from midnight back to "HH:MM" 24-hr string */
export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60).toString().padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

/** Get current date (YYYY-MM-DD) and minutes from midnight in Asia/Kolkata (IST) */
export function getISTNow(): { istDate: string; istMinutes: number; istTime: string } {
  const now = new Date();
  const istDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(now);
  const timeStr = now.toLocaleTimeString('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });
  const [h, m] = timeStr.split(':').map(Number);
  return {
    istDate,
    istMinutes: (h || 0) * 60 + (m || 0),
    istTime: timeStr,
  };
}

/** Get tomorrow's date string (YYYY-MM-DD) in Asia/Kolkata (IST) */
export function getISTTomorrow(): string {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(tomorrow);
}

/** Format time to 12-hour AM/PM string */
export function formatTimeAmPm(timeStr: string): string {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes ? `:${minutes.toString().padStart(2, '0')}` : ':00';
  return `${displayHours}${displayMinutes} ${period}`;
}

/**
 * Interval Subtraction:
 * Subtracts busy intervals from free intervals.
 */
export function subtractTimeIntervals(
  freeIntervals: TimeInterval[],
  busyIntervals: TimeInterval[]
): TimeInterval[] {
  let result = [...freeIntervals];

  for (const busy of busyIntervals) {
    const nextResult: TimeInterval[] = [];

    for (const free of result) {
      // 1. No overlap
      if (busy.end <= free.start || busy.start >= free.end) {
        nextResult.push(free);
        continue;
      }

      // 2. Left portion remaining
      if (busy.start > free.start) {
        nextResult.push({ start: free.start, end: Math.min(busy.start, free.end) });
      }

      // 3. Right portion remaining
      if (busy.end < free.end) {
        nextResult.push({ start: Math.max(busy.end, free.start), end: free.end });
      }
    }

    result = nextResult;
  }

  return result.filter((interval) => interval.end > interval.start);
}

/**
 * Dynamically computes Muhurat slots for a given date:
 * Base Window: Standard working hours (e.g. 07:00 to 21:00 or configured).
 * Overlapping partial blackouts (e.g. 1 PM - 4 PM) are flagged as isBlocked: true (BOOKED).
 * Overlapping active bookings are flagged as BOOKED.
 * All other slots are returned as AVAILABLE.
 */
export function calculateDayMuhuratSlots(
  priestId: string,
  targetDate: string,
  exceptions: PriestException[],
  bookings: any[] = [],
  slotDurationMinutes: number = 120, // standard ceremony slots
  defaultStartTime: string = '07:00',
  defaultEndTime: string = '21:00'
): CalculatedSlot[] {
  const { istDate, istMinutes } = getISTNow();
  if (targetDate < istDate) {
    return [];
  }

  // Check full day leave
  const dayExceptions = exceptions.filter((e) => e.date === targetDate);
  const hasFullLeave = dayExceptions.some((e) => e.type === 'FULL_DAY_LEAVE');
  if (hasFullLeave) {
    return [];
  }

  // Base working window: configurable daily working window (default: 07:00 to 21:00)
  const startMin = timeToMinutes(defaultStartTime) || (7 * 60);
  const endMin = timeToMinutes(defaultEndTime) || (21 * 60);

  // 1. Partial blackouts / blocked hours
  const blackoutExceptions = dayExceptions.filter(
    (e) => (e.type === 'PARTIAL_BLACKOUT' || e.exceptionType === 'BLOCK') && e.startTime && e.endTime
  );

  // 2. Confirmed bookings for this date
  const activeBookings = bookings.filter(
    (b) =>
      b.bookingDate === targetDate &&
      b.status !== 'CANCELLED' &&
      b.status !== 'REJECTED' &&
      b.startTime &&
      b.endTime
  );

  const slots: CalculatedSlot[] = [];
  let currentStart = startMin;
  while (currentStart + slotDurationMinutes <= endMin) {
    const currentEnd = currentStart + slotDurationMinutes;
    const startStr = minutesToTime(currentStart);
    const endStr = minutesToTime(currentEnd);
    const isTargetToday = targetDate === istDate;
    const isPastSlot = isTargetToday && currentStart <= istMinutes;

    if (!isPastSlot) {
      // Check if this slot overlaps with any blocked hours (e.g. 1 PM - 4 PM)
      const matchingBlackout = blackoutExceptions.find((bo) => {
        const boStart = timeToMinutes(bo.startTime!);
        const boEnd = timeToMinutes(bo.endTime!);
        return currentStart < boEnd && currentEnd > boStart;
      });

      // Check if this slot overlaps with an active booking
      const matchingBooking = activeBookings.find((b) => {
        const bStart = timeToMinutes(b.startTime);
        const bEnd = timeToMinutes(b.endTime);
        return currentStart < bEnd && currentEnd > bStart;
      });

      if (matchingBlackout) {
        slots.push({
          id: `dyn-${targetDate}-${startStr}-${endStr}`,
          priestId,
          slotDate: targetDate,
          date: targetDate,
          startTime: startStr,
          endTime: endStr,
          status: 'BOOKED',
          isBlocked: true,
          blockedReason: matchingBlackout.reason || 'Blocked by Purohit',
        });
      } else if (matchingBooking) {
        slots.push({
          id: `dyn-${targetDate}-${startStr}-${endStr}`,
          priestId,
          slotDate: targetDate,
          date: targetDate,
          startTime: startStr,
          endTime: endStr,
          status: 'BOOKED',
          isBlocked: false,
        });
      } else {
        slots.push({
          id: `dyn-${targetDate}-${startStr}-${endStr}`,
          priestId,
          slotDate: targetDate,
          date: targetDate,
          startTime: startStr,
          endTime: endStr,
          status: 'AVAILABLE',
          isBlocked: false,
        });
      }
    }
    currentStart += slotDurationMinutes;
  }

  return slots;
}
