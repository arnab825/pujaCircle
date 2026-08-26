import * as mockApi from '@/mocks/mock-api';
import { Priest, PriestFilterParams } from '@/types/priest.types';
import { Booking } from '@/types/booking.types';

export const adminApi = {
  // Priest Management
  getAllPriests: async (params?: PriestFilterParams): Promise<Priest[]> => {
    const res = await mockApi.mockGetPriests(params);
    return res.data || [];
  },

  getPendingPriests: async (): Promise<Priest[]> => {
    const res = await mockApi.mockAdminGetPriests();
    return res.data?.filter((p) => p.approvalStatus === 'PENDING') || [];
  },

  approvePriest: async (priestId: string): Promise<{ success: boolean; message: string }> => {
    return mockApi.mockAdminApprovePriest(priestId);
  },

  rejectPriest: async (priestId: string, reason?: string): Promise<{ success: boolean; message: string }> => {
    return mockApi.mockAdminRejectPriest(priestId, reason || 'Incomplete documentation');
  },

  banPriest: async (priestId: string, reason?: string): Promise<{ success: boolean; message: string }> => {
    return mockApi.mockAdminBanPriest(priestId, reason || 'Policy violation');
  },

  reactivatePriest: async (priestId: string): Promise<{ success: boolean; message: string }> => {
    return mockApi.mockAdminUnbanPriest(priestId);
  },

  // Devotee / User Management
  getAllUsers: async (): Promise<any[]> => {
    const res = await mockApi.mockAdminGetUsers();
    return res.data || [];
  },

  updateUserStatus: async (userId: string, status: string, reason?: string) => {
    if (status === 'BANNED' || status === 'SUSPENDED') {
      return mockApi.mockAdminBanUser(userId, reason || 'Administrative action');
    }
    return mockApi.mockAdminUnbanUser(userId);
  },

  // Platform Bookings
  getAllBookings: async (): Promise<Booking[]> => {
    const res = await mockApi.mockGetBookings();
    return res.data || [];
  },
};
