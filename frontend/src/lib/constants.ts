/**
 * Application Constants for PujaCircle
 */

export const APP_CONFIG = {
  APP_NAME: 'PujaCircle',
  TAGLINE: 'Traditional rituals, made easier for modern India',
  DEFAULT_COUNTRY: 'India',
  DEFAULT_COUNTRY_CODE: '+91',
  DEFAULT_PAGE_SIZE: 10,
  SUPPORT_EMAIL: 'support@pujacircle.in',
  SUPPORT_PHONE: '+91 80000 00000',
  BOOKING_RESPONSE_HOURS: 5,
} as const;

export const USER_ROLES = {
  USER: 'USER',
  PRIEST: 'PRIEST',
  ADMIN: 'ADMIN',
} as const;

export const ACCOUNT_STATUS = {
  ACTIVE: 'ACTIVE',
  BANNED: 'BANNED',
} as const;

export const PRIEST_APPROVAL_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
} as const;

export const PAYMENT_METHOD = {
  OFFLINE_CASH: 'OFFLINE_CASH',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PAID_OFFLINE: 'PAID_OFFLINE',
} as const;

export const SLOT_STATUS = {
  AVAILABLE: 'AVAILABLE',
  BOOKED: 'BOOKED',
  BLOCKED: 'BLOCKED',
} as const;

export const ADDRESS_LABELS = {
  HOME: 'HOME',
  OFFICE: 'OFFICE',
  TEMPLE: 'TEMPLE',
  OTHER: 'OTHER',
} as const;

export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export const SLOT_DURATION_OPTIONS = [
  { label: '30 Minutes', value: 30 },
  { label: '60 Minutes (1 Hour)', value: 60 },
  { label: '90 Minutes (1.5 Hours)', value: 90 },
  { label: '120 Minutes (2 Hours)', value: 120 },
] as const;

export const BUFFER_OPTIONS = [
  { label: 'No Buffer', value: 0 },
  { label: '15 Minutes', value: 15 },
  { label: '30 Minutes', value: 30 },
] as const;

export const RITUAL_CATEGORIES = [
  'Grah Pravesh & Vastu',
  'Festivals & Vrats',
  'Havan & Yagya',
  'Sanskars & Lifecycle',
  'Special Poojas',
] as const;

export const INDIAN_LANGUAGES = [
  'Hindi',
  'Bengali',
  'Sanskrit',
  'Tamil',
  'Telugu',
  'Marathi',
  'Gujarati',
  'Kannada',
  'Malayalam',
  'Odia',
  'English',
] as const;

/**
 * Standardized Booking Status Configuration
 * Central single-source-of-truth for status colors, badges, pills, and labels (DRY).
 */
export const BOOKING_STATUS_CONFIG = {
  CONFIRMED: {
    label: 'Confirmed',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    pillClass: 'bg-emerald-500/15 text-emerald-600',
    dotClass: 'bg-emerald-500',
  },
  COMPLETED: {
    label: 'Completed',
    badgeClass: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    pillClass: 'bg-blue-500/15 text-blue-600',
    dotClass: 'bg-blue-500',
  },
  PENDING: {
    label: 'Awaiting Confirmation',
    shortLabel: 'Pending',
    badgeClass: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    pillClass: 'bg-amber-500/15 text-amber-600',
    dotClass: 'bg-amber-500',
  },
  CANCELLED: {
    label: 'Cancelled',
    badgeClass: 'bg-destructive/10 text-destructive border-destructive/20',
    pillClass: 'bg-destructive/15 text-destructive',
    dotClass: 'bg-destructive',
  },
  REJECTED: {
    label: 'Declined',
    badgeClass: 'bg-destructive/10 text-destructive border-destructive/20',
    pillClass: 'bg-destructive/15 text-destructive',
    dotClass: 'bg-destructive',
  },
  EXPIRED: {
    label: 'Expired',
    badgeClass: 'bg-muted-foreground/10 text-muted-foreground border-border',
    pillClass: 'bg-muted-foreground/15 text-muted-foreground',
    dotClass: 'bg-muted-foreground',
  },
} as const;

