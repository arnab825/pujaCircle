import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * Zod Request Validation Middleware Skeleton
 */
export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    next();
  };
};
