import * as mockApi from '@/mocks/mock-api';
import { Address, CreateAddressRequest, UpdateAddressRequest, PincodeLookupResponse, PincodeLocation } from '@/types/address.types';

export const addressApi = {
  getAddresses: async (userId?: string): Promise<Address[]> => {
    return mockApi.mockGetAddresses(userId);
  },

  getAddressById: async (id: string): Promise<Address> => {
    return mockApi.mockGetAddressById(id);
  },

  createAddress: async (data: CreateAddressRequest, userId?: string): Promise<Address> => {
    return mockApi.mockCreateAddress(data, userId);
  },

  updateAddress: async (data: UpdateAddressRequest, userId?: string): Promise<Address> => {
    return mockApi.mockUpdateAddress(data, userId);
  },

  deleteAddress: async (id: string, userId?: string): Promise<{ success: boolean; id: string }> => {
    return mockApi.mockDeleteAddress(id, userId);
  },

  setDefaultAddress: async (id: string, userId?: string): Promise<Address> => {
    return mockApi.mockSetDefaultAddress(id, userId);
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
