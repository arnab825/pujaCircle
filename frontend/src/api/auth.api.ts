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
import { logAppError, getUserFriendlyErrorMessage } from '@/lib/errorHandler';

/**
 * Authentication API (Frontend Layer)
 * Connects directly to mock API with centralized safe error handling and debugging logs.
 */
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      return await mockLogin(credentials);
    } catch (error) {
      logAppError('authApi.login', error, { identifier: credentials.identifier || credentials.phoneNumber || credentials.email });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Sign in failed. Please verify your credentials and try again.'),
      };
    }
  },

  logout: async (): Promise<{ success: boolean; message: string }> => {
    try {
      return await mockLogout();
    } catch (error) {
      logAppError('authApi.logout', error);
      return { success: true, message: 'Logged out successfully.' };
    }
  },

  sendPhoneOtp: async (data: PhoneOtpRequest): Promise<{ success: boolean; message: string }> => {
    try {
      return await mockSendPhoneOtp(data);
    } catch (error) {
      logAppError('authApi.sendPhoneOtp', error, { phoneNumber: data.phoneNumber });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to dispatch verification code. Please try again.'),
      };
    }
  },

  verifyPhoneOtp: async (data: VerifyPhoneOtpRequest): Promise<{ success: boolean; message: string }> => {
    try {
      return await mockVerifyPhoneOtp(data);
    } catch (error) {
      logAppError('authApi.verifyPhoneOtp', error, { phoneNumber: data.phoneNumber });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Verification failed. Please check the code and try again.'),
      };
    }
  },

  sendEmailOtp: async (data: EmailOtpRequest): Promise<{ success: boolean; message: string }> => {
    try {
      return await mockSendEmailOtp(data);
    } catch (error) {
      logAppError('authApi.sendEmailOtp', error, { email: data.email });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to send password reset code. Please try again.'),
      };
    }
  },

  verifyEmailOtp: async (data: VerifyEmailOtpRequest): Promise<{ success: boolean; message: string }> => {
    try {
      return await mockVerifyEmailOtp(data);
    } catch (error) {
      logAppError('authApi.verifyEmailOtp', error, { email: data.email });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Verification failed. Please check the code and try again.'),
      };
    }
  },
};
