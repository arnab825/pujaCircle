import * as mockApi from '@/mocks/mock-api';
import { Priest, PriestFilterParams, PriestSlot, Ritual } from '@/types/priest.types';

export const priestApi = {
  // Public Approved Priests
  getPriests: async (params?: PriestFilterParams): Promise<Priest[]> => {
    const res = await mockApi.mockGetPriests(params);
    return res.data || [];
  },

  getPriestById: async (id: string): Promise<Priest | undefined> => {
    const res = await mockApi.mockGetPriestById(id);
    return res.data;
  },

  getPriestSlots: async (priestId: string, date?: string): Promise<PriestSlot[]> => {
    const res = await mockApi.mockGetPriestSlots(priestId, date);
    return res.data || [];
  },

  getRituals: async (): Promise<Ritual[]> => {
    const res = await mockApi.mockGetRituals();
    return res.data || [];
  },

  // Admin Management APIs
  getAllPriests: async (params?: PriestFilterParams): Promise<Priest[]> => {
    const res = await mockApi.mockGetPriests(params ? { ...params, status: 'ALL' } : { status: 'ALL' });
    return res.data || [];
  },

  getPendingPriests: async (): Promise<Priest[]> => {
    const res = await mockApi.mockAdminGetPriests();
    return res.data?.filter((p) => p.approvalStatus === 'PENDING') || [];
  },

  approvePriest: async (priestId: string) => {
    return mockApi.mockAdminApprovePriest(priestId);
  },

  rejectPriest: async (priestId: string, reason: string = 'Application incomplete') => {
    return mockApi.mockAdminRejectPriest(priestId, reason);
  },

  banPriest: async (priestId: string, reason: string = 'Policy violation') => {
    return mockApi.mockAdminBanPriest(priestId, reason);
  },

  reactivatePriest: async (priestId: string) => {
    return mockApi.mockAdminUnbanPriest(priestId);
  },
};
