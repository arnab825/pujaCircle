import { z } from 'zod';

export const updateUserProfileSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long').optional(),
    email: z.string().trim().email('Invalid email address').max(150, 'Email is too long').optional().or(z.literal('')),
    preferredLanguage: z.string().trim().min(2, 'Language must be at least 2 characters').max(50, 'Language too long').optional().or(z.literal('')),
    profileImageUrl: z.string().trim().max(10000000).optional().or(z.literal('')),
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Current password must be at least 6 characters').max(100, 'Password is too long'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters').max(100, 'Password is too long'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters').max(100, 'Password is too long'),
  })
  .strict()
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirm password do not match",
    path: ['confirmPassword'],
  });

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
