import { Address, CreateAddressRequest, UpdateAddressRequest, PincodeLookupResponse, PincodeLocation } from '@/types/address.types';
import { apiClient } from '@/api/client';
import { useAuthStore } from '@/store/auth.store';
import { logAppError, getUserFriendlyErrorMessage } from '@/lib/errorHandler';

export type { PincodeLocation, PincodeLookupResponse };

export const addressApi = {
  getAddresses: async (userId?: string): Promise<Address[]> => {
    try {
      const activeUserId = userId || useAuthStore.getState().user?.id;
      const res = await apiClient.get('/addresses', { params: { userId: activeUserId } });
      return (res as any).data || res;
    } catch (error) {
      logAppError('addressApi.getAddresses', error, { userId });
      return [];
    }
  },

  createAddress: async (data: CreateAddressRequest, userId?: string): Promise<{ success: boolean; data?: Address; message: string }> => {
    try {
      const activeUserId = userId || useAuthStore.getState().user?.id;
      const res = await apiClient.post('/addresses', { ...data, userId: activeUserId });
      return res as any;
    } catch (error) {
      logAppError('addressApi.createAddress', error, { data });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to save address. Please verify the entered details.'),
      };
    }
  },

  updateAddress: async (data: UpdateAddressRequest, _userId?: string): Promise<{ success: boolean; data?: Address; message: string }> => {
    try {
      const res = await apiClient.put(`/addresses/${data.id}`, data);
      return res as any;
    } catch (error) {
      logAppError('addressApi.updateAddress', error, { data });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to update address.'),
      };
    }
  },

  deleteAddress: async (id: string, _userId?: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await apiClient.delete(`/addresses/${id}`);
      return res as any;
    } catch (error) {
      logAppError('addressApi.deleteAddress', error, { id });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to delete address.'),
      };
    }
  },

  setDefaultAddress: async (addressId: string, _userId?: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await apiClient.patch(`/addresses/${addressId}/default`);
      return res as any;
    } catch (error) {
      logAppError('addressApi.setDefaultAddress', error, { addressId });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to update default address.'),
      };
    }
  },

  /**
   * Real Postal PIN-Code Lookup API
   * Proxied through backend GeoService with TTL caching and fallback
   */
  lookupPincode: async (pincode: string): Promise<PincodeLookupResponse> => {
    const cleanPin = (pincode || '').trim().replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      return { pincode: cleanPin, locations: [] };
    }

    try {
      const res = await apiClient.get(`/geo/pincode/${cleanPin}`);
      return (res as any).data || res;
    } catch (error) {
      logAppError('addressApi.lookupPincode', error, { cleanPin });
      return { pincode: cleanPin, locations: [] };
    }
  },
};
