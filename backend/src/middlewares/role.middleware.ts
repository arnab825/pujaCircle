import { Request, Response, NextFunction } from 'express';
import { eq } from 'drizzle-orm';
import { Role } from '@/types/express.js';
import { sendError } from '@/views/response.view.js';
import { isAdmin } from '@/utils/auth.util.js';
import { db } from '@/db/index.js';
import { priestProfiles } from '@/models/priest.model.js';

/**
 * [MIDDLEWARE] Role-Based Access Control (RBAC) Guard
 * Restricts access to routes based on user role ('USER', 'PRIEST', 'ADMIN').
 * 
 * Usage:
 * router.get('/admin/priests', requireAuth, requireRole('ADMIN'), adminController.getAllPriests);
 */
export const requireRole = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required.', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(
        res,
        `Access denied. Requires one of the following roles: [${allowedRoles.join(', ')}].`,
        403
      );
      return;
    }

    next();
  };
};

// Convenient DRY middleware dedicated for admin-only routes
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    sendError(res, 'Authentication required.', 401);
    return;
  }

  if (!isAdmin(req)) {
    sendError(res, 'Access denied. Administrative privileges required.', 403);
    return;
  }

  next();
};

/**
 * [MIDDLEWARE] Priest Approval Authorization Guard
 * Directly queries the PostgreSQL database to verify that the authenticated priest
 * has 'APPROVED' status.
 * Rejects pending priests with: "Your account is waiting for admin approval."
 * Rejects rejected priests with: "Your application has been rejected. Please contact the administrator for further information."
 */
export const requireApprovedPriest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    sendError(res, 'Authentication required. Please sign in.', 401);
    return;
  }

  // Admins are exempt and can access
  if (req.user.role === 'ADMIN') {
    next();
    return;
  }

  if (req.user.role !== 'PRIEST') {
    sendError(res, 'Access denied. Priest privileges required.', 403);
    return;
  }

  try {
    const [profile] = await db
      .select({
        approvalStatus: priestProfiles.approvalStatus,
        rejectionReason: priestProfiles.rejectionReason,
      })
      .from(priestProfiles)
      .where(eq(priestProfiles.userId, req.user.id))
      .limit(1);

    if (!profile) {
      sendError(res, 'Priest profile record not found.', 404);
      return;
    }

    if (profile.approvalStatus === 'PENDING') {
      sendError(res, 'Your account is waiting for admin approval.', 403);
      return;
    }

    if (profile.approvalStatus === 'REJECTED') {
      sendError(
        res,
        'Your application has been rejected. Please contact the administrator for further information.',
        403
      );
      return;
    }

    if (profile.approvalStatus !== 'APPROVED') {
      sendError(res, 'Access denied. Account is not approved.', 403);
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};
