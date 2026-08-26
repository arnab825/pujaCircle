import { z } from 'zod';

export const priestRegistrationSchema = z
  .object({
    fullName: z.string().trim().min(3, 'Full name must be at least 3 characters').max(100),
    phoneNumber: z
      .string()
      .trim()
      .length(10, '10-digit mobile number required')
      .regex(/^[6-9]\d{9}$/, 'Invalid mobile number'),
    email: z.string().trim().email('Invalid email').max(150).optional().or(z.literal('')),
    experienceYears: z.coerce.number().min(1, 'Minimum 1 year experience required').max(70),
    bio: z.string().trim().min(20, 'Please write at least 20 characters about your Vedic lineage & experience').max(2000),
    languages: z.array(z.string().trim().min(1).max(50)).min(1, 'Select at least one language').max(20),
    specializations: z.array(z.string().trim().min(1).max(100)).min(1, 'Select at least one puja specialization').max(50),
    serviceAreas: z.array(z.string().trim().min(1).max(100)).min(1, 'Select at least one service area / locality').max(50),
    city: z.string().trim().min(2, 'City is required').max(100),
    state: z.string().trim().min(2, 'State is required').max(100),
  })
  .strict();

export type PriestRegistrationInput = z.infer<typeof priestRegistrationSchema>;
