import { Request, Response, NextFunction } from 'express';

/**
 * Authentication Middleware Skeleton
 * Full authentication will be verified against JWT HTTP-only cookies in future backend phase.
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  next();
};
