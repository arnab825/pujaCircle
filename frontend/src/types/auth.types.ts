export type Role = 'USER' | 'PRIEST' | 'ADMIN';

export interface AuthUser {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  role: Role;
  hasAddress?: boolean;
  password?: string; // Mock only
}

export interface LoginCredentials {
  identifier?: string; // +91 phone number for USER & PRIEST, or email for ADMIN
  email?: string;
  phoneNumber?: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: AuthUser;
  };
}

export interface PhoneOtpRequest {
  phoneNumber: string;
}

export interface VerifyPhoneOtpRequest {
  phoneNumber: string;
  otp: string;
}

export interface EmailOtpRequest {
  email: string;
}

export interface VerifyEmailOtpRequest {
  email: string;
  otp: string;
  newPassword?: string;
}
