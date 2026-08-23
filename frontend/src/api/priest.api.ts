import * as mockApi from '@/mocks/mock-api';
import { Priest, PriestFilterParams, PriestSlot, Ritual, PriestRegistrationRequest } from '@/types/priest.types';

export const priestApi = {
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

  verifyPriestOtp: async (phoneNumber: string, otp: string) => {
    return mockApi.mockVerifyPriestOtp(phoneNumber, otp);
  },

  // Admin approval stubs
  getPendingPriests: async (): Promise<Priest[]> => {
    return mockApi.mockGetPendingPriests();
  },

  approvePriest: async (priestId: string): Promise<Priest> => {
    return mockApi.mockApprovePriest(priestId);
  },

  rejectPriest: async (priestId: string): Promise<Priest> => {
    return mockApi.mockRejectPriest(priestId);
  },
};
