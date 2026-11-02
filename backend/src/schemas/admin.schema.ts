import { z } from 'zod';

/**
 * [SCHEMA] Admin Schemas
 * Strict validation for administrative actions, moderation, and profile settings.
 */
export const adminActionReasonSchema = z.object({
  reason: z.string().trim().max(500, 'Reason cannot exceed 500 characters').optional(),
});

export const updateAdminProfileSchema = z.object({
  name: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100, 'Full name cannot exceed 100 characters').optional(),
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100, 'Full name cannot exceed 100 characters').optional(),
  avatarUrl: z.string().url('Invalid avatar URL format').max(1000).optional().nullable(),
});

export type AdminActionReasonInput = z.infer<typeof adminActionReasonSchema>;
export type UpdateAdminProfileInput = z.infer<typeof updateAdminProfileSchema>;
