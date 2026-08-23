import { z } from 'zod';

export const createBookingSchema = z.object({
  priestId: z.string().min(1, 'Priest must be selected'),
  ritualId: z.string().min(1, 'Ritual must be selected'),
  addressId: z.string().min(1, 'Address must be selected'),
  slotId: z.string().min(1, 'Time slot must be selected'),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid booking date required (YYYY-MM-DD)'),
  specialInstructions: z.string().max(500, 'Special instructions cannot exceed 500 characters').optional(),
  dakshinaAmount: z.coerce.number().min(0).optional(),
});

export const cancelBookingSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  reason: z.string().min(5, 'Please provide a cancellation reason (min 5 characters)'),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
