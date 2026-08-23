import {
  mockLogin,
  mockLogout,
  mockSendPhoneOtp,
  mockVerifyPhoneOtp,
  mockSendEmailOtp,
  mockVerifyEmailOtp,
} from '@/mocks/mock-api';
import {
  LoginCredentials,
  AuthResponse,
  PhoneOtpRequest,
  VerifyPhoneOtpRequest,
  EmailOtpRequest,
  VerifyEmailOtpRequest,
} from '@/types/auth.types';

/**
 * Authentication API (Frontend Layer)
 * Connects directly to mock API for local development.
 */
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return mockLogin(credentials);
  },

  logout: async (): Promise<{ success: boolean; message: string }> => {
    return mockLogout();
  },

  sendPhoneOtp: async (data: PhoneOtpRequest) => {
    return mockSendPhoneOtp(data);
  },

  verifyPhoneOtp: async (data: VerifyPhoneOtpRequest) => {
    return mockVerifyPhoneOtp(data);
  },

  sendEmailOtp: async (data: EmailOtpRequest) => {
    return mockSendEmailOtp(data);
  },

  verifyEmailOtp: async (data: VerifyEmailOtpRequest) => {
    return mockVerifyEmailOtp(data);
  },
};
