import * as mockApi from '@/mocks/mock-api';
import { Booking, CreateBookingRequest, CancelBookingRequest } from '@/types/booking.types';

export const bookingApi = {
  createBooking: async (data: CreateBookingRequest, userId: string = 'user-devotee-1'): Promise<Booking | undefined> => {
    const res = await mockApi.mockCreateBooking(userId, data);
    return res.data;
  },

  getBookings: async (userId?: string): Promise<Booking[]> => {
    const res = await mockApi.mockGetBookings(userId);
    return res.data || [];
  },

  getBookingById: async (id: string): Promise<Booking | null> => {
    const res = await mockApi.mockGetBookingById(id);
    return res.data || null;
  },

  cancelBooking: async (data: CancelBookingRequest & { userId?: string }): Promise<Booking | undefined> => {
    const res = await mockApi.mockCancelBooking(data.bookingId, data.userId || 'user-devotee-1', data.reason);
    return res.data;
  },
};
