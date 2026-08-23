import { z } from 'zod';

export const priestRegistrationSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  phoneNumber: z
    .string()
    .length(10, '10-digit mobile number required')
    .regex(/^[6-9]\d{9}$/, 'Invalid mobile number'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  experienceYears: z.coerce.number().min(1, 'Minimum 1 year experience required').max(70),
  bio: z.string().min(20, 'Please write at least 20 characters about your Vedic lineage & experience'),
  languages: z.array(z.string()).min(1, 'Select at least one language'),
  specializations: z.array(z.string()).min(1, 'Select at least one puja specialization'),
  serviceAreas: z.array(z.string()).min(1, 'Select at least one service area / locality'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
});

export type PriestRegistrationInput = z.infer<typeof priestRegistrationSchema>;
