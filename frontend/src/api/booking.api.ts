import * as mockApi from '@/mocks/mock-api';
import { Booking, CreateBookingRequest, CancelBookingRequest } from '@/types/booking.types';

export const bookingApi = {
  createBooking: async (data: CreateBookingRequest, userId?: string): Promise<Booking> => {
    return mockApi.mockCreateBooking(data, userId);
  },

  getBookings: async (userId?: string): Promise<Booking[]> => {
    return mockApi.mockGetBookings(userId);
  },

  getBookingById: async (id: string): Promise<Booking> => {
    return mockApi.mockGetBookingById(id);
  },

  cancelBooking: async (data: CancelBookingRequest): Promise<Booking> => {
    return mockApi.mockCancelBooking(data.bookingId, data.reason);
  },
};
