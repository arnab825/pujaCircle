/**
 * [UTILS] Priest Availability & Date Formatting Utilities
 * Lightweight helpers for timezone formatting and time display.
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
  createdAt?: string;
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

/** Convert "HH:MM" (e.g. "07:30") to total minutes from midnight */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h = '0', m = '0'] = timeStr.split(':');
  return parseInt(h, 10) * 60 + parseInt(m, 10);
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
  const [h = 0, m = 0] = timeStr.split(':').map(Number);
  return {
    istDate,
    istMinutes: h * 60 + m,
    istTime: timeStr,
  };
}

/** Get tomorrow's date string (YYYY-MM-DD) in Asia/Kolkata (IST) */
export function getISTTomorrow(): string {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(tomorrow);
}

/** Format time from "14:30" to "2:30 PM" */
export function formatTimeAmPm(timeStr: string): string {
  if (!timeStr) return '';
  const [hours = 0, minutes = 0] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes ? `:${minutes.toString().padStart(2, '0')}` : ':00';
  return `${displayHours}${displayMinutes} ${period}`;
}
