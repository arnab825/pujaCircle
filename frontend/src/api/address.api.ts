import * as mockApi from '@/mocks/mock-api';
import { Address, CreateAddressRequest, UpdateAddressRequest, PincodeLookupResponse } from '@/types/address.types';

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
   * Resolves PIN code -> list of matching post office locations with city, district, state.
   */
  lookupPincode: async (pincode: string): Promise<PincodeLookupResponse> => {
    return mockApi.mockLookupPincode(pincode);
  },
};
