import * as mockApi from '@/mocks/mock-api';
import { Address, CreateAddressRequest, UpdateAddressRequest, PincodeLookupResponse, PincodeLocation } from '@/types/address.types';

export const addressApi = {
  getAddresses: async (userId: string = 'user-devotee-1'): Promise<Address[]> => {
    const res = await mockApi.mockGetAddresses(userId);
    return res.data || [];
  },

  createAddress: async (data: CreateAddressRequest, userId: string = 'user-devotee-1'): Promise<Address | undefined> => {
    const res = await mockApi.mockCreateAddress(userId, data);
    return res.data;
  },

  updateAddress: async (data: UpdateAddressRequest, userId: string = 'user-devotee-1'): Promise<Address | undefined> => {
    const res = await mockApi.mockUpdateAddress(userId, data);
    return res.data;
  },

  deleteAddress: async (id: string, userId: string = 'user-devotee-1'): Promise<{ success: boolean; message: string }> => {
    return mockApi.mockDeleteAddress(userId, id);
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
        console.warn('Real postal API unavailable, falling back to local dataset:', error);
      }
    }

    // Fallback to internal dataset
    return mockApi.mockLookupPincode(cleanPin);
  },
};
