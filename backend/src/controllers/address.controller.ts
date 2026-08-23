import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/api-response.js';

/**
 * Address Controller Skeleton
 */
export const addressController = {
  getAddresses: async (req: Request, res: Response, next: NextFunction) => {
    return ApiResponse.success(res, [], 'User addresses');
  },
  createAddress: async (req: Request, res: Response, next: NextFunction) => {
    return ApiResponse.success(res, null, 'Address created', 201);
  },
  updateAddress: async (req: Request, res: Response, next: NextFunction) => {
    return ApiResponse.success(res, null, 'Address updated');
  },
  deleteAddress: async (req: Request, res: Response, next: NextFunction) => {
    return ApiResponse.success(res, null, 'Address deleted');
  },
  setDefaultAddress: async (req: Request, res: Response, next: NextFunction) => {
    return ApiResponse.success(res, null, 'Default address set');
  },
};
