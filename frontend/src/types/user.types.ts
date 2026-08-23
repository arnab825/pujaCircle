import { Role } from './auth.types';

export type UserStatus = 'ACTIVE' | 'SUSPENDED';

export interface UserProfile {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  role: Role;
  status?: UserStatus;
  primaryCity?: string;
  addressSummary?: string;
  bookingCount?: number;
  createdAt?: string;
}

export interface UpdateUserProfileRequest {
  name?: string;
  email?: string;
  phoneNumber?: string;
  status?: UserStatus;
}
