// Presentation ViewModel for verified Purohit priest profiles
export interface PriestViewModel {
  id: string;
  userId: string;
  fullName: string;
  displayName: string;
  phoneNumber: string;
  email?: string | null;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  accountStatus: 'ACTIVE' | 'BANNED';
  banReason?: string | null;
  experienceYears: number;
  bio: string;
  languages: string[];
  specializations: string[];
  serviceAreas: string[];
  city: string;
  state: string;
  pincode?: string | null;
  profileImageUrl: string;
  rating: number;
  reviewCount: number;
  defaultStartTime?: string | null;
  defaultEndTime?: string | null;
  createdAt: string;
  isPhoneVerified?: boolean;
  services?: PriestServiceViewModel[];
}

// Presentation ViewModel for priest ritual service offerings
export interface PriestServiceViewModel {
  id: string;
  priestId: string;
  serviceName: string;
  price: number;
  category: string;
  samagriList: string[];
  isActive: boolean;
  isCustom: boolean;
  pujaCatalogId?: string | null;
  durationMinutes?: number | null;
}
