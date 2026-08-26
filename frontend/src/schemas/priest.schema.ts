import { z } from 'zod';

export const priestRegistrationSchema = z.object({
  fullName: z.string().trim().min(3, 'Full name must be at least 3 characters').max(100),
  phoneNumber: z
    .string()
    .trim()
    .length(10, '10-digit mobile number required')
    .regex(/^[6-9]\d{9}$/, 'Invalid mobile number'),
  email: z.string().trim().email('Invalid email').max(150).optional().or(z.literal('')),
  experienceYears: z.coerce.number().min(0, 'Experience cannot be negative').max(70),
  bio: z.string().trim().min(20, 'Please write at least 20 characters about your Vedic lineage & experience').max(2000),
  languages: z.array(z.string().trim().min(1).max(50)).min(1, 'Select at least one language').max(20),
  specializations: z.array(z.string().trim().min(1).max(100)).min(1, 'Select at least one puja specialization').max(50),
  serviceAreas: z.array(z.string().trim().min(1).max(100)).min(1, 'Select at least one service area / locality').max(50),
  city: z.string().trim().min(2, 'City is required').max(100),
  state: z.string().trim().min(2, 'State is required').max(100),
});

export const priestServiceSchema = z.object({
  serviceName: z.string().trim().min(2, 'Service name must be at least 2 characters').max(100, 'Service name is too long'),
  price: z.coerce.number().int('Price must be a whole number').positive('Price must be a positive amount in Indian Rupees (₹)').max(500000, 'Price cannot exceed ₹5,00,000'),
});

export const availabilitySlotSchema = z
  .object({
    date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid date required (YYYY-MM-DD)'),
    startTime: z.string().trim().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Valid start time required (HH:MM)'),
    endTime: z.string().trim().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Valid end time required (HH:MM)'),
  })
  .refine(
    (data) => {
      const [startHour, startMin] = data.startTime.split(':').map(Number);
      const [endHour, endMin] = data.endTime.split(':').map(Number);
      const startTotal = startHour * 60 + startMin;
      const endTotal = endHour * 60 + endMin;
      const duration = endTotal - startTotal;
      return duration >= 30 && duration <= 720; // 30 mins to 12 hours
    },
    {
      message: 'End time must be at least 30 minutes and at most 12 hours after start time',
      path: ['endTime'],
    }
  );

export type PriestRegistrationInput = z.infer<typeof priestRegistrationSchema>;
export type PriestServiceInput = z.infer<typeof priestServiceSchema>;
export type AvailabilitySlotInput = z.infer<typeof availabilitySlotSchema>;
