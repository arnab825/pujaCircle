import { z } from 'zod';

/**
 * Auth Zod Validation Schema Skeletons
 */
export const sendOtpValidation = z.object({
  phoneNumber: z.string(),
});

export const verifyOtpValidation = z.object({
  phoneNumber: z.string(),
  otp: z.string(),
});

export const registerUserValidation = z.object({
  fullName: z.string(),
  phoneNumber: z.string(),
});
