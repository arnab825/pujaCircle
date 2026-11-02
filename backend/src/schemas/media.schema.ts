import { z } from 'zod';

/**
 * [SCHEMA] Media Upload & Storage Schemas
 * Enforces strict boundaries on file uploads, folder targets, and asset deletions.
 */

export const uploadImageSchema = z.object({
  file: z.string().min(20, 'Image base64 data is required').max(10 * 1024 * 1024, 'Payload too large'),
  folder: z.string().regex(/^[a-zA-Z0-9_\-\/]{1,100}$/, 'Invalid folder path format').optional(),
});

export const deleteMediaSchema = z
  .object({
    publicId: z.string().trim().max(255).optional(),
    url: z.string().url('Invalid asset URL').max(1000).optional(),
  })
  .refine((data) => Boolean(data.publicId || data.url), {
    message: 'Either publicId or url must be provided to delete media',
  });

export const uploadSignatureQuerySchema = z.object({
  folder: z.string().regex(/^[a-zA-Z0-9_\-\/]{1,100}$/, 'Invalid folder path format').optional(),
});

export type UploadImageInput = z.infer<typeof uploadImageSchema>;
export type DeleteMediaInput = z.infer<typeof deleteMediaSchema>;

