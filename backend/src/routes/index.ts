import { Router } from 'express';
import { authRoutes } from './auth.routes.js';
import { adminRoutes } from './admin.routes.js';
import { userRoutes } from './user.routes.js';
import { priestRoutes } from './priest.routes.js';
import { catalogRoutes } from './catalog.routes.js';
import { addressRoutes } from './address.routes.js';
import { bookingRoutes } from './booking.routes.js';
import { geoRoutes } from './geo.routes.js';
import { ritualRoutes } from './ritual.routes.js';
import { availabilityRoutes } from './availability.routes.js';
import { mediaRoutes } from './media.routes.js';
import { sendSuccess } from '../views/response.view.js';

const apiRouter = Router();

/**
 * Health Check Endpoint
 */
apiRouter.get('/health', (_req, res) => {
  sendSuccess(res, 'PujaCircle API is operating smoothly.', {
    status: 'ONLINE',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/**
 * Module Subrouters
 */
apiRouter.use('/auth', authRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/priests', priestRoutes);
apiRouter.use('/catalog', catalogRoutes);
apiRouter.use('/addresses', addressRoutes);
apiRouter.use('/bookings', bookingRoutes);
apiRouter.use('/geo', geoRoutes);
apiRouter.use('/rituals', ritualRoutes);
apiRouter.use('/availability', availabilityRoutes);
apiRouter.use('/media', mediaRoutes);

export const routes = apiRouter;
