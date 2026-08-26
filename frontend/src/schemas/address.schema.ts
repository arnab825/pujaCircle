import { z } from 'zod';

export const addressSchema = z
  .object({
    label: z.enum(['HOME', 'OFFICE', 'TEMPLE', 'OTHER']).default('HOME'),
    recipientName: z.string().trim().min(2).max(100).optional().or(z.literal('')),
    phoneNumber: z
      .string()
      .trim()
      .max(15)
      .regex(/^(\+91)?[6-9]\d{9}$/, 'Please enter a valid Indian mobile number')
      .optional()
      .or(z.literal('')),
    houseNo: z.string().trim().min(1, 'House / Flat number is required').max(150, 'House number too long'),
    houseBuilding: z.string().trim().max(150).optional().or(z.literal('')),
    street: z.string().trim().max(150).optional().or(z.literal('')),
    locality: z.string().trim().max(150).optional().or(z.literal('')),
    villageTown: z.string().trim().min(1, 'Village / Town is required').max(150, 'Village/Town name too long'),
    landmark: z.string().trim().max(150).optional().or(z.literal('')),
    pincode: z
      .string()
      .trim()
      .length(6, 'PIN code must be exactly 6 digits')
      .regex(/^[1-9][0-9]{5}$/, 'Please enter a valid 6-digit Indian PIN code (cannot start with 0)'),
    city: z.string().trim().min(2, 'City is required').max(100),
    district: z.string().trim().min(2, 'District is required').max(100),
    state: z.string().trim().min(2, 'State is required').max(100),
    country: z.string().trim().max(50).default('India'),
    isDefault: z.boolean().default(true),
  })
  .strict();

export const pincodeLookupSchema = z
  .object({
    pincode: z
      .string()
      .trim()
      .length(6, 'PIN code must be exactly 6 digits')
      .regex(/^[1-9][0-9]{5}$/, 'Please enter a valid 6-digit Indian PIN code'),
  })
  .strict();

export type AddressFormInput = z.infer<typeof addressSchema>;
export type PincodeLookupInput = z.infer<typeof pincodeLookupSchema>;
