import { Request, Response, NextFunction } from 'express';

/**
 * Role Authorization Middleware Skeleton
 */
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    next();
  };
};
