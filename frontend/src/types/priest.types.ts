export type PriestApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'BANNED';
export type SlotStatus = 'AVAILABLE' | 'BOOKED' | 'BLOCKED';

export interface PriestService {
  id: string;
  priestId: string;
  serviceName: string;
  price: number;
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
  dakshinaSuggested?: number;
  statusReason?: string;
  rejectionReason?: string;
  banReason?: string;
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

export interface PriestSlot {
  id: string;
  priestId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: SlotStatus;
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
  minPrice?: number;
  maxPrice?: number;
  minExperience?: number;
  minRating?: number;
}
