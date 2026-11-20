import { Request, Response, NextFunction } from 'express';
import { authService } from '@/services/auth.service.js';
import { sendSuccess } from '@/views/response.view.js';
import { env } from '@/config/env.js';

// Static cookie configuration options for session security (Strict 1-week / 7-day TTL)
// Cross-site cookie (Render backend <-> Vercel frontend) requires sameSite='none' and secure=true in production
const SESSION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days (1 week) in milliseconds

const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: (env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: SESSION_EXPIRY_MS,
  path: '/',
} as const;

const CLIENT_COOKIE_OPTIONS = {
  httpOnly: false,
  secure: env.NODE_ENV === 'production',
  sameSite: (env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: SESSION_EXPIRY_MS,
  path: '/',
} as const;

// Controller managing user authentication, registration, session, and OTP verification
export class AuthController {
  // POST /api/v1/auth/login
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);

      if (result.token) {
        res.cookie('access_token', result.token, AUTH_COOKIE_OPTIONS);
        res.cookie('pc_token', result.token, CLIENT_COOKIE_OPTIONS);
      }

      sendSuccess(res, 'Signed in successfully.', result);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/auth/register/user
  async registerUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.registerUser(req.body);

      if (result.token) {
        res.cookie('access_token', result.token, AUTH_COOKIE_OPTIONS);
        res.cookie('pc_token', result.token, CLIENT_COOKIE_OPTIONS);
      }

      sendSuccess(res, 'Devotee account created successfully.', result, 201);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/auth/register/priest
  async registerPriest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.registerPriest(req.body);

      if (result.token) {
        res.cookie('access_token', result.token, AUTH_COOKIE_OPTIONS);
        res.cookie('pc_token', result.token, CLIENT_COOKIE_OPTIONS);
      }

      sendSuccess(
        res,
        'Priest onboarding application submitted successfully. Pending admin review.',
        result,
        201
      );
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/auth/me
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.getMe(req.user!.id);
      sendSuccess(res, 'Session profile retrieved successfully.', { user });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/auth/logout
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies?.access_token || req.cookies?.pc_token || req.headers.authorization?.split(' ')[1];
      const result = await authService.logout(token);

      res.clearCookie('access_token', {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: (env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
        path: '/',
      });
      res.clearCookie('token', {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: (env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
        path: '/',
      });
      res.clearCookie('pc_token', {
        httpOnly: false,
        secure: env.NODE_ENV === 'production',
        sameSite: (env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
        path: '/',
      });

      sendSuccess(res, result.message);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/auth/otp/send-email
  async sendEmailOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.sendEmailOtp(req.body.email);
      sendSuccess(res, result.message);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/auth/otp/verify-email
  async verifyEmailOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.verifyEmailOtp(req.body);
      sendSuccess(res, result.message);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/auth/forgot-password
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.forgotPassword(req.body);
      sendSuccess(res, result.message);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/auth/reset-password
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.resetPassword(req.body);
      sendSuccess(res, result.message);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
