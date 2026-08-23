import * as mockApi from '@/mocks/mock-api';
import { RegisterUserRequest, AuthResponse, VerifyOtpRequest } from '@/types/auth.types';

/**
 * Authentication API Service
 * Delegated to Mock API in Phase 1 scaffolding.
 */
export const authApi = {
  sendOtp: async (phoneNumber: string) => {
    return mockApi.mockLogin(phoneNumber);
  },

  verifyOtp: async (data: VerifyOtpRequest): Promise<AuthResponse> => {
    return mockApi.mockVerifyUserOtp(data.phoneNumber, data.otp);
  },

  register: async (data: RegisterUserRequest): Promise<AuthResponse> => {
    return mockApi.mockRegisterUser(data);
  },

  logout: async () => {
    return mockApi.mockLogout();
  },
};
