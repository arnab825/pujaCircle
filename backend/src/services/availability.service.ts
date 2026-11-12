import { eq, and, or, gte, lte, lt, gt } from 'drizzle-orm';
import { db } from '@/db/index.js';
import { priestAvailabilityExceptions, priestProfiles } from '@/models/priest.model.js';
import { bookings } from '@/models/booking.model.js';
import { AppError } from '@/utils/AppError.js';
import { resolvePriestProfileId } from '@/repositories/priest.repository.js';

// DTO representing an availability exception returned by the API
export interface FormattedAvailabilityException {
  id: string;
  priestId: string;
  date: string; // YYYY-MM-DD
  type: 'FULL_DAY_LEAVE' | 'PARTIAL_BLACKOUT' | 'CUSTOM_HOURS';
  exceptionType: 'BLOCK' | 'CUSTOM_HOURS';
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  startAt?: string;
  endAt?: string;
  reason?: string;
  createdAt?: string;
}

// Daily availability status for 90-day calendar grids
export interface DayAvailability {
  date: string; // YYYY-MM-DD
  status: 'AVAILABLE' | 'FULL_DAY_OFF' | 'PARTIAL_BLOCK' | 'CUSTOM_HOURS';
  hasBooking: boolean;
  blockedSlots: Array<{
    startTime: string;
    endTime: string;
    reason?: string | null;
    exceptionType?: 'BLOCK' | 'CUSTOM_HOURS';
  }>;
}

// Format Date object to YYYY-MM-DD in Asia/Kolkata IST
export function toISTDateString(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(date);
}

// Format Date object to HH:mm in Asia/Kolkata IST
export function toISTTimeString(date: Date): string {
  return date.toLocaleTimeString('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Parse local date and time string in Asia/Kolkata into Date object
export function parseISTDateTime(date: string, time: string): Date {
  const normalizedTime = time.length === 5 ? `${time}:00` : time;
  return new Date(`${date}T${normalizedTime}+05:30`);
}

// Service layer for Purohit calendar availability, leaves, and blackout scheduling
export class AvailabilityService {
  // Mark a priest full working day off using configured working hours
  async markFullDayOff(
    priestId: string,
    date: string,
    reason?: string
  ): Promise<FormattedAvailabilityException> {
    const targetPriestId = await resolvePriestProfileId(priestId);
    if (!targetPriestId) {
      throw new AppError(404, `Priest profile not found for ID: ${priestId}`);
    }

    const [profile] = await db
      .select({
        defaultStartTime: priestProfiles.defaultStartTime,
        defaultEndTime: priestProfiles.defaultEndTime,
      })
      .from(priestProfiles)
      .where(eq(priestProfiles.id, targetPriestId))
      .limit(1);

    const startTime = profile?.defaultStartTime ? profile.defaultStartTime.slice(0, 5) : '07:00';
    const endTime = profile?.defaultEndTime ? profile.defaultEndTime.slice(0, 5) : '21:00';

    const hasBookingOverlap = await this.checkBookingOverlap(targetPriestId, date, startTime, endTime);
    if (hasBookingOverlap) {
      throw new AppError(400, 'Cannot mark full day off: you have confirmed ceremony bookings on this date.');
    }

    const dayStart = parseISTDateTime(date, '00:00');
    const dayEnd = parseISTDateTime(date, '23:59');

    // Remove existing exceptions on this date
    await db
      .delete(priestAvailabilityExceptions)
      .where(
        and(
          eq(priestAvailabilityExceptions.priestId, targetPriestId),
          gte(priestAvailabilityExceptions.startAt, dayStart),
          lte(priestAvailabilityExceptions.endAt, dayEnd)
        )
      );

    const startAt = parseISTDateTime(date, startTime);
    const endAt = parseISTDateTime(date, endTime);

    const [record] = await db
      .insert(priestAvailabilityExceptions)
      .values({
        priestId: targetPriestId,
        exceptionType: 'BLOCK',
        isFullDay: true,
        startAt,
        endAt,
        reason: reason || 'Full Day Off / Leave',
      })
      .returning();

    return {
      id: record.id,
      priestId: record.priestId,
      date,
      type: 'FULL_DAY_LEAVE',
      exceptionType: record.exceptionType,
      startTime,
      endTime,
      startAt: record.startAt ? new Date(record.startAt).toISOString() : '',
      endAt: record.endAt ? new Date(record.endAt).toISOString() : '',
      reason: record.reason || '',
      createdAt: record.createdAt ? new Date(record.createdAt).toISOString() : new Date().toISOString(),
    };
  }

  // Cancel / remove full day off or any availability exception
  async cancelDayOff(priestId: string, exceptionId: string): Promise<void> {
    const targetPriestId = await resolvePriestProfileId(priestId);
    if (!targetPriestId) {
      throw new AppError(404, `Priest profile not found for ID: ${priestId}`);
    }

    const [deleted] = await db
      .delete(priestAvailabilityExceptions)
      .where(
        and(
          eq(priestAvailabilityExceptions.id, exceptionId),
          eq(priestAvailabilityExceptions.priestId, targetPriestId)
        )
      )
      .returning();

    if (!deleted) {
      throw new AppError(404, `Availability exception ${exceptionId} not found for priest.`);
    }
  }

  // Block specific hours or set custom working hours on a date
  async blockHours(
    priestId: string,
    date: string,
    startTime: string,
    endTime: string,
    reason?: string,
    exceptionType: 'BLOCK' | 'CUSTOM_HOURS' = 'BLOCK'
  ): Promise<FormattedAvailabilityException> {
    const sTime = startTime.slice(0, 5);
    const eTime = endTime.slice(0, 5);

    if (sTime >= eTime) {
      throw new AppError(400, 'End time must be later than start time.');
    }

    const targetPriestId = await resolvePriestProfileId(priestId);
    if (!targetPriestId) {
      throw new AppError(404, `Priest profile not found for ID: ${priestId}`);
    }

    const hasBookingOverlap = await this.checkBookingOverlap(targetPriestId, date, sTime, eTime);
    if (exceptionType === 'BLOCK' && hasBookingOverlap) {
      throw new AppError(400, 'Cannot block hours: you have confirmed ceremony bookings during this time range.');
    }

    const startAt = parseISTDateTime(date, sTime);
    const endAt = parseISTDateTime(date, eTime);

    if (exceptionType === 'CUSTOM_HOURS') {
      const dayStart = parseISTDateTime(date, '00:00');
      const dayEnd = parseISTDateTime(date, '23:59');

      // When setting custom working hours, remove prior custom hours or conflicting blocks for this date
      await db
        .delete(priestAvailabilityExceptions)
        .where(
          and(
            eq(priestAvailabilityExceptions.priestId, targetPriestId),
            or(
              eq(priestAvailabilityExceptions.exceptionType, 'CUSTOM_HOURS'),
              eq(priestAvailabilityExceptions.isFullDay, true)
            ),
            gte(priestAvailabilityExceptions.startAt, dayStart),
            lte(priestAvailabilityExceptions.endAt, dayEnd)
          )
        );
    } else {
      const hasExceptionOverlap = await this.checkExceptionOverlap(targetPriestId, startAt, endAt);
      if (hasExceptionOverlap) {
        throw new AppError(409, 'An availability block already exists that overlaps with this time range.');
      }
    }

    const [record] = await db
      .insert(priestAvailabilityExceptions)
      .values({
        priestId: targetPriestId,
        exceptionType: exceptionType || 'BLOCK',
        isFullDay: false,
        startAt,
        endAt,
        reason: reason || (exceptionType === 'CUSTOM_HOURS' ? 'Specific Working Hours' : 'Blocked Hours'),
      })
      .returning();

    return {
      id: record.id,
      priestId: record.priestId,
      date,
      type: exceptionType === 'CUSTOM_HOURS' ? 'CUSTOM_HOURS' : 'PARTIAL_BLACKOUT',
      startTime: sTime,
      endTime: eTime,
      exceptionType: record.exceptionType,
      startAt: record.startAt ? new Date(record.startAt).toISOString() : '',
      endAt: record.endAt ? new Date(record.endAt).toISOString() : '',
      reason: record.reason || '',
      createdAt: record.createdAt ? new Date(record.createdAt).toISOString() : new Date().toISOString(),
    };
  }

  // Check if requested timestamp range overlaps with any existing availability exception
  async checkExceptionOverlap(
    priestId: string,
    startAt: Date,
    endAt: Date
  ): Promise<boolean> {
    const [overlap] = await db
      .select({ id: priestAvailabilityExceptions.id })
      .from(priestAvailabilityExceptions)
      .where(
        and(
          eq(priestAvailabilityExceptions.priestId, priestId),
          lt(priestAvailabilityExceptions.startAt, endAt),
          gt(priestAvailabilityExceptions.endAt, startAt)
        )
      )
      .limit(1);

    return !!overlap;
  }

  // Check if a requested time range overlaps with any confirmed ceremony booking
  async checkBookingOverlap(
    priestId: string,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<boolean> {
    const targetPriestId = (await resolvePriestProfileId(priestId)) || priestId;

    const confirmedBookings = await db
      .select({
        startTime: bookings.startTime,
        endTime: bookings.endTime,
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.priestId, targetPriestId),
          eq(bookings.bookingDate, date),
          eq(bookings.status, 'CONFIRMED')
        )
      );

    return confirmedBookings.some((b) => {
      return startTime < b.endTime && endTime > b.startTime;
    });
  }

  /**
   * Check if a proposed ceremony slot (date, startTime, endTime) is valid & available
   * against priest working hours, full day leaves, custom hours, and partial blackouts.
   */
  async isTimeSlotAvailable(
    priestId: string,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<{ available: boolean; reason?: string }> {
    const targetPriestId = (await resolvePriestProfileId(priestId)) || priestId;

    const [profile] = await db
      .select({
        defaultStartTime: priestProfiles.defaultStartTime,
        defaultEndTime: priestProfiles.defaultEndTime,
      })
      .from(priestProfiles)
      .where(eq(priestProfiles.id, targetPriestId))
      .limit(1);

    const exceptions = await db
      .select()
      .from(priestAvailabilityExceptions)
      .where(eq(priestAvailabilityExceptions.priestId, targetPriestId));

    const dayExceptions = exceptions.filter((e) => {
      const eDate = toISTDateString(new Date(e.startAt));
      return eDate === date;
    });

    // 1. Check Full Day Leave
    const isFullDayOff = dayExceptions.some((e) => e.isFullDay === true);
    if (isFullDayOff) {
      return { available: false, reason: 'The priest has marked this date as a full day off.' };
    }

    // 2. Check Custom / Specific Working Hours for this date
    const customHoursEx = dayExceptions.find((e) => e.exceptionType === 'CUSTOM_HOURS');
    if (customHoursEx) {
      const customStart = toISTTimeString(new Date(customHoursEx.startAt));
      const customEnd = toISTTimeString(new Date(customHoursEx.endAt));
      if (startTime < customStart || endTime > customEnd) {
        return {
          available: false,
          reason: `The priest is only available for ceremonies during configured specific hours (${customStart} – ${customEnd}) on this date.`,
        };
      }
    } else {
      // Check standard working hours
      const defStart = profile?.defaultStartTime ? profile.defaultStartTime.slice(0, 5) : '07:00';
      const defEnd = profile?.defaultEndTime ? profile.defaultEndTime.slice(0, 5) : '21:00';
      if (startTime < defStart || endTime > defEnd) {
        return {
          available: false,
          reason: `Requested time is outside the priest's standard working hours (${defStart} – ${defEnd}).`,
        };
      }
    }

    // 3. Check Partial Blackouts (BLOCK)
    const blackoutEx = dayExceptions.filter((e) => e.exceptionType === 'BLOCK' && !e.isFullDay);
    for (const bo of blackoutEx) {
      const boStart = toISTTimeString(new Date(bo.startAt));
      const boEnd = toISTTimeString(new Date(bo.endAt));
      if (startTime < boEnd && endTime > boStart) {
        return {
          available: false,
          reason: `The priest has blocked hours (${boStart} – ${boEnd}${bo.reason ? `: ${bo.reason}` : ''}) during this time.`,
        };
      }
    }

    return { available: true };
  }

  // Calculate 90-day availability calendar matrix
  async calculateMonthAvailability(
    priestId: string,
    startDate?: string,
    endDate?: string
  ): Promise<DayAvailability[]> {
    const targetPriestId = (await resolvePriestProfileId(priestId)) || priestId;

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 90 * 24 * 60 * 60 * 1000);
    const endLimitDate = new Date(end);
    endLimitDate.setUTCHours(23, 59, 59, 999);

    const exceptions = await db
      .select()
      .from(priestAvailabilityExceptions)
      .where(
        and(
          eq(priestAvailabilityExceptions.priestId, targetPriestId),
          gte(priestAvailabilityExceptions.endAt, start),
          lte(priestAvailabilityExceptions.startAt, endLimitDate)
        )
      );

    const confirmedBookings = await db
      .select({
        bookingDate: bookings.bookingDate,
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.priestId, targetPriestId),
          eq(bookings.status, 'CONFIRMED')
        )
      );

    const result: DayAvailability[] = [];
    const current = new Date(start);
    current.setUTCHours(0, 0, 0, 0);

    while (current <= endLimitDate) {
      const dateStr = toISTDateString(current);

      const dayExceptions = exceptions.filter((e) => {
        const eDate = toISTDateString(new Date(e.startAt));
        return eDate === dateStr;
      });

      const isFullDayOff = dayExceptions.some((e) => e.isFullDay === true);

      const hasCustomHours = dayExceptions.some((e) => e.exceptionType === 'CUSTOM_HOURS');

      const status: 'AVAILABLE' | 'FULL_DAY_OFF' | 'PARTIAL_BLOCK' | 'CUSTOM_HOURS' = isFullDayOff
        ? 'FULL_DAY_OFF'
        : hasCustomHours
        ? 'CUSTOM_HOURS'
        : dayExceptions.length > 0
        ? 'PARTIAL_BLOCK'
        : 'AVAILABLE';

      const hasBooking = confirmedBookings.some((b) => b.bookingDate === dateStr);

      const blockedSlots = dayExceptions.map((e) => {
        const s = new Date(e.startAt);
        const en = new Date(e.endAt);
        return {
          startTime: toISTTimeString(s),
          endTime: toISTTimeString(en),
          reason: e.reason,
          exceptionType: e.exceptionType,
        };
      });

      result.push({
        date: dateStr,
        status,
        hasBooking,
        blockedSlots,
      });

      current.setDate(current.getDate() + 1);
    }

    return result;
  }

  // Calculate Muhurat day slots for a priest on a target date
  async getDaySlots(
    priestId: string,
    date: string,
    durationMinutes: number = 120
  ): Promise<any[]> {
    const targetPriestId = (await resolvePriestProfileId(priestId)) || priestId;

    const [profile] = await db
      .select({
        defaultStartTime: priestProfiles.defaultStartTime,
        defaultEndTime: priestProfiles.defaultEndTime,
      })
      .from(priestProfiles)
      .where(eq(priestProfiles.id, targetPriestId))
      .limit(1);

    const defaultStartTime = profile?.defaultStartTime?.slice(0, 5) || '07:00';
    const defaultEndTime = profile?.defaultEndTime?.slice(0, 5) || '21:00';

    const dayStart = parseISTDateTime(date, '00:00');
    const dayEnd = parseISTDateTime(date, '23:59');

    const exceptions = await db
      .select()
      .from(priestAvailabilityExceptions)
      .where(
        and(
          eq(priestAvailabilityExceptions.priestId, targetPriestId),
          gte(priestAvailabilityExceptions.endAt, dayStart),
          lte(priestAvailabilityExceptions.startAt, dayEnd)
        )
      );

    const hasFullLeave = exceptions.some((e) => e.isFullDay);
    if (hasFullLeave) return [];

    const activeBookings = await db
      .select({
        startTime: bookings.startTime,
        endTime: bookings.endTime,
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.priestId, targetPriestId),
          eq(bookings.bookingDate, date),
          or(eq(bookings.status, 'CONFIRMED'), eq(bookings.status, 'PENDING'))
        )
      );

    const timeToMins = (t: string) => {
      const [h = '0', m = '0'] = t.split(':');
      return parseInt(h, 10) * 60 + parseInt(m, 10);
    };

    const minsToTime = (mins: number) => {
      const h = Math.floor(mins / 60).toString().padStart(2, '0');
      const m = (mins % 60).toString().padStart(2, '0');
      return `${h}:${m}`;
    };

    const startMin = timeToMins(defaultStartTime);
    const endMin = timeToMins(defaultEndTime);

    const slots: any[] = [];
    let currentStart = startMin;

    while (currentStart + durationMinutes <= endMin) {
      const currentEnd = currentStart + durationMinutes;
      const startStr = minsToTime(currentStart);
      const endStr = minsToTime(currentEnd);

      const matchingBlackout = exceptions.find((e) => {
        const boStart = timeToMins(toISTTimeString(new Date(e.startAt)));
        const boEnd = timeToMins(toISTTimeString(new Date(e.endAt)));
        return currentStart < boEnd && currentEnd > boStart;
      });

      const matchingBooking = activeBookings.find((b) => {
        const bStart = timeToMins(b.startTime);
        const bEnd = timeToMins(b.endTime);
        return currentStart < bEnd && currentEnd > bStart;
      });

      const isBlocked = Boolean(matchingBlackout);
      const isBooked = Boolean(matchingBooking);

      slots.push({
        id: `slot-${date}-${startStr}-${endStr}`,
        priestId: targetPriestId,
        date,
        slotDate: date,
        startTime: startStr,
        endTime: endStr,
        status: isBlocked || isBooked ? 'BOOKED' : 'AVAILABLE',
        isBlocked,
        blockedReason: matchingBlackout?.reason || (isBooked ? 'Booked' : undefined),
      });

      currentStart += durationMinutes;
    }

    return slots;
  }
}

export const availabilityService = new AvailabilityService();
