import { Router } from 'express';
import { mediaController } from '../controllers/media.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  uploadImageSchema,
  deleteMediaSchema,
  uploadSignatureQuerySchema,
} from '../schemas/media.schema.js';

const router = Router();

/**
 * [ROUTE] /api/v1/media
 * Direct Cloudinary upload signature generation, file uploads, and media storage management.
 * All media mutative operations require authenticated session.
 */
router.get(
  '/signature',
  requireAuth,
  validate(uploadSignatureQuerySchema, 'query'),
  mediaController.getUploadSignature
);

router.post(
  '/upload',
  requireAuth,
  validate(uploadImageSchema),
  mediaController.uploadImage
);

router.delete(
  '/',
  requireAuth,
  validate(deleteMediaSchema),
  mediaController.deleteMedia
);

export const mediaRoutes = router;
