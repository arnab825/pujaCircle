import * as mockApi from '@/mocks/mock-api';
import { Address, CreateAddressRequest, UpdateAddressRequest, PincodeLookupResponse, PincodeLocation } from '@/types/address.types';
import { logAppError, getUserFriendlyErrorMessage } from '@/lib/errorHandler';

export const addressApi = {
  getAddresses: async (userId: string = 'user-devotee-1'): Promise<Address[]> => {
    try {
      const res = await mockApi.mockGetAddresses(userId);
      return res.data || [];
    } catch (error) {
      logAppError('addressApi.getAddresses', error, { userId });
      return [];
    }
  },

  createAddress: async (data: CreateAddressRequest, userId: string = 'user-devotee-1'): Promise<{ success: boolean; data?: Address; message: string }> => {
    try {
      const res = await mockApi.mockCreateAddress(userId, data);
      return res;
    } catch (error) {
      logAppError('addressApi.createAddress', error, { userId, data });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to save address. Please verify the entered details.'),
      };
    }
  },

  updateAddress: async (data: UpdateAddressRequest, userId: string = 'user-devotee-1'): Promise<{ success: boolean; data?: Address; message: string }> => {
    try {
      const res = await mockApi.mockUpdateAddress(userId, data);
      return res;
    } catch (error) {
      logAppError('addressApi.updateAddress', error, { userId, data });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to update address.'),
      };
    }
  },

  deleteAddress: async (id: string, userId: string = 'user-devotee-1'): Promise<{ success: boolean; message: string }> => {
    try {
      return await mockApi.mockDeleteAddress(id, userId);
    } catch (error) {
      logAppError('addressApi.deleteAddress', error, { id, userId });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to delete address.'),
      };
    }
  },

  /**
   * Real Postal PIN-Code Lookup API
   * Calls https://api.postalpincode.in/pincode/{PINCODE}
   * Resolves PIN code -> list of matching post office locations with city, district, state.
   * Falls back to mock data if offline or network error.
   */
  lookupPincode: async (pincode: string): Promise<PincodeLookupResponse> => {
    const cleanPin = pincode.trim().replace(/\D/g, '');

    if (cleanPin.length === 6) {
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data[0]?.Status === 'Success' && Array.isArray(data[0]?.PostOffice)) {
            const locations: PincodeLocation[] = data[0].PostOffice.map((po: any) => ({
              postOffice: `${po.Name} Post Office`,
              locality: po.Name,
              villageTown: po.Name,
              city: po.District || po.Block || po.Circle || 'Unknown',
              district: po.District || 'Unknown',
              state: po.State || 'Unknown',
              country: po.Country || 'India',
            }));

            return {
              pincode: cleanPin,
              locations,
            };
          }
        }
      } catch (error) {
        logAppError('addressApi.lookupPincode.postalApiFallback', error, { cleanPin });
      }
    }

    // Fallback to internal dataset
    try {
      return await mockApi.mockLookupPincode(cleanPin);
    } catch (error) {
      logAppError('addressApi.lookupPincode.mockDbFallback', error, { cleanPin });
      return { pincode: cleanPin, locations: [] };
    }
  },
};
