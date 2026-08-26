import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BookingStatus } from '@/types/booking.types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Standard Indian Currency Formatter (₹)
 * Example: formatCurrency(4500) -> "₹4,500"
 */
export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export const formatINR = formatCurrency;

/**
 * Standard Date Formatter
 * Example: formatDate("2026-09-05") -> "05 Sep 2026"
 */
export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00`);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Detailed Date Formatter with Weekday
 * Example: formatFullDate("2026-09-05") -> "Saturday, 5 September 2026"
 */
export function formatFullDate(dateString: string | undefined | null): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00`);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Standard Time Formatter (12-hour AM/PM or HH:MM)
 * Example: formatTime("09:30") -> "09:30 AM"
 */
export function formatTime(timeStr: string | undefined | null): string {
  if (!timeStr) return '—';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return timeStr;

  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = m < 10 ? `0${m}` : `${m}`;
  return `${displayH}:${displayM} ${period}`;
}

/**
 * Calculate duration between two HH:MM strings in minutes
 */
export function calculateSlotDuration(startTime: string, endTime: string): number {
  const [sH, sM] = startTime.split(':').map(Number);
  const [eH, eM] = endTime.split(':').map(Number);
  if (isNaN(sH) || isNaN(sM) || isNaN(eH) || isNaN(eM)) return 0;
  return eH * 60 + eM - (sH * 60 + sM);
}

/**
 * Check if two time intervals on the same day overlap
 * Condition: newStart < existingEnd AND newEnd > existingStart
 */
export function slotsOverlap(
  s1: { startTime: string; endTime: string },
  s2: { startTime: string; endTime: string }
): boolean {
  const [s1H, s1M] = s1.startTime.split(':').map(Number);
  const [e1H, e1M] = s1.endTime.split(':').map(Number);
  const [s2H, s2M] = s2.startTime.split(':').map(Number);
  const [e2H, e2M] = s2.endTime.split(':').map(Number);

  const start1 = s1H * 60 + s1M;
  const end1 = e1H * 60 + e1M;
  const start2 = s2H * 60 + s2M;
  const end2 = e2H * 60 + e2M;

  return start1 < end2 && end1 > start2;
}

/**
 * Get human-readable label for booking status
 */
export function getBookingStatusLabel(status: BookingStatus): string {
  switch (status) {
    case 'PENDING':
      return 'Pending Acceptance';
    case 'CONFIRMED':
      return 'Confirmed';
    case 'COMPLETED':
      return 'Completed';
    case 'REJECTED':
      return 'Declined by Priest';
    case 'CANCELLED':
      return 'Cancelled';
    case 'EXPIRED':
      return 'Expired (No Response)';
    default:
      return status;
  }
}

/**
 * Get color tokens for booking status badges
 */
export function getBookingStatusColor(status: BookingStatus): {
  bg: string;
  text: string;
  border: string;
} {
  switch (status) {
    case 'CONFIRMED':
      return {
        bg: 'bg-emerald-500/10 dark:bg-emerald-950/40',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-500/30',
      };
    case 'PENDING':
      return {
        bg: 'bg-amber-500/10 dark:bg-amber-950/40',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-500/30',
      };
    case 'COMPLETED':
      return {
        bg: 'bg-blue-500/10 dark:bg-blue-950/40',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-500/30',
      };
    case 'REJECTED':
    case 'CANCELLED':
      return {
        bg: 'bg-destructive/10 dark:bg-destructive/30',
        text: 'text-destructive',
        border: 'border-destructive/30',
      };
    case 'EXPIRED':
      return {
        bg: 'bg-muted dark:bg-muted/40',
        text: 'text-muted-foreground',
        border: 'border-border',
      };
    default:
      return {
        bg: 'bg-muted',
        text: 'text-muted-foreground',
        border: 'border-border',
      };
  }
}

/**
 * Check if a booking deadline has expired
 */
export function isBookingExpired(deadline: string | undefined | null): boolean {
  if (!deadline) return false;
  return new Date(deadline).getTime() < Date.now();
}

/**
 * Get dashboard / default home path based on user role
 */
export function getRoleHomePath(role: 'USER' | 'PRIEST' | 'ADMIN' | undefined | null): string {
  switch (role) {
    case 'PRIEST':
      return '/priest/dashboard';
    case 'ADMIN':
      return '/admin/dashboard';
    case 'USER':
    default:
      return '/';
  }
}

/**
 * Clean and format 10-digit Indian phone number
 */
export function normalizePhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  return phone.trim();
}

/**
 * Normalize and title-case service/ritual names
 */
export function normalizeServiceName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
