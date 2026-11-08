import { Router } from 'express';
import { z } from 'zod';
import { priestController } from '../controllers/priest.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireRole, requireApprovedPriest } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  updatePriestProfileSchema,
  createPriestServiceSchema,
  updatePriestServiceSchema,
  updatePriestAvailabilityExceptionSchema,
  priestWorkingHoursSchema,
  priestFilterParamsSchema,
} from '../schemas/priest.schema.js';
import {
  uuidParamSchema,
  priestServiceParamSchema,
  priestExceptionParamSchema,
  exceptionIdParamSchema,
} from '../schemas/common.schema.js';

const router = Router();

/**
 * [ROUTE] /api/v1/priests
 * Priest directory, profile customization, and service pricing
 */

// Protected priest self-management (/me/...)
router.get('/me/profile', requireAuth, requireRole('PRIEST'), priestController.getMyProfile);
router.put('/me/profile', requireAuth, requireRole('PRIEST'), requireApprovedPriest, validate(updatePriestProfileSchema), priestController.updatePriestProfile);
router.get('/me/services', requireAuth, requireRole('PRIEST'), requireApprovedPriest, priestController.getPriestServices);
router.post('/me/services', requireAuth, requireRole('PRIEST'), requireApprovedPriest, validate(createPriestServiceSchema), priestController.createPriestService);
router.delete('/me/services/:serviceId', requireAuth, requireRole('PRIEST'), requireApprovedPriest, validate(z.object({ serviceId: z.string().uuid() }), 'params'), priestController.deletePriestService);

// Protected priest availability & exceptions self-management (/me/...)
router.get('/me/exceptions', requireAuth, requireRole('PRIEST'), requireApprovedPriest, priestController.getPriestExceptions);
router.delete('/me/exceptions/:exceptionId', requireAuth, requireRole('PRIEST'), requireApprovedPriest, validate(exceptionIdParamSchema, 'params'), priestController.deletePriestException);
router.get('/me/working-hours', requireAuth, requireRole('PRIEST'), requireApprovedPriest, priestController.getPriestWorkingHours);
router.put('/me/working-hours', requireAuth, requireRole('PRIEST'), requireApprovedPriest, validate(priestWorkingHoursSchema), priestController.updatePriestWorkingHours);

// Priest-specific sub-resource endpoints by ID (/:id/...)
router.get('/:id/services', validate(uuidParamSchema, 'params'), priestController.getPriestServices);
router.post('/:id/services', requireAuth, requireApprovedPriest, validate(uuidParamSchema, 'params'), validate(createPriestServiceSchema), priestController.createPriestService);
router.put('/:id/services/:serviceId', requireAuth, requireApprovedPriest, validate(priestServiceParamSchema, 'params'), validate(updatePriestServiceSchema), priestController.updatePriestService);
router.delete('/:id/services/:serviceId', requireAuth, requireApprovedPriest, validate(priestServiceParamSchema, 'params'), priestController.deletePriestService);
router.patch('/:id/services/:serviceId/toggle', requireAuth, requireApprovedPriest, validate(priestServiceParamSchema, 'params'), priestController.togglePriestService);

// Working Hours by priest ID
router.get('/:id/working-hours', validate(uuidParamSchema, 'params'), priestController.getPriestWorkingHours);
router.put('/:id/working-hours', requireAuth, requireApprovedPriest, validate(uuidParamSchema, 'params'), validate(priestWorkingHoursSchema), priestController.updatePriestWorkingHours);

// Priest Availability Exceptions by priest ID
router.get('/:id/exceptions', validate(uuidParamSchema, 'params'), priestController.getPriestExceptions);
router.put('/:id/exceptions/:exceptionId', requireAuth, requireApprovedPriest, validate(priestExceptionParamSchema, 'params'), validate(updatePriestAvailabilityExceptionSchema), priestController.updatePriestException);
router.delete('/:id/exceptions/:exceptionId', requireAuth, requireApprovedPriest, validate(priestExceptionParamSchema, 'params'), priestController.deletePriestException);

// Update priest profile by ID
router.put('/:id', requireAuth, requireApprovedPriest, validate(uuidParamSchema, 'params'), validate(updatePriestProfileSchema), priestController.updatePriestProfile);

// Public priest listings
router.get('/', validate(priestFilterParamsSchema, 'query'), priestController.searchPriests);
router.get('/:id', validate(uuidParamSchema, 'params'), priestController.getPriestById);

export const priestRoutes = router;
