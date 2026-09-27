import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../views/response.view.js';
import { cloudinaryService } from '../services/cloudinary.service.js';

/**
 * [CONTROLLER] Media Controller
 * Responsibility: Cloudinary direct upload signatures and media storage management.
 */
export class MediaController {
  /**
   * GET /api/v1/media/signature or GET /api/v1/media/auth
   * Generates signed parameters for direct frontend-to-Cloudinary upload.
   */
  async getUploadSignature(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const folder = (req.query.folder as string) || 'pujacircle';
      const authParams = cloudinaryService.generateUploadSignature(folder);
      sendSuccess(res, 'Cloudinary upload signature generated successfully.', authParams);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/media/upload
   * Uploads picture to Cloudinary storage. Strictly enforced under 2MB.
   */
  async uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { file, folder } = req.body;
      if (!file || typeof file !== 'string') {
        sendError(res, 'Image data (base64) is strictly required.', 400);
        return;
      }

      // Check file size: base64 string size in bytes is roughly (length * 3 / 4)
      const approxSizeBytes = Math.round((file.length * 3) / 4);
      const MAX_BYTES = 2 * 1024 * 1024; // 2MB
      if (approxSizeBytes > MAX_BYTES) {
        sendError(res, `Image must be strictly under 2MB. Current size is approx ${(approxSizeBytes / (1024 * 1024)).toFixed(2)} MB.`, 400);
        return;
      }

      const uploadResult = await cloudinaryService.uploadImage(file, folder || 'pujacircle/catalog');
      sendSuccess(res, 'Image uploaded to Cloudinary successfully.', {
        url: uploadResult.secure_url || uploadResult.url,
        publicId: uploadResult.public_id,
        bytes: uploadResult.bytes,
      });
    } catch (error: any) {
      sendError(res, error.message || 'Failed to upload image to Cloudinary.', 500);
    }
  }

  /**
   * DELETE /api/v1/media
   * Deletes an image from Cloudinary storage by url or publicId.
   */
  async deleteMedia(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const { publicId, url } = req.body || {};
      const target = publicId || url || (req.query.publicId as string) || (req.query.url as string);

      if (!target) {
        sendError(res, 'A publicId or url is required to delete media from Cloudinary.', 400);
        return;
      }

      const result = await cloudinaryService.deleteImageByUrl(target);
      sendSuccess(res, 'Media removed from Cloudinary successfully.', result);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to delete media from Cloudinary.', 500);
    }
  }
}

export const mediaController = new MediaController();

