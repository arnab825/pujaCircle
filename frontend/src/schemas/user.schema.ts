import { z } from 'zod';

export const updateUserProfileSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long').optional(),
    email: z.string().trim().email('Invalid email address').max(150, 'Email is too long').optional().or(z.literal('')),
    preferredLanguage: z.string().trim().min(2).max(50).optional().or(z.literal('')),
  })
  .strict();

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
