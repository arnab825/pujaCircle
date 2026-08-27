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
 * Direct Date-Based Priest Availability Slot
 */
export interface PriestSlot {
  id: string;
  priestId: string;
  slotDate: string; // YYYY-MM-DD
  date?: string; // Backward compatibility alias (same as slotDate)
  startTime: string; // HH:mm (24-hour)
  endTime: string; // HH:mm (24-hour)
  status: SlotStatus;
  bookingId?: string;
  ruleId?: string;
  isException?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Legacy interfaces kept for backward-compatibility
 */
export interface WeeklyAvailabilityRule {
  id: string;
  priestId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  bufferMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AvailabilityException {
  id: string;
  priestId: string;
  date: string;
  type: 'BLOCKED' | 'CUSTOM';
  reason?: string;
  customSlots?: Array<{
    startTime: string;
    endTime: string;
  }>;
  createdAt: string;
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
