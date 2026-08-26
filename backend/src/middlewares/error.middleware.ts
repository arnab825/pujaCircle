import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/api-response.js';

/**
 * Global Error Handling Middleware
 * - Logs full stack traces server-side for debugging
 * - Returns safe, sanitized, user-friendly error messages to clients without leaking DB/ORM internals
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;

  // Always log full error trace on server for internal telemetry & debugging
  console.error(`[SERVER_ERROR] [${req.method}] ${req.originalUrl}:`, {
    status: statusCode,
    message: err.message,
    stack: err.stack,
    errors: err.errors,
  });

  // If operational client error (4xx), return specific sanitized message
  if (statusCode >= 400 && statusCode < 500) {
    const clientMessage = err.message || 'Bad Request';
    return ApiResponse.error(res, clientMessage, statusCode, err.errors || null);
  }

  // If internal server error (500), return generic message to prevent leaking SQL / table names
  const genericServerMessage = 'An unexpected internal server error occurred. Please try again later.';
  return ApiResponse.error(res, genericServerMessage, 500, null);
};
