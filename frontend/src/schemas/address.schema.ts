import { z } from 'zod';

export const addressSchema = z.object({
  label: z.enum(['HOME', 'OFFICE', 'TEMPLE', 'OTHER'], {
    required_error: 'Please select an address label',
  }),
  recipientName: z.string().min(2, 'Recipient name is required (min 2 characters)').max(100),
  phoneNumber: z
    .string()
    .length(10, 'Recipient phone must be a 10-digit mobile number')
    .regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  houseBuilding: z.string().min(1, 'Flat / House / Building details are required'),
  street: z.string().min(2, 'Street or Road name is required'),
  locality: z.string().min(2, 'Locality / Area is required'),
  landmark: z.string().optional(),
  pincode: z
    .string()
    .length(6, 'PIN code must be exactly 6 digits')
    .regex(/^[1-9][0-9]{5}$/, 'Please enter a valid 6-digit Indian PIN code'),
  city: z.string().min(2, 'City is required'),
  district: z.string().min(2, 'District is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().default('India'),
  isDefault: z.boolean().default(false),
});

export type AddressFormInput = z.infer<typeof addressSchema>;
