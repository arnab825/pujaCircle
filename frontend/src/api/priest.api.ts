import * as mockApi from '@/mocks/mock-api';
import {
  Priest,
  PriestFilterParams,
  PriestSlot,
  Ritual,
  PriestService,
} from '@/types/priest.types';
import { logAppError, getUserFriendlyErrorMessage } from '@/lib/errorHandler';

export const priestApi = {
  // Public Approved Priests
  getPriests: async (params?: PriestFilterParams): Promise<Priest[]> => {
    try {
      const res = await mockApi.mockGetPriests(params);
      return res.data || [];
    } catch (error) {
      logAppError('priestApi.getPriests', error, { params });
      return [];
    }
  },

  getPriestById: async (id: string): Promise<Priest | undefined> => {
    try {
      const res = await mockApi.mockGetPriestById(id);
      return res.data;
    } catch (error) {
      logAppError('priestApi.getPriestById', error, { id });
      return undefined;
    }
  },

  updatePriestProfile: async (id: string, updates: Partial<Priest>) => {
    try {
      return await mockApi.mockUpdatePriestProfile(id, updates);
    } catch (error) {
      logAppError('priestApi.updatePriestProfile', error, { id });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to update priest profile. Please try again.'),
      };
    }
  },

  // Services & Pricing Catalog
  getPriestServices: async (priestId: string): Promise<PriestService[]> => {
    try {
      const res = await mockApi.mockGetPriestServices(priestId);
      return res.data || [];
    } catch (error) {
      logAppError('priestApi.getPriestServices', error, { priestId });
      return [];
    }
  },

  createPriestService: async (priestId: string, data: { serviceName: string; price: number }) => {
    try {
      return await mockApi.mockCreatePriestService(priestId, data);
    } catch (error) {
      logAppError('priestApi.createPriestService', error, { priestId, data });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to create service. Please check the values and try again.'),
      };
    }
  },

  updatePriestService: async (
    serviceId: string,
    priestId: string,
    data: { serviceName?: string; price?: number; isActive?: boolean }
  ) => {
    try {
      return await mockApi.mockUpdatePriestService(serviceId, priestId, data);
    } catch (error) {
      logAppError('priestApi.updatePriestService', error, { serviceId, priestId });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to update service.'),
      };
    }
  },

  deletePriestService: async (serviceId: string, priestId: string) => {
    try {
      return await mockApi.mockDeletePriestService(serviceId, priestId);
    } catch (error) {
      logAppError('priestApi.deletePriestService', error, { serviceId, priestId });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to remove service.'),
      };
    }
  },

  togglePriestService: async (serviceId: string, priestId: string) => {
    try {
      return await mockApi.mockTogglePriestService(serviceId, priestId);
    } catch (error) {
      logAppError('priestApi.togglePriestService', error, { serviceId, priestId });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to toggle service status.'),
      };
    }
  },

  // Direct Date-Based Availability Slots
  getPriestSlots: async (priestId: string, date?: string): Promise<PriestSlot[]> => {
    try {
      const res = await mockApi.mockGetPriestSlots(priestId, date);
      return res.data || [];
    } catch (error) {
      logAppError('priestApi.getPriestSlots', error, { priestId, date });
      return [];
    }
  },

  getAvailableSlotsForDate: async (priestId: string, date: string): Promise<PriestSlot[]> => {
    try {
      const res = await mockApi.mockGetAvailableSlotsForDate(priestId, date);
      return res.data || [];
    } catch (error) {
      logAppError('priestApi.getAvailableSlotsForDate', error, { priestId, date });
      return [];
    }
  },

  createAvailabilitySlot: async (
    priestId: string,
    payload: { slotDate?: string; date?: string; startTime: string; endTime: string }
  ) => {
    try {
      return await mockApi.mockCreateAvailabilitySlot(priestId, payload);
    } catch (error) {
      logAppError('priestApi.createAvailabilitySlot', error, { priestId, payload });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to create availability slot.'),
      };
    }
  },

  updateAvailabilitySlot: async (
    slotId: string,
    priestId: string,
    payload: { slotDate?: string; date?: string; startTime?: string; endTime?: string }
  ) => {
    try {
      return await mockApi.mockUpdateAvailabilitySlot(slotId, priestId, payload);
    } catch (error) {
      logAppError('priestApi.updateAvailabilitySlot', error, { slotId, priestId, payload });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to update availability slot.'),
      };
    }
  },

  deleteAvailabilitySlot: async (slotId: string, priestId: string) => {
    try {
      return await mockApi.mockDeleteAvailabilitySlot(slotId, priestId);
    } catch (error) {
      logAppError('priestApi.deleteAvailabilitySlot', error, { slotId, priestId });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to remove availability slot.'),
      };
    }
  },

  // Backward compatibility alias
  createPriestSlot: async (priestId: string, data: { date: string; startTime: string; endTime: string }) => {
    return mockApi.mockCreateAvailabilitySlot(priestId, { slotDate: data.date, ...data });
  },

  getRituals: async (): Promise<Ritual[]> => {
    try {
      const res = await mockApi.mockGetRituals();
      return res.data || [];
    } catch (error) {
      logAppError('priestApi.getRituals', error);
      return [];
    }
  },

  // Admin Management APIs
  getAllPriests: async (params?: PriestFilterParams): Promise<Priest[]> => {
    try {
      const res = await mockApi.mockGetPriests(params ? { ...params, status: 'ALL' } : { status: 'ALL' });
      return res.data || [];
    } catch (error) {
      logAppError('priestApi.getAllPriests', error, { params });
      return [];
    }
  },

  getPendingPriests: async (): Promise<Priest[]> => {
    try {
      const res = await mockApi.mockAdminGetPriests();
      return res.data?.filter((p) => p.approvalStatus === 'PENDING') || [];
    } catch (error) {
      logAppError('priestApi.getPendingPriests', error);
      return [];
    }
  },

  approvePriest: async (priestId: string) => {
    try {
      return await mockApi.mockAdminApprovePriest(priestId);
    } catch (error) {
      logAppError('priestApi.approvePriest', error, { priestId });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to approve priest.'),
      };
    }
  },

  rejectPriest: async (priestId: string, reason: string = 'Application incomplete') => {
    try {
      return await mockApi.mockAdminRejectPriest(priestId, reason);
    } catch (error) {
      logAppError('priestApi.rejectPriest', error, { priestId });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to reject priest.'),
      };
    }
  },

  banPriest: async (priestId: string, reason: string = 'Policy violation') => {
    try {
      return await mockApi.mockAdminBanPriest(priestId, reason);
    } catch (error) {
      logAppError('priestApi.banPriest', error, { priestId });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to ban priest.'),
      };
    }
  },

  reactivatePriest: async (priestId: string) => {
    try {
      return await mockApi.mockAdminUnbanPriest(priestId);
    } catch (error) {
      logAppError('priestApi.reactivatePriest', error, { priestId });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to reactivate priest.'),
      };
    }
  },
};
