import { z } from 'zod';
import { reasonSchema } from './common.schema.js';

/**
 * [SCHEMA] Admin Schemas
 * Strict validation for administrative actions, moderation, and profile settings.
 */
export const adminActionReasonSchema = z
  .object({
    reason: reasonSchema,
  })
  .optional()
  .default({});

export const updateAdminProfileSchema = z.object({
  name: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100, 'Full name cannot exceed 100 characters').optional(),
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100, 'Full name cannot exceed 100 characters').optional(),
  avatarUrl: z.string().optional().nullable().or(z.literal('')),
});

export type AdminActionReasonInput = z.infer<typeof adminActionReasonSchema>;
export type UpdateAdminProfileInput = z.infer<typeof updateAdminProfileSchema>;
