import { Response } from 'express';

/**
 * Standard API Response Wrapper Skeleton
 */
export class ApiResponse {
  static success<T>(res: Response, data: T, message = 'Success', statusCode = 200): Response {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(res: Response, message = 'An error occurred', statusCode = 500, errors: any = null): Response {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }
}
