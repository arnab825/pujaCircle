import { z } from 'zod';

// ==========================================
// 1. LOGIN SCHEMAS
// ==========================================

export const userLoginSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, 'Mobile number must be at least 10 digits')
    .regex(/^(\+91)?[6-9]\d{9}$/, 'Enter a valid Indian mobile number (+91 or 10 digits)'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const priestLoginSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, 'Mobile number must be at least 10 digits')
    .regex(/^(\+91)?[6-9]\d{9}$/, 'Enter a valid Indian mobile number (+91 or 10 digits)'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const adminLoginSchema = z.object({
  email: z.string().email('Please enter a valid administrator email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// ==========================================
// 2. OTP & RECOVERY SCHEMAS
// ==========================================

export const sendOtpSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^(\+91)?[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
});

export const verifyOtpSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d{6}$/, 'OTP must contain numbers only'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid registered email address'),
});

export const resetPasswordSchema = z
  .object({
    otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d{6}$/, 'OTP must contain numbers only'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// ==========================================
// 3. REGISTRATION SCHEMAS
// ==========================================

export const registerUserPersonalSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  phoneNumber: z
    .string()
    .min(10, 'Enter a valid Indian phone number')
    .regex(/^(\+91)?[6-9]\d{9}$/, 'Invalid mobile number format'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerPriestPersonalSchema = z.object({
  fullName: z.string().min(2, 'Name & title must be at least 2 characters').max(100, 'Name is too long'),
  phoneNumber: z
    .string()
    .min(10, 'Enter a valid Indian phone number')
    .regex(/^(\+91)?[6-9]\d{9}$/, 'Invalid mobile number format'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Inferred Types
export type UserLoginInput = z.infer<typeof userLoginSchema>;
export type PriestLoginInput = z.infer<typeof priestLoginSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type RegisterUserPersonalInput = z.infer<typeof registerUserPersonalSchema>;
export type RegisterPriestPersonalInput = z.infer<typeof registerPriestPersonalSchema>;
