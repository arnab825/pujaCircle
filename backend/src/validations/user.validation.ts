import { z } from 'zod';

export const updateUserProfileValidation = z.object({
  fullName: z.string().optional(),
  email: z.string().email().optional(),
});
