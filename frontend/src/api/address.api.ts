import * as mockApi from '@/mocks/mock-api';
import { Address, CreateAddressRequest, UpdateAddressRequest, PincodeLookupResponse } from '@/types/address.types';
import { delay } from '@/mocks/delay';

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
   * Future PIN-code lookup API stub.
   * Resolves PIN code -> post office/locality, city, district, state.
   */
  lookupPincode: async (pincode: string): Promise<PincodeLookupResponse> => {
    await delay(200);
    if (pincode.startsWith('400')) {
      return {
        pincode,
        city: 'Mumbai',
        district: 'Mumbai Suburban',
        state: 'Maharashtra',
        country: 'India',
        postOffices: ['Bandra West', 'Khar', 'Santacruz'],
      };
    }
    if (pincode.startsWith('560')) {
      return {
        pincode,
        city: 'Bengaluru',
        district: 'Bengaluru Urban',
        state: 'Karnataka',
        country: 'India',
        postOffices: ['Indiranagar', 'Koramangala', 'HSR Layout'],
      };
    }
    if (pincode.startsWith('700')) {
      return {
        pincode,
        city: 'Kolkata',
        district: 'Kolkata',
        state: 'West Bengal',
        country: 'India',
        postOffices: ['Salt Lake', 'Ballygunge', 'New Town'],
      };
    }
    return {
      pincode,
      city: 'New Delhi',
      district: 'Central Delhi',
      state: 'Delhi',
      country: 'India',
      postOffices: ['Connaught Place', 'Karol Bagh'],
    };
  },
};
