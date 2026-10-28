import {
  Priest,
  PriestFilterParams,
  Ritual,
  PriestService,
} from '@/types/priest.types';
import { PincodeLookupResponse } from '@/types/address.types';
import { apiClient } from './client';
import { logAppError, getUserFriendlyErrorMessage } from '@/lib/errorHandler';
import { calculateDayMuhuratSlots, CalculatedSlot } from '@/lib/availabilityUtils';

// Frontend API service for Purohit profiles, rituals, services, and availability slots
export const priestApi = {
  // Public Approved Priests listing
  getPriests: async (params?: PriestFilterParams): Promise<Priest[]> => {
    try {
      const res = await apiClient.get('/priests', { params });
      return (res as any).data || res;
    } catch (error) {
      logAppError('priestApi.getPriests', error, { params });
      return [];
    }
  },

  getPriestById: async (id: string): Promise<Priest | undefined> => {
    try {
      const res = await apiClient.get(`/priests/${id}`);
      return (res as any).data || res;
    } catch (error) {
      logAppError('priestApi.getPriestById', error, { id });
      return undefined;
    }
  },

  getMyPriestProfile: async (): Promise<Priest | undefined> => {
    try {
      const res = await apiClient.get('/priests/me/profile');
      return (res as any).data || res;
    } catch (error) {
      logAppError('priestApi.getMyPriestProfile', error);
      return undefined;
    }
  },

  updatePriestProfile: async (id: string, updates: Partial<Priest>) => {
    try {
      const endpoint = id ? `/priests/${id}` : '/priests/me/profile';
      const res = await apiClient.put(endpoint, updates);
      return res as any;
    } catch (error) {
      logAppError('priestApi.updatePriestProfile', error, { id });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to update priest profile. Please try again.'),
      };
    }
  },

  // Services & Pricing Catalog
  getPriestServices: async (priestId?: string): Promise<PriestService[]> => {
    try {
      const endpoint = priestId ? `/priests/${priestId}/services` : '/priests/me/services';
      const res = await apiClient.get(endpoint);
      return (res as any).data || res;
    } catch (error) {
      logAppError('priestApi.getPriestServices', error, { priestId });
      return [];
    }
  },

  getMyServices: async (): Promise<PriestService[]> => {
    return priestApi.getPriestServices();
  },

  createPriestService: async (
    priestId: string | undefined,
    data: { serviceName?: string; price: number; pujaCatalogId?: string }
  ) => {
    try {
      const endpoint = priestId ? `/priests/${priestId}/services` : '/priests/me/services';
      const res = await apiClient.post(endpoint, data);
      return res as any;
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
    priestId: string | undefined,
    data: { serviceName?: string; price?: number; isActive?: boolean }
  ) => {
    try {
      const endpoint = priestId ? `/priests/${priestId}/services/${serviceId}` : `/priests/me/services/${serviceId}`;
      const res = await apiClient.put(endpoint, data);
      return res as any;
    } catch (error) {
      logAppError('priestApi.updatePriestService', error, { serviceId, priestId });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to update service.'),
      };
    }
  },

  deletePriestService: async (serviceId: string, priestId?: string) => {
    try {
      const endpoint = priestId ? `/priests/${priestId}/services/${serviceId}` : `/priests/me/services/${serviceId}`;
      const res = await apiClient.delete(endpoint);
      return res as any;
    } catch (error) {
      logAppError('priestApi.deletePriestService', error, { serviceId, priestId });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to remove service.'),
      };
    }
  },

  togglePriestService: async (serviceId: string, priestId?: string) => {
    try {
      const endpoint = priestId ? `/priests/${priestId}/services/${serviceId}/toggle` : `/priests/me/services/${serviceId}/toggle`;
      const res = await apiClient.patch(endpoint);
      return res as any;
    } catch (error) {
      logAppError('priestApi.togglePriestService', error, { serviceId, priestId });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to toggle service status.'),
      };
    }
  },

  // Date-Based Muhurat Availability Computations
  getAvailableSlotsForDate: async (priestId: string, date: string, durationMinutes: number = 120): Promise<CalculatedSlot[]> => {
    try {
      const [exceptions, whData] = await Promise.all([
        priestApi.getPriestExceptions(priestId),
        priestApi.getWorkingHours(priestId),
      ]);
      return calculateDayMuhuratSlots(
        priestId,
        date,
        exceptions,
        [],
        durationMinutes || 120,
        whData?.defaultStartTime || '07:00',
        whData?.defaultEndTime || '21:00'
      );
    } catch (error) {
      logAppError('priestApi.getAvailableSlotsForDate', error, { priestId, date });
      return [];
    }
  },

  // Availability Exceptions (Full-Day Leaves & Partial Blackouts)
  getPriestExceptions: async (priestId?: string, query?: { date?: string; startDate?: string; endDate?: string }): Promise<any[]> => {
    try {
      const endpoint = priestId ? `/priests/${priestId}/exceptions` : '/priests/me/exceptions';
      const res = await apiClient.get(endpoint, { params: query });
      return (res as any).data || res || [];
    } catch (error) {
      logAppError('priestApi.getPriestExceptions', error, { priestId, query });
      return [];
    }
  },

  getMyExceptions: async (query?: { date?: string; startDate?: string; endDate?: string }): Promise<any[]> => {
    return priestApi.getPriestExceptions(undefined, query);
  },

  markFullDayOff: async (
    payload: { date: string; reason?: string; priestId?: string }
  ) => {
    try {
      const res = await apiClient.post('/availability/day-off', {
        date: payload.date,
        reason: payload.reason || 'Full Day Off / Leave',
      });
      return res as any;
    } catch (error) {
      logAppError('priestApi.markFullDayOff', error, { payload });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to mark day off.'),
      };
    }
  },

  blockHours: async (
    payload: { date: string; startTime: string; endTime: string; reason?: string; priestId?: string }
  ) => {
    try {
      const res = await apiClient.post('/availability/block-hours', {
        date: payload.date,
        startTime: payload.startTime,
        endTime: payload.endTime,
        reason: payload.reason || 'Blocked Hours',
      });
      return res as any;
    } catch (error) {
      logAppError('priestApi.blockHours', error, { payload });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to block hours.'),
      };
    }
  },

  deletePriestException: async (exceptionId: string, priestId?: string) => {
    try {
      const endpoint = priestId ? `/priests/${priestId}/exceptions/${exceptionId}` : `/priests/me/exceptions/${exceptionId}`;
      const res = await apiClient.delete(endpoint);
      return res as any;
    } catch (error) {
      logAppError('priestApi.deletePriestException', error, { exceptionId, priestId });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to delete availability exception.'),
      };
    }
  },

  // Default Working Hours
  getWorkingHours: async (priestId?: string) => {
    try {
      const endpoint = priestId ? `/priests/${priestId}/working-hours` : '/priests/me/working-hours';
      const res = await apiClient.get(endpoint);
      return (res as any).data || res;
    } catch (error) {
      logAppError('priestApi.getWorkingHours', error, { priestId });
      return null;
    }
  },

  updateWorkingHours: async (
    priestId: string | undefined,
    data: { defaultStartTime?: string; defaultEndTime?: string }
  ) => {
    try {
      const endpoint = priestId ? `/priests/${priestId}/working-hours` : '/priests/me/working-hours';
      const res = await apiClient.put(endpoint, data);
      return res as any;
    } catch (error) {
      logAppError('priestApi.updateWorkingHours', error, { priestId, data });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to update working hours.'),
      };
    }
  },

  getRituals: async (): Promise<Ritual[]> => {
    try {
      const res = await apiClient.get('/rituals');
      return (res as any).data || res;
    } catch (error) {
      logAppError('priestApi.getRituals', error);
      return [];
    }
  },

  lookupPincode: async (pincode: string): Promise<PincodeLookupResponse> => {
    try {
      const res = await apiClient.get(`/geo/pincode/${pincode}`);
      return (res as any).data || res;
    } catch (error) {
      logAppError('priestApi.lookupPincode', error, { pincode });
      return { pincode, locations: [] };
    }
  },
};
