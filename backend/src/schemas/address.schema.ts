import { z } from 'zod';

// Schema for creating and updating devotee addresses
export const createAddressSchema = z.object({
  label: z.string().trim().max(100).optional(),
  houseNo: z.string().trim().min(1, 'House/Flat number is required').max(100),
  houseBuilding: z.string().trim().max(255).optional(),
  street: z.string().trim().max(255).optional(),
  locality: z.string().trim().max(255).optional(),
  villageTown: z.string().trim().max(255).optional(),
  city: z.string().trim().min(1, 'City is required').max(100),
  district: z.string().trim().min(1, 'District is required').max(100),
  state: z.string().trim().min(1, 'State is required').max(100),
  pincode: z.string().trim().regex(/^\d{6}$/, 'PIN code must be a 6-digit number'),
  isDefault: z.boolean().optional().default(false),
});

export const updateAddressSchema = createAddressSchema.partial();

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
