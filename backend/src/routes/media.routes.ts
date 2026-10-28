import { Router } from 'express';
import { mediaController } from '../controllers/media.controller.js';

const router = Router();

/**
 * [ROUTE] /api/v1/media
 * Direct Cloudinary upload signature generation, file uploads, and media storage management.
 */
router.get('/signature', mediaController.getUploadSignature);
router.post('/upload', mediaController.uploadImage);
router.delete('/', mediaController.deleteMedia);

export const mediaRoutes = router;
