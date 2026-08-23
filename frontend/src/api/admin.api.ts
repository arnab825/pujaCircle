import * as mockApi from '@/mocks/mock-api';
import { Priest, PriestFilterParams } from '@/types/priest.types';
import { UserProfile, UserStatus } from '@/types/user.types';
import { Booking } from '@/types/booking.types';

export const adminApi = {
  // Priest Management
  getAllPriests: async (params?: PriestFilterParams): Promise<Priest[]> => {
    return mockApi.mockGetAllPriests(params);
  },

  getPendingPriests: async (): Promise<Priest[]> => {
    return mockApi.mockGetPendingPriests();
  },

  approvePriest: async (priestId: string): Promise<Priest> => {
    return mockApi.mockApprovePriest(priestId);
  },

  rejectPriest: async (priestId: string, reason?: string): Promise<Priest> => {
    return mockApi.mockRejectPriest(priestId, reason);
  },


  banPriest: async (priestId: string, reason?: string): Promise<Priest> => {
    return mockApi.mockBanPriest(priestId, reason);
  },

  reactivatePriest: async (priestId: string): Promise<Priest> => {
    return mockApi.mockReactivatePriest(priestId);
  },

  deletePriest: async (priestId: string): Promise<{ success: boolean; message: string }> => {
    return mockApi.mockDeletePriest(priestId);
  },

  // Devotee / User Management
  getAllUsers: async (): Promise<UserProfile[]> => {
    return mockApi.mockGetAllUsers();
  },

  updateUserStatus: async (userId: string, status: UserStatus) => {
    return mockApi.mockUpdateUserStatus(userId, status);
  },

  // Platform Bookings
  getAllBookings: async (): Promise<Booking[]> => {
    return mockApi.mockGetAllBookings();
  },
};
