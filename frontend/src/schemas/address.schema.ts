import { z } from 'zod';

export const addressSchema = z.object({
  label: z.enum(['HOME', 'OFFICE', 'TEMPLE', 'OTHER']).default('HOME'),
  recipientName: z.string().trim().max(100).optional().or(z.literal('')),
  phoneNumber: z
    .string()
    .trim()
    .max(15)
    .optional()
    .or(z.literal('')),
  houseNo: z.string().trim().min(1, 'House / Flat number is required').max(150),
  houseBuilding: z.string().trim().max(150).optional().or(z.literal('')),
  street: z.string().trim().max(150).optional().or(z.literal('')),
  locality: z.string().trim().max(150).optional().or(z.literal('')),
  villageTown: z.string().trim().min(1, 'Village / Town is required').max(150),
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
  isDefault: z.boolean().default(true),
});

export type AddressFormInput = z.infer<typeof addressSchema>;
