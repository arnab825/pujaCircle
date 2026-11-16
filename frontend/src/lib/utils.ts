import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
 * Format Indian phone number for clean UI display with country code (+91 XXXXX XXXXX)
 * Example: "+919876543210" -> "+91 98765 43210"
 * Example: "9876543210"    -> "+91 98765 43210"
 */
export function formatDisplayPhone(phone: string | undefined | null): string {
  if (!phone) return '—';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    const raw = digits.slice(2);
    return `+91 ${raw.slice(0, 5)} ${raw.slice(5)}`;
  }
  return phone;
}

/**
 * Get 2-character initials from a person's name
 */
export function getInitials(name: string | undefined | null): string {
  if (!name || !name.trim()) return 'PT';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.trim().slice(0, 2).toUpperCase();
}

/**
 * Strips leading 6-digit postal code and separator from a locality name,
 * returning only the place/neighborhood name.
 * Example: "713103 - Bolpur" -> "Bolpur"
 * Example: "700020 - Park Street" -> "Park Street"
 * Example: "Bandra West" -> "Bandra West"
 */
export function formatLocalityName(area: string | undefined | null): string {
  if (!area) return '';
  return area.replace(/^\d{6}\s*[-–—:]\s*/, '').trim();
}

/**
 * Canonical token normalizer for Indian district and city names
 */
export function normalizeDistrictTokens(value: string | undefined | null): string {
  if (!value) return '';
  return value
    .toLowerCase()
    .replace(/twenty\s*four/g, '24')
    .replace(/twentyfour/g, '24')
    .replace(/\bgurgaon\b/g, 'gurugram')
    .replace(/\bbangalore\b/g, 'bengaluru')
    .replace(/\bcalcutta\b/g, 'kolkata')
    .replace(/\bbombay\b/g, 'mumbai')
    .replace(/\bmadras\b/g, 'chennai')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\b(district|city|urban|rural|division|corporation)\b/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join('');
}

/**
 * Robust equivalence comparison for Indian administrative districts
 */
export function areDistrictsEquivalent(firstDistrict: string | undefined | null, secondDistrict: string | undefined | null): boolean {
  if (!firstDistrict || !secondDistrict) return true;
  const n1 = normalizeDistrictTokens(firstDistrict);
  const n2 = normalizeDistrictTokens(secondDistrict);
  if (!n1 || !n2) return true;
  return n1 === n2 || n1.includes(n2) || n2.includes(n1);
}

