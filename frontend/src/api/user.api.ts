import { UserProfile, UpdateUserProfileRequest } from '@/types/user.types';
import { mockDb } from '@/mocks/db';
import { mockUpdateUserProfile } from '@/mocks/mock-api';
import { delay } from '@/mocks/delay';
import { logAppError, getUserFriendlyErrorMessage } from '@/lib/errorHandler';

export const userApi = {
  getProfile: async (userId = 'user-devotee-1'): Promise<UserProfile | null> => {
    try {
      await delay(200);
      const user = mockDb.users.find((u) => u.id === userId);
      if (!user) return null;
      return {
        id: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        email: user.email,
        role: user.role,
      };
    } catch (error) {
      logAppError('userApi.getProfile', error, { userId });
      return null;
    }
  },

  updateProfile: async (
    userId: string,
    data: UpdateUserProfileRequest
  ): Promise<{ success: boolean; data?: UserProfile; message: string }> => {
    try {
      const res = await mockUpdateUserProfile(userId, {
        fullName: data.name,
        email: data.email,
      });

      if (!res.success || !res.data) {
        return {
          success: false,
          message: res.message || 'Failed to update profile.',
        };
      }

      return {
        success: true,
        data: {
          id: res.data.id,
          name: res.data.name,
          phoneNumber: res.data.phoneNumber,
          email: res.data.email,
          role: res.data.role,
        },
        message: 'Profile updated successfully.',
      };
    } catch (error) {
      logAppError('userApi.updateProfile', error, { userId, data });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to update profile. Please try again.'),
      };
    }
  },
};
