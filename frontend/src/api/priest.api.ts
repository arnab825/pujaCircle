import * as mockApi from '@/mocks/mock-api';
import {
  Priest,
  PriestFilterParams,
  PriestSlot,
  Ritual,
  PriestService,
  WeeklyAvailabilityRule,
  AvailabilityException,
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

  // Recurring Weekly Availability Schedules
  getWeeklyAvailability: async (priestId: string): Promise<WeeklyAvailabilityRule[]> => {
    try {
      const res = await mockApi.mockGetWeeklyAvailability(priestId);
      return res.data || [];
    } catch (error) {
      logAppError('priestApi.getWeeklyAvailability', error, { priestId });
      return [];
    }
  },

  createWeeklyAvailabilityRule: async (
    priestId: string,
    payload: Omit<WeeklyAvailabilityRule, 'id' | 'priestId' | 'createdAt'>
  ) => {
    try {
      return await mockApi.mockCreateWeeklyAvailabilityRule(priestId, payload);
    } catch (error) {
      logAppError('priestApi.createWeeklyAvailabilityRule', error, { priestId, payload });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to save working hours.'),
      };
    }
  },

  updateWeeklyAvailabilityRule: async (
    ruleId: string,
    priestId: string,
    payload: Partial<WeeklyAvailabilityRule>
  ) => {
    try {
      return await mockApi.mockUpdateWeeklyAvailabilityRule(ruleId, priestId, payload);
    } catch (error) {
      logAppError('priestApi.updateWeeklyAvailabilityRule', error, { ruleId, priestId });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to update schedule rule.'),
      };
    }
  },

  deleteWeeklyAvailabilityRule: async (ruleId: string, priestId: string) => {
    try {
      return await mockApi.mockDeleteWeeklyAvailabilityRule(ruleId, priestId);
    } catch (error) {
      logAppError('priestApi.deleteWeeklyAvailabilityRule', error, { ruleId, priestId });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to remove schedule rule.'),
      };
    }
  },

  // Date Exceptions (Days off / Blocked / Custom)
  getAvailabilityExceptions: async (priestId: string): Promise<AvailabilityException[]> => {
    try {
      const res = await mockApi.mockGetAvailabilityExceptions(priestId);
      return res.data || [];
    } catch (error) {
      logAppError('priestApi.getAvailabilityExceptions', error, { priestId });
      return [];
    }
  },

  createAvailabilityException: async (
    priestId: string,
    payload: Omit<AvailabilityException, 'id' | 'priestId' | 'createdAt'>
  ) => {
    try {
      return await mockApi.mockCreateAvailabilityException(priestId, payload);
    } catch (error) {
      logAppError('priestApi.createAvailabilityException', error, { priestId, payload });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to save date exception.'),
      };
    }
  },

  deleteAvailabilityException: async (exceptionId: string, priestId: string) => {
    try {
      return await mockApi.mockDeleteAvailabilityException(exceptionId, priestId);
    } catch (error) {
      logAppError('priestApi.deleteAvailabilityException', error, { exceptionId, priestId });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to remove date exception.'),
      };
    }
  },

  // Calculated Generated Slots for Date
  getAvailableSlotsForDate: async (priestId: string, date: string): Promise<PriestSlot[]> => {
    try {
      const res = await mockApi.mockGetAvailableSlotsForDate(priestId, date);
      return res.data || [];
    } catch (error) {
      logAppError('priestApi.getAvailableSlotsForDate', error, { priestId, date });
      return [];
    }
  },

  getPriestSlots: async (priestId: string, date?: string): Promise<PriestSlot[]> => {
    try {
      const res = await mockApi.mockGetPriestSlots(priestId, date);
      return res.data || [];
    } catch (error) {
      logAppError('priestApi.getPriestSlots', error, { priestId, date });
      return [];
    }
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
