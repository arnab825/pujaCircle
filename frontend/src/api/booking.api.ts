import * as mockApi from '@/mocks/mock-api';
import { Booking, CreateBookingRequest, CancelBookingRequest, SubmitRatingRequest, Rating } from '@/types/booking.types';
import { logAppError, getUserFriendlyErrorMessage } from '@/lib/errorHandler';

export const bookingApi = {
  createBooking: async (
    data: CreateBookingRequest,
    userId: string = 'user-devotee-1'
  ): Promise<{ success: boolean; message: string; data?: Booking }> => {
    try {
      return await mockApi.mockCreateBooking(userId, data);
    } catch (error) {
      logAppError('bookingApi.createBooking', error, { userId, data });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to submit booking request. Please try again.'),
      };
    }
  },

  getBookings: async (userId?: string, priestId?: string): Promise<Booking[]> => {
    try {
      const res = await mockApi.mockGetBookings(userId, priestId);
      return res.data || [];
    } catch (error) {
      logAppError('bookingApi.getBookings', error, { userId, priestId });
      return [];
    }
  },

  getPriestBookings: async (priestId: string): Promise<Booking[]> => {
    return bookingApi.getBookings(undefined, priestId);
  },

  getBookingById: async (id: string): Promise<Booking | null> => {
    try {
      const res = await mockApi.mockGetBookingById(id);
      return res.data || null;
    } catch (error) {
      logAppError('bookingApi.getBookingById', error, { id });
      return null;
    }
  },

  acceptBooking: async (bookingId: string, priestId: string) => {
    try {
      return await mockApi.mockAcceptBooking(bookingId, priestId);
    } catch (error) {
      logAppError('bookingApi.acceptBooking', error, { bookingId, priestId });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to accept booking.'),
      };
    }
  },

  rejectBooking: async (bookingId: string, priestId: string, reason?: string) => {
    try {
      return await mockApi.mockRejectBooking(bookingId, priestId, reason || 'Unavailable');
    } catch (error) {
      logAppError('bookingApi.rejectBooking', error, { bookingId, priestId, reason });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to decline booking.'),
      };
    }
  },

  cancelBooking: async (data: CancelBookingRequest & { userId?: string }) => {
    try {
      return await mockApi.mockCancelBooking(data.bookingId, data.userId || 'user-devotee-1', data.reason);
    } catch (error) {
      logAppError('bookingApi.cancelBooking', error, { data });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to cancel booking.'),
      };
    }
  },

  completeBooking: async (bookingId: string, priestId: string) => {
    try {
      return await mockApi.mockCompleteBooking(bookingId, priestId);
    } catch (error) {
      logAppError('bookingApi.completeBooking', error, { bookingId, priestId });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to mark ceremony as completed.'),
      };
    }
  },

  submitRating: async (userId: string, data: SubmitRatingRequest): Promise<{ success: boolean; message: string; data?: Rating }> => {
    try {
      return await mockApi.mockSubmitRating(userId, data);
    } catch (error) {
      logAppError('bookingApi.submitRating', error, { userId, data });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to submit rating.'),
      };
    }
  },
};
