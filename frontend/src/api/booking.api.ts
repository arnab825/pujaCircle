import { Booking, CreateBookingRequest, CancelBookingRequest, SubmitRatingRequest, Rating } from '@/types/booking.types';
import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';
import { logAppError, getUserFriendlyErrorMessage } from '@/lib/errorHandler';

export const bookingApi = {
  createBooking: async (
    data: CreateBookingRequest,
    userId?: string
  ): Promise<{ success: boolean; message: string; data?: Booking }> => {
    try {
      const activeUserId = userId || useAuthStore.getState().user?.id;
      const res = await apiClient.post('/bookings', { ...data, userId: activeUserId });
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
      const activeUserId = userId || (priestId ? undefined : useAuthStore.getState().user?.id);
      const res = await apiClient.get('/bookings', { params: { userId: activeUserId, priestId } });
      return (res as any).data || res;
    } catch (error) {
      logAppError('bookingApi.getBookings', error, { userId, priestId });
      return [];
    }
  },

  getPriestBookings: async (priestId?: string): Promise<Booking[]> => {
    const activePriestId = priestId || useAuthStore.getState().user?.id;
    return bookingApi.getBookings(undefined, activePriestId);
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

  acceptBooking: async (bookingId: string, priestId?: string) => {
    try {
      const activePriestId = priestId || useAuthStore.getState().user?.id || '';
      const res = await apiClient.post(`/bookings/${bookingId}/accept`, { priestId: activePriestId });
      return res as any;
    } catch (error) {
      logAppError('bookingApi.acceptBooking', error, { bookingId, priestId });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to accept booking.'),
      };
    }
  },

  rejectBooking: async (bookingId: string, priestId?: string, reason?: string) => {
    try {
      const activePriestId = priestId || useAuthStore.getState().user?.id || '';
      const res = await apiClient.post(`/bookings/${bookingId}/reject`, { priestId: activePriestId, reason });
      return res as any;
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
      const activeUserId = data.userId || useAuthStore.getState().user?.id || '';
      const res = await apiClient.post(`/bookings/${data.bookingId}/cancel`, { userId: activeUserId, reason: data.reason });
      return res as any;
    } catch (error) {
      logAppError('bookingApi.cancelBooking', error, { data });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to cancel booking.'),
      };
    }
  },

  completeBooking: async (bookingId: string, priestId?: string, completionCode?: string) => {
    try {
      const activePriestId = priestId || useAuthStore.getState().user?.id || '';
      const res = await apiClient.post(`/bookings/${bookingId}/complete`, { priestId: activePriestId, completionCode });
      return res as any;
    } catch (error) {
      logAppError('bookingApi.completeBooking', error, { bookingId, priestId, completionCode });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to mark ceremony as completed.'),
      };
    }
  },

  submitRating: async (
    userId: string | undefined,
    data: SubmitRatingRequest
  ): Promise<{ success: boolean; message: string; data?: Rating }> => {
    try {
      const res = await apiClient.post(`/bookings/${data.bookingId}/rating`, data);
      return res as any;
    } catch (error) {
      logAppError('bookingApi.submitRating', error, { userId, data });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to submit rating.'),
      };
    }
  },
};
