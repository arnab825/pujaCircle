import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/api-response.js';

/**
 * Booking Controller Skeleton
 */
export const bookingController = {
  createBooking: async (req: Request, res: Response, next: NextFunction) => {
    return ApiResponse.success(res, null, 'Booking created', 201);
  },
  getBookings: async (req: Request, res: Response, next: NextFunction) => {
    return ApiResponse.success(res, [], 'User bookings');
  },
  getBookingById: async (req: Request, res: Response, next: NextFunction) => {
    return ApiResponse.success(res, null, 'Booking details');
  },
  cancelBooking: async (req: Request, res: Response, next: NextFunction) => {
    return ApiResponse.success(res, null, 'Booking cancelled');
  },
};
