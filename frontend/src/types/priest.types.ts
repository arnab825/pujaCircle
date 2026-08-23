export type PriestApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type SlotStatus = 'AVAILABLE' | 'BOOKED' | 'BLOCKED';

export interface Priest {
  id: string;
  fullName: string;
  displayName: string;
  phoneNumber: string;
  email?: string;
  isPhoneVerified: boolean;
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
  ritualSlug?: string;
  language?: string;
  specialization?: string;
  searchQuery?: string;
}
