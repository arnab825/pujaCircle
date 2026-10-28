import { Booking, CreateBookingRequest, CancelBookingRequest, SubmitRatingRequest, Rating } from '@/types/booking.types';
import { apiClient } from './client';
import { logAppError, getUserFriendlyErrorMessage } from '@/lib/errorHandler';

// Frontend API service for ceremony reservations, statuses, and devotee ratings
export const bookingApi = {
  createBooking: async (
    data: CreateBookingRequest,
    _userId?: string
  ): Promise<{ success: boolean; message: string; data?: Booking }> => {
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

  acceptBooking: async (bookingId: string, _priestId?: string) => {
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

  rejectBooking: async (bookingId: string, priestIdOrReason?: string, maybeReason?: string) => {
    try {
      const reason = maybeReason !== undefined ? maybeReason : priestIdOrReason;
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

  cancelBooking: async (
    bookingIdOrData: string | (CancelBookingRequest & { userId?: string }),
    reason?: string
  ) => {
    try {
      const bookingId = typeof bookingIdOrData === 'string' ? bookingIdOrData : bookingIdOrData.bookingId;
      const cancelReason = typeof bookingIdOrData === 'string' ? reason : bookingIdOrData.reason;
      const res = await apiClient.post(`/bookings/${bookingId}/cancel`, { reason: cancelReason });
      return res as any;
    } catch (error) {
      logAppError('bookingApi.cancelBooking', error, { bookingIdOrData });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to cancel booking.'),
      };
    }
  },

  completeBooking: async (
    bookingId: string,
    priestIdOrCode?: string,
    maybeCode?: string
  ) => {
    try {
      const completionCode = maybeCode !== undefined ? maybeCode : priestIdOrCode;
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
    bookingIdOrUserId: string | undefined,
    dataOrUndefined?: SubmitRatingRequest
  ): Promise<{ success: boolean; message: string; data?: Rating }> => {
    try {
      const data = dataOrUndefined ?? (typeof bookingIdOrUserId === 'object' ? bookingIdOrUserId : undefined);
      const bookingId = data?.bookingId || (typeof bookingIdOrUserId === 'string' ? bookingIdOrUserId : '');
      const res = await apiClient.post(`/bookings/${bookingId}/rating`, data);
      return res as any;
    } catch (error) {
      logAppError('bookingApi.submitRating', error, { bookingIdOrUserId, dataOrUndefined });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to submit rating.'),
      };
    }
  },
};
