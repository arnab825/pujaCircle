import { z } from 'zod';

export const addressSchema = z
  .object({
    label: z.enum(['HOME', 'OFFICE', 'TEMPLE', 'OTHER'], {
      required_error: 'Please select an address label',
    }),
    recipientName: z.string().trim().min(2, 'Recipient name is required (min 2 characters)').max(100),
    phoneNumber: z
      .string()
      .trim()
      .length(10, 'Recipient phone must be a 10-digit mobile number')
      .regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
    houseBuilding: z.string().trim().min(1, 'Flat / House / Building details are required').max(150),
    street: z.string().trim().min(2, 'Street or Road name is required').max(150),
    locality: z.string().trim().min(2, 'Locality / Area is required').max(150),
    landmark: z.string().trim().max(150).optional().or(z.literal('')),
    pincode: z
      .string()
      .trim()
      .length(6, 'PIN code must be exactly 6 digits')
      .regex(/^[1-9][0-9]{5}$/, 'Please enter a valid 6-digit Indian PIN code'),
    city: z.string().trim().min(2, 'City is required').max(100),
    district: z.string().trim().min(2, 'District is required').max(100),
    state: z.string().trim().min(2, 'State is required').max(100),
    country: z.string().trim().default('India'),
    isDefault: z.boolean().default(false),
  })
  .strict();

export type AddressFormInput = z.infer<typeof addressSchema>;
