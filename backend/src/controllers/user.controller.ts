import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/api-response.js';

/**
 * User Controller Skeleton
 */
export const userController = {
  getProfile: async (req: Request, res: Response, next: NextFunction) => {
    return ApiResponse.success(res, null, 'User profile');
  },
  updateProfile: async (req: Request, res: Response, next: NextFunction) => {
    return ApiResponse.success(res, null, 'Profile updated');
  },
};
