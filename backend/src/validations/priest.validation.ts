import { z } from 'zod';

export const priestRegistrationValidation = z.object({
  fullName: z.string(),
  phoneNumber: z.string(),
  experienceYears: z.number(),
  bio: z.string(),
});
