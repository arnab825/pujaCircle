import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/api-response.js';

/**
 * Priest Controller Skeleton
 */
export const priestController = {
  getPriests: async (req: Request, res: Response, next: NextFunction) => {
    return ApiResponse.success(res, [], 'Priests list');
  },
  getPriestById: async (req: Request, res: Response, next: NextFunction) => {
    return ApiResponse.success(res, null, 'Priest details');
  },
  registerPriest: async (req: Request, res: Response, next: NextFunction) => {
    return ApiResponse.success(res, null, 'Priest registered, awaiting approval', 201);
  },
  approvePriest: async (req: Request, res: Response, next: NextFunction) => {
    return ApiResponse.success(res, null, 'Priest approved');
  },
  rejectPriest: async (req: Request, res: Response, next: NextFunction) => {
    return ApiResponse.success(res, null, 'Priest rejected');
  },
};
