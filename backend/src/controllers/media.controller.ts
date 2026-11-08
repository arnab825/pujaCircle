import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../views/response.view.js';
import { cloudinaryService } from '../services/cloudinary.service.js';

/**
 * Validates the true binary content (magic bytes) of an image buffer
 * to prevent polyglot files, executables, or script injection.
 */
function isValidImageContent(buffer: Buffer): boolean {
  if (buffer.length < 8) return false;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return true;
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return true;
  }

  // WebP: RIFF ... WEBP
  if (
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return true;
  }

  // GIF: GIF87a or GIF89a
  if (buffer.subarray(0, 4).toString('ascii') === 'GIF8') {
    return true;
  }

  return false;
}

/**
 * [CONTROLLER] Media Controller
 * Responsibility: Cloudinary direct upload signatures, secure verified image uploading,
 * and isolated storage lifecycle management.
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
   * Uploads picture to Cloudinary storage. Strictly enforced under 2MB,
   * validating both payload format and binary content magic bytes.
   */
  async uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { file, folder } = req.body;
      if (!file || typeof file !== 'string') {
        sendError(res, 'Image data (base64 string) is strictly required.', 400);
        return;
      }

      // Extract base64 payload from data URI if present
      const base64Content = file.includes(';base64,') ? file.split(';base64,')[1] : file;
      const buffer = Buffer.from(base64Content, 'base64');

      // 1. Strict Size Enforcement (Max 2MB)
      const MAX_BYTES = 2 * 1024 * 1024;
      if (buffer.length > MAX_BYTES) {
        sendError(
          res,
          `Image must be strictly under 2MB. Current size is ${(buffer.length / (1024 * 1024)).toFixed(2)} MB.`,
          400
        );
        return;
      }

      // 2. Binary Content Verification (Magic Bytes Check - Not just file extension)
      if (!isValidImageContent(buffer)) {
        sendError(
          res,
          'Invalid file content. Uploaded file must be a verified image (JPEG, PNG, WebP, or GIF).',
          400
        );
        return;
      }

      // 3. Isolated Cloud Storage (Outside web root, cannot be executed)
      const uploadResult = await cloudinaryService.uploadImage(file, folder || 'pujacircle/catalog');
      sendSuccess(res, 'Image uploaded to Cloudinary successfully.', {
        url: uploadResult.secure_url || uploadResult.url,
        publicId: uploadResult.public_id,
        bytes: uploadResult.bytes,
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/media
   * Deletes an image from Cloudinary storage by url or publicId.
   */
  async deleteMedia(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      next(error);
    }
  }
}

export const mediaController = new MediaController();
