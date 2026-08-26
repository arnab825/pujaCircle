import * as mockApi from '@/mocks/mock-api';
import { Priest, PriestFilterParams } from '@/types/priest.types';
import { Booking } from '@/types/booking.types';
import { logAppError, getUserFriendlyErrorMessage } from '@/lib/errorHandler';

export const adminApi = {
  // Priest Management
  getAllPriests: async (params?: PriestFilterParams): Promise<Priest[]> => {
    try {
      const res = await mockApi.mockGetPriests(params);
      return res.data || [];
    } catch (error) {
      logAppError('adminApi.getAllPriests', error, { params });
      return [];
    }
  },

  getPendingPriests: async (): Promise<Priest[]> => {
    try {
      const res = await mockApi.mockAdminGetPriests();
      return res.data?.filter((p) => p.approvalStatus === 'PENDING') || [];
    } catch (error) {
      logAppError('adminApi.getPendingPriests', error);
      return [];
    }
  },

  approvePriest: async (priestId: string): Promise<{ success: boolean; message: string }> => {
    try {
      return await mockApi.mockAdminApprovePriest(priestId);
    } catch (error) {
      logAppError('adminApi.approvePriest', error, { priestId });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to approve priest application.'),
      };
    }
  },

  rejectPriest: async (priestId: string, reason?: string): Promise<{ success: boolean; message: string }> => {
    try {
      return await mockApi.mockAdminRejectPriest(priestId, reason || 'Incomplete documentation');
    } catch (error) {
      logAppError('adminApi.rejectPriest', error, { priestId, reason });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to reject priest application.'),
      };
    }
  },

  banPriest: async (priestId: string, reason?: string): Promise<{ success: boolean; message: string }> => {
    try {
      return await mockApi.mockAdminBanPriest(priestId, reason || 'Policy violation');
    } catch (error) {
      logAppError('adminApi.banPriest', error, { priestId, reason });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to suspend priest account.'),
      };
    }
  },

  reactivatePriest: async (priestId: string): Promise<{ success: boolean; message: string }> => {
    try {
      return await mockApi.mockAdminUnbanPriest(priestId);
    } catch (error) {
      logAppError('adminApi.reactivatePriest', error, { priestId });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to reactivate priest account.'),
      };
    }
  },

  // Devotee / User Management
  getAllUsers: async (): Promise<any[]> => {
    try {
      const res = await mockApi.mockAdminGetUsers();
      return res.data || [];
    } catch (error) {
      logAppError('adminApi.getAllUsers', error);
      return [];
    }
  },

  updateUserStatus: async (userId: string, status: string, reason?: string) => {
    try {
      if (status === 'BANNED' || status === 'SUSPENDED') {
        return await mockApi.mockAdminBanUser(userId, reason || 'Administrative action');
      }
      return await mockApi.mockAdminUnbanUser(userId);
    } catch (error) {
      logAppError('adminApi.updateUserStatus', error, { userId, status, reason });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to update user status.'),
      };
    }
  },

  // Platform Bookings
  getAllBookings: async (): Promise<Booking[]> => {
    try {
      const res = await mockApi.mockGetBookings();
      return res.data || [];
    } catch (error) {
      logAppError('adminApi.getAllBookings', error);
      return [];
    }
  },
};
