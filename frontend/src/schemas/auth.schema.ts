import { z } from 'zod';

export const sendOtpSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(10, 'Enter a valid 10-digit Indian phone number')
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number starting with 6-9'),
});

export const verifyOtpSchema = z.object({
  phoneNumber: z.string().min(10, 'Invalid phone number'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d{6}$/, 'OTP must contain numbers only'),
});

export const registerUserSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  phoneNumber: z
    .string()
    .length(10, 'Enter a valid 10-digit Indian phone number')
    .regex(/^[6-9]\d{9}$/, 'Invalid mobile number'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
});

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
