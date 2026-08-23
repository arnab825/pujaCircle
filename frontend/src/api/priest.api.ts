import * as mockApi from '@/mocks/mock-api';
import { Priest, PriestFilterParams, PriestSlot, Ritual, PriestRegistrationRequest } from '@/types/priest.types';

export const priestApi = {
  // Public Approved Priests
  getPriests: async (params?: PriestFilterParams): Promise<Priest[]> => {
    return mockApi.mockGetPriests(params);
  },

  getPriestById: async (id: string): Promise<Priest> => {
    return mockApi.mockGetPriestById(id);
  },

  getPriestSlots: async (priestId: string, date?: string): Promise<PriestSlot[]> => {
    return mockApi.mockGetPriestSlots(priestId, date);
  },

  getRituals: async (): Promise<Ritual[]> => {
    return mockApi.mockGetRituals();
  },

  getRitualBySlug: async (slug: string): Promise<Ritual> => {
    return mockApi.mockGetRitualBySlug(slug);
  },

  registerPriest: async (data: PriestRegistrationRequest): Promise<Priest> => {
    return mockApi.mockRegisterPriest(data);
  },

  // Admin Management APIs
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
};
