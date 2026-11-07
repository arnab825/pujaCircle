import { UserProfile, UpdateUserProfileRequest } from '@/types/user.types';
import { apiClient } from '@/api/client';
import { logAppError, getUserFriendlyErrorMessage } from '@/lib/errorHandler';

export const userApi = {
  getProfile: async (_userId?: string): Promise<UserProfile | null> => {
    try {
      const res = await apiClient.get('/users/profile');
      return (res as any).data || res;
    } catch (error) {
      logAppError('userApi.getProfile', error);
      return null;
    }
  },

  updateProfile: async (
    _userId: string | undefined,
    data: UpdateUserProfileRequest
  ): Promise<{ success: boolean; data?: UserProfile; message: string }> => {
    try {
      const res = await apiClient.put('/users/profile', data);
      return res as any;
    } catch (error) {
      logAppError('userApi.updateProfile', error, { data });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to update profile. Please try again.'),
      };
    }
  },

  changePassword: async (data: {
    currentPassword?: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await apiClient.post('/users/change-password', data);
      return res as any;
    } catch (error) {
      logAppError('userApi.changePassword', error);
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to update password.'),
      };
    }
  },
};
