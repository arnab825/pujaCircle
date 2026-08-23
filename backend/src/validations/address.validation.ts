import { z } from 'zod';

export const createAddressValidation = z.object({
  label: z.enum(['HOME', 'OFFICE', 'TEMPLE', 'OTHER']),
  recipientName: z.string(),
  phoneNumber: z.string(),
  houseBuilding: z.string(),
  street: z.string(),
  locality: z.string(),
  pincode: z.string(),
  city: z.string(),
  district: z.string(),
  state: z.string(),
});
