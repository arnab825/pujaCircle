import { z } from 'zod';

export const updateUserProfileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  preferredLanguage: z.string().optional(),
});

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
