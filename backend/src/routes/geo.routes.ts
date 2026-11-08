import { Router, Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../views/response.view.js';
import { validate } from '../middlewares/validate.middleware.js';
import { pincodeParamSchema } from '../schemas/common.schema.js';

const router = Router();

/**
 * [ROUTE] /api/v1/geo/pincode/:pincode
 * Real postal pincode directory lookup.
 */
router.get('/pincode/:pincode', validate(pincodeParamSchema, 'params'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cleanPin = (req.params.pincode || '').trim().replace(/\D/g, '');
    if (cleanPin.length === 6) {
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
        if (response.ok) {
          const data: any = await response.json();
          if (Array.isArray(data) && data[0]?.Status === 'Success' && Array.isArray(data[0]?.PostOffice)) {
            const locations = data[0].PostOffice.map((po: any) => ({
              postOffice: `${po.Name} Post Office`,
              locality: po.Name,
              villageTown: po.Name,
              city: po.District || po.Block || po.Circle || 'Unknown',
              district: po.District || 'Unknown',
              state: po.State || 'Unknown',
              country: po.Country || 'India',
            }));
            sendSuccess(res, 'PIN code resolved successfully.', {
              pincode: cleanPin,
              locations,
            });
            return;
          }
        }
      } catch {
        // network fallback
      }
    }

    sendSuccess(res, 'PIN code lookup complete.', {
      pincode: cleanPin,
      locations: [],
    });
  } catch (error) {
    next(error);
  }
});

export const geoRoutes = router;
