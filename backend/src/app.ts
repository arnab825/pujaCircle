import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import priestRoutes from './routes/priest.routes.js';
import addressRoutes from './routes/address.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';

export function createApp(): Express {
  const app = express();

  // Basic security and parsing middleware
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'PujaCircle API Scaffolding' });
  });

  // Route registration
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/priests', priestRoutes);
  app.use('/api/v1/addresses', addressRoutes);
  app.use('/api/v1/bookings', bookingRoutes);

  // Global error handler
  app.use(errorHandler);

  return app;
}
