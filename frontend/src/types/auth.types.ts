export type Role = 'USER' | 'PRIEST' | 'ADMIN';

export interface AuthUser {
  id: string;
  fullName: string;
  phoneNumber: string;
  role: Role;
  isPhoneVerified: boolean;
  profileImageUrl?: string;
  createdAt: string;
}

export interface SendOtpRequest {
  phoneNumber: string;
  role?: Role;
}

export interface VerifyOtpRequest {
  phoneNumber: string;
  otp: string;
  role?: Role;
}

export interface AuthResponse {
  user: AuthUser;
  token?: string;
  message: string;
}

export interface RegisterUserRequest {
  fullName: string;
  phoneNumber: string;
  email?: string;
}
