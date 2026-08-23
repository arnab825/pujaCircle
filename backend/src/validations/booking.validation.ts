import { z } from 'zod';

export const createBookingValidation = z.object({
  priestId: z.string(),
  ritualId: z.string(),
  addressId: z.string(),
  slotId: z.string(),
  bookingDate: z.string(),
});
