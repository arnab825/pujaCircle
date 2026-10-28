import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireAdmin } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { adminActionReasonSchema } from '../schemas/admin.schema.js';
import { uuidParamSchema } from '../schemas/common.schema.js';

const router = Router();

/**
 * [ROUTE] /api/v1/admin
 * Protected Admin Console Endpoints (ADMIN role required)
 */
router.use(requireAuth);
router.use(requireAdmin);

// Platform KPIs & Stats
router.get('/dashboard/stats', adminController.getDashboardStats);

// Platform Bookings Monitoring
router.get('/bookings', adminController.getAllBookings);

// Priest Verification & Lifecycle Management
router.get('/priests', adminController.getAllPriests);
router.get('/priests/pending', adminController.getPendingPriests);
router.post('/priests/:id/approve', validate(uuidParamSchema, 'params'), adminController.approvePriest);
router.post('/priests/:id/reject', validate(uuidParamSchema, 'params'), validate(adminActionReasonSchema), adminController.rejectPriest);
router.post('/priests/:id/ban', validate(uuidParamSchema, 'params'), validate(adminActionReasonSchema), adminController.banPriest);
router.post('/priests/:id/unban', validate(uuidParamSchema, 'params'), adminController.unbanPriest);
router.post('/priests/:id/reopen', validate(uuidParamSchema, 'params'), adminController.reopenPriestApplication);

// Devotee Moderation
router.get('/users', adminController.getAllUsers);
router.post('/users/:id/suspend', validate(uuidParamSchema, 'params'), validate(adminActionReasonSchema), adminController.suspendUser);
router.post('/users/:id/unsuspend', validate(uuidParamSchema, 'params'), adminController.unsuspendUser);

export const adminRoutes = router;
