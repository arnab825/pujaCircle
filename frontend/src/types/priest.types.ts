import { AccountStatus } from './auth.types';

export type PriestApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type SlotStatus = 'AVAILABLE' | 'BOOKED' | 'BLOCKED';

export interface PriestService {
  id: string;
  priestId: string;
  serviceName: string;
  price: number; // Single authoritative service price in INR (₹)
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Priest {
  id: string;
  fullName: string;
  displayName: string;
  phoneNumber: string;
  email?: string;
  isPhoneVerified: boolean;
  isEmailVerified?: boolean;
  approvalStatus: PriestApprovalStatus;
  accountStatus: AccountStatus;
  banReason?: string;
  rejectionReason?: string;
  experienceYears: number;
  bio: string;
  languages: string[];
  specializations: string[];
  serviceAreas: string[];
  city: string;
  state: string;
  profileImageUrl: string;
  rating?: number;
  reviewCount?: number;
  services?: PriestService[];
  createdAt: string;
  updatedAt?: string;
}

export interface Ritual {
  id: string;
  name: string;
  slug: string;
  description: string;
  approximateDurationMinutes: number;
  category: string;
  requirements: string[];
  imageUrl?: string;
  suggestedDakshina?: number;
}

/**
 * Weekly Recurring Availability Rule (Doctor/Priest schedule template)
 * Day 0 = Sunday, 1 = Monday, ..., 6 = Saturday
 */
export interface WeeklyAvailabilityRule {
  id: string;
  priestId: string;
  dayOfWeek: number; // 0 Sunday through 6 Saturday
  startTime: string; // HH:mm (24-hour)
  endTime: string; // HH:mm (24-hour)
  slotDurationMinutes: number; // e.g. 30, 60, 90, 120
  bufferMinutes: number; // e.g. 0, 15, 30
  isActive: boolean;
  effectiveFrom?: string; // YYYY-MM-DD
  effectiveUntil?: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt?: string;
}

/**
 * Date-Specific Availability Exception
 * Used for blocking full/partial days (e.g. holidays, travel) or custom muhurat hours.
 */
export interface AvailabilityException {
  id: string;
  priestId: string;
  date: string; // YYYY-MM-DD
  type: 'BLOCKED' | 'CUSTOM';
  reason?: string;
  customSlots?: Array<{
    startTime: string;
    endTime: string;
  }>;
  createdAt: string;
}

/**
 * Calculated/Derived or Stored Available Slot
 */
export interface PriestSlot {
  id: string;
  priestId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: SlotStatus;
  ruleId?: string;
  isException?: boolean;
}

export interface PriestRegistrationRequest {
  fullName: string;
  phoneNumber: string;
  email?: string;
  experienceYears: number;
  bio: string;
  languages: string[];
  specializations: string[];
  serviceAreas: string[];
  city: string;
  state: string;
}

export interface PriestFilterParams {
  city?: string;
  serviceName?: string;
  ritualSlug?: string;
  language?: string;
  specialization?: string;
  searchQuery?: string;
  date?: string;
  status?: PriestApprovalStatus | 'ALL';
  accountStatus?: AccountStatus | 'ALL';
  minPrice?: number;
  maxPrice?: number;
  minExperience?: number;
  minRating?: number;
}
