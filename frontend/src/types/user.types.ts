import { Role } from './auth.types';

export interface UserProfile {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  role: Role;
  isPhoneVerified: boolean;
  profileImageUrl?: string;
  preferredLanguage?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UpdateUserProfileRequest {
  fullName?: string;
  email?: string;
  preferredLanguage?: string;
  profileImageUrl?: string;
}
