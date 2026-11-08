import { Booking, CreateBookingRequest, Rating } from '@/types/booking.types';
import { apiClient } from '@/api/client';
import { logAppError, getUserFriendlyErrorMessage } from '@/lib/errorHandler';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// Frontend API service for ceremony reservations, statuses, and devotee ratings
export const bookingApi = {
  createBooking: async (data: CreateBookingRequest): Promise<ApiResponse<Booking>> => {
    try {
      const res = await apiClient.post('/bookings', data);
      return res as any;
    } catch (error) {
      logAppError('bookingApi.createBooking', error, { data });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to submit booking request. Please try again.'),
      };
    }
  },

  getBookings: async (userId?: string, priestId?: string): Promise<Booking[]> => {
    try {
      const res = await apiClient.get('/bookings', { params: { userId, priestId } });
      return (res as any).data || res;
    } catch (error) {
      logAppError('bookingApi.getBookings', error, { userId, priestId });
      return [];
    }
  },

  getPriestBookings: async (priestId?: string): Promise<Booking[]> => {
    return bookingApi.getBookings(undefined, priestId);
  },

  getMyBookings: async (): Promise<Booking[]> => {
    return bookingApi.getBookings();
  },

  getBookingById: async (id: string): Promise<Booking | null> => {
    try {
      const res = await apiClient.get(`/bookings/${id}`);
      return (res as any).data || res;
    } catch (error) {
      logAppError('bookingApi.getBookingById', error, { id });
      return null;
    }
  },

  acceptBooking: async (bookingId: string): Promise<ApiResponse> => {
    try {
      const res = await apiClient.post(`/bookings/${bookingId}/accept`);
      return res as any;
    } catch (error) {
      logAppError('bookingApi.acceptBooking', error, { bookingId });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to accept booking.'),
      };
    }
  },

  rejectBooking: async (bookingId: string, reason?: string): Promise<ApiResponse> => {
    try {
      const res = await apiClient.post(`/bookings/${bookingId}/reject`, { reason });
      return res as any;
    } catch (error) {
      logAppError('bookingApi.rejectBooking', error, { bookingId });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to decline booking.'),
      };
    }
  },

  cancelBooking: async (bookingId: string, reason?: string): Promise<ApiResponse> => {
    try {
      const res = await apiClient.post(`/bookings/${bookingId}/cancel`, { reason });
      return res as any;
    } catch (error) {
      logAppError('bookingApi.cancelBooking', error, { bookingId });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to cancel booking.'),
      };
    }
  },

  completeBooking: async (bookingId: string, completionCode: string): Promise<ApiResponse> => {
    try {
      const res = await apiClient.post(`/bookings/${bookingId}/complete`, { completionCode });
      return res as any;
    } catch (error) {
      logAppError('bookingApi.completeBooking', error, { bookingId });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to mark ceremony as completed.'),
      };
    }
  },

  submitRating: async (
    bookingId: string,
    data: { rating: number; review?: string }
  ): Promise<ApiResponse<Rating>> => {
    try {
      const res = await apiClient.post(`/bookings/${bookingId}/rating`, {
        ...data,
        bookingId,
      });
      return res as any;
    } catch (error) {
      logAppError('bookingApi.submitRating', error, { bookingId, data });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to submit rating.'),
      };
    }
  },
};
