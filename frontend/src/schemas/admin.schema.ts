import { z } from 'zod';

export const adminRejectPriestSchema = z
  .object({
    priestId: z.string().trim().min(1, 'Priest ID is required').max(100),
    reason: z
      .string()
      .trim()
      .min(3, 'Rejection reason must be at least 3 characters')
      .max(500, 'Rejection reason cannot exceed 500 characters'),
  })
  .strict();

export const adminBanPriestSchema = z
  .object({
    priestId: z.string().trim().min(1, 'Priest ID is required').max(100),
    reason: z
      .string()
      .trim()
      .min(3, 'Ban reason must be at least 3 characters')
      .max(500, 'Ban reason cannot exceed 500 characters'),
  })
  .strict();

export const adminBanUserSchema = z
  .object({
    userId: z.string().trim().min(1, 'User ID is required').max(100),
    reason: z
      .string()
      .trim()
      .min(3, 'Suspension reason must be at least 3 characters')
      .max(500, 'Suspension reason cannot exceed 500 characters'),
  })
  .strict();

export const adminUpdateProfileSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name cannot exceed 100 characters'),
  })
  .strict();

export const adminUpdatePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, 'Current password must be at least 6 characters')
      .max(100, 'Password is too long'),
    newPassword: z
      .string()
      .min(6, 'New password must be at least 6 characters')
      .max(100, 'Password is too long'),
    confirmPassword: z
      .string()
      .min(6, 'Confirm password must be at least 6 characters')
      .max(100, 'Password is too long'),
  })
  .strict()
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirm password do not match.",
    path: ['confirmPassword'],
  });

export type AdminRejectPriestInput = z.infer<typeof adminRejectPriestSchema>;
export type AdminBanPriestInput = z.infer<typeof adminBanPriestSchema>;
export type AdminBanUserInput = z.infer<typeof adminBanUserSchema>;
export type AdminUpdateProfileInput = z.infer<typeof adminUpdateProfileSchema>;
export type AdminUpdatePasswordInput = z.infer<typeof adminUpdatePasswordSchema>;
