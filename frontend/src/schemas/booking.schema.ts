import { z } from 'zod';

export const createBookingSchema = z.object({
  priestId: z.string().trim().min(1, 'Priest must be selected'),
  priestServiceId: z.string().trim().optional(),
  ritualId: z.string().trim().optional(),
  addressId: z.string().trim().min(1, 'Address must be selected'),
  slotId: z.string().trim().min(1, 'Time slot must be selected'),
  availabilitySlotId: z.string().trim().optional(),
  bookingDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid booking date required (YYYY-MM-DD)'),
  specialInstructions: z.string().trim().max(500, 'Special instructions cannot exceed 500 characters').optional().or(z.literal('')),
  userNotes: z.string().trim().max(500, 'Notes cannot exceed 500 characters').optional().or(z.literal('')),
  dakshinaAmount: z.coerce.number().min(0).max(1000000).optional(),
});

export const cancelBookingSchema = z.object({
  bookingId: z.string().trim().min(1, 'Booking ID is required'),
  reason: z.string().trim().min(5, 'Please provide a cancellation reason (min 5 characters)').max(500),
});

export const rejectBookingSchema = z.object({
  bookingId: z.string().trim().min(1, 'Booking ID is required'),
  reason: z.string().trim().min(5, 'Please provide a reason for declining (min 5 characters)').max(500),
});

export const ratingSchema = z.object({
  bookingId: z.string().trim().min(1, 'Booking ID is required'),
  rating: z.coerce.number().int().min(1, 'Please give at least 1 star').max(5, 'Maximum rating is 5 stars'),
  review: z.string().trim().max(500, 'Review cannot exceed 500 characters').optional().or(z.literal('')),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type RejectBookingInput = z.infer<typeof rejectBookingSchema>;
export type RatingInput = z.infer<typeof ratingSchema>;
