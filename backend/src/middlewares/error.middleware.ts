import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/api-response.js';

/**
 * Global Error Handling Middleware Skeleton
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return ApiResponse.error(res, message, statusCode, err.errors || null);
};
