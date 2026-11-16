import { Router, Request, Response, NextFunction } from 'express';
import { sendSuccess } from '@/views/response.view.js';
import { validate } from '@/middlewares/validate.middleware.js';
import { pincodeParamSchema } from '@/schemas/common.schema.js';
import { geoService } from '@/services/geo.service.js';

const router = Router();

/**
 * ============================================================================
 * [ARCHITECTURAL LAYER: ROUTE]
 * Route: GET /api/v1/geo/pincode/:pincode
 * Real postal pincode directory lookup. Delegates to geoService with caching.
 * ============================================================================
 */
router.get('/pincode/:pincode', validate(pincodeParamSchema, 'params'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await geoService.lookupPincode(req.params.pincode);
    sendSuccess(res, 'PIN code resolved successfully.', result);
  } catch (error) {
    next(error);
  }
});

export const geoRoutes = router;
