import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import {
  loginSchema,
  registerUserSchema,
  registerPriestSchema,
  phoneOtpRequestSchema,
  verifyPhoneOtpSchema,
  emailOtpRequestSchema,
  verifyEmailOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../schemas/auth.schema.js';

import { authRateLimiter, otpRateLimiter } from '../middlewares/rateLimit.middleware.js';

const router = Router();

// Primary Authentication & Registration (protected by auth rate limiter)
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.post('/register/user', authRateLimiter, validate(registerUserSchema), authController.registerUser);
router.post('/register/priest', authRateLimiter, validate(registerPriestSchema), authController.registerPriest);

// Session State
router.get('/me', requireAuth, authController.getMe);
router.post('/logout', authController.logout);

// Phone OTP Endpoints (protected by strict OTP rate limiter)
router.post('/otp/send-phone', otpRateLimiter, validate(phoneOtpRequestSchema), authController.sendPhoneOtp);
router.post('/otp/verify-phone', otpRateLimiter, validate(verifyPhoneOtpSchema), authController.verifyPhoneOtp);

// Email OTP Endpoints (protected by strict OTP rate limiter)
router.post('/otp/send-email', otpRateLimiter, validate(emailOtpRequestSchema), authController.sendEmailOtp);
router.post('/otp/verify-email', otpRateLimiter, validate(verifyEmailOtpSchema), authController.verifyEmailOtp);

// Password Recovery Endpoints (protected by auth rate limiter)
router.post('/forgot-password', authRateLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authRateLimiter, validate(resetPasswordSchema), authController.resetPassword);

export const authRoutes = router;
