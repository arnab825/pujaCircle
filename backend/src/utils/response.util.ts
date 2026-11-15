import { Response } from 'express';

/**
 * ============================================================================
 * [ARCHITECTURAL LAYER: UTILITY / PRESENTER]
 * Module: Standard API JSON Response Utility
 * 
 * Enforces uniform payload structures across all PujaCircle controllers:
 * - Success: { success: true, message: string, data?: T }
 * - Error:   { success: false, message: string, errors?: any }
 * ============================================================================
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
}

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data !== undefined ? { data } : {}),
  } satisfies ApiResponse<T>);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 400,
  errors?: any
): Response => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors !== undefined ? { errors } : {}),
  } satisfies ApiResponse);
};
