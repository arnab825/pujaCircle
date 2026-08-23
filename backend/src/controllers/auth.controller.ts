import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/api-response.js';

/**
 * Auth Controller Skeleton
 */
export const authController = {
  sendOtp: async (req: Request, res: Response, next: NextFunction) => {
    return ApiResponse.success(res, null, 'OTP sent');
  },
  verifyOtp: async (req: Request, res: Response, next: NextFunction) => {
    return ApiResponse.success(res, null, 'OTP verified');
  },
  register: async (req: Request, res: Response, next: NextFunction) => {
    return ApiResponse.success(res, null, 'Registration successful', 201);
  },
  logout: async (req: Request, res: Response, next: NextFunction) => {
    return ApiResponse.success(res, null, 'Logged out');
  },
};
