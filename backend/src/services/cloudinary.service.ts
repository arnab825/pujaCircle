import { cloudinary } from '../config/cloudinary.js';

export interface CloudinaryAuthSignature {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder?: string;
}

/**
 * [SERVICE] Cloudinary Media Service
 * Handles signed media direct uploads, server-side asset uploading, and media deletion.
 */
export class CloudinaryService {
  /**
   * Generate signed authentication parameters for direct frontend-to-Cloudinary uploads
   */
  generateUploadSignature(folder: string = 'pujacircle'): CloudinaryAuthSignature {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      cloudinary.config().api_secret as string
    );

    return {
      signature,
      timestamp,
      apiKey: cloudinary.config().api_key as string,
      cloudName: cloudinary.config().cloud_name as string,
      folder,
    };
  }

  /**
   * Upload an image file, buffer, or base64 data URI to Cloudinary storage
   */
  async uploadImage(fileData: string, folder: string = 'pujacircle'): Promise<any> {
    return cloudinary.uploader.upload(fileData, {
      folder,
      resource_type: 'image',
    });
  }

  /**
   * Delete a media asset from Cloudinary storage by public ID
   */
  async deleteImage(publicId: string): Promise<any> {
    return cloudinary.uploader.destroy(publicId, {
      invalidate: true,
      resource_type: 'image',
    });
  }

  /**
   * Extract Cloudinary public_id from a full URL or relative identifier
   */
  extractPublicIdFromUrl(urlOrPublicId: string): string | null {
    if (!urlOrPublicId || typeof urlOrPublicId !== 'string') return null;

    // Fast-path: if contains 'pujacircle/' folder
    if (urlOrPublicId.includes('pujacircle/')) {
      const idx = urlOrPublicId.indexOf('pujacircle/');
      const after = urlOrPublicId.substring(idx).split('?')[0].split('#')[0];
      const lastDot = after.lastIndexOf('.');
      return lastDot !== -1 ? after.substring(0, lastDot) : after;
    }

    // If it doesn't contain http/https, it might be a direct public_id
    if (!urlOrPublicId.startsWith('http://') && !urlOrPublicId.startsWith('https://')) {
      if (urlOrPublicId.startsWith('/')) return null;
      return urlOrPublicId.replace(/\.[a-zA-Z0-9]+$/, '');
    }

    // Must be hosted on cloudinary.com
    if (!urlOrPublicId.includes('cloudinary.com')) {
      return null;
    }

    try {
      const uploadIdx = urlOrPublicId.indexOf('/upload/');
      if (uploadIdx === -1) return null;

      let path = urlOrPublicId.substring(uploadIdx + '/upload/'.length);
      path = path.split('?')[0].split('#')[0];

      const parts = path.split('/');
      const versionIdx = parts.findIndex((p) => /^v\d+$/.test(p));

      let cleanParts: string[];
      if (versionIdx !== -1) {
        cleanParts = parts.slice(versionIdx + 1);
      } else {
        cleanParts = parts.filter(
          (p) => !p.includes(',') && !/^[a-z]{1,3}_[a-zA-Z0-9_]+$/.test(p)
        );
      }

      if (cleanParts.length === 0) return null;

      const pathWithExt = cleanParts.join('/');
      const lastDotIdx = pathWithExt.lastIndexOf('.');
      return lastDotIdx !== -1 ? pathWithExt.substring(0, lastDotIdx) : pathWithExt;
    } catch {
      return null;
    }
  }

  /**
   * Delete a media asset from Cloudinary by either its full URL or public ID.
   * Invalidates CDN caches and gracefully catches errors.
   */
  async deleteImageByUrl(urlOrPublicId: string): Promise<any> {
    const publicId = this.extractPublicIdFromUrl(urlOrPublicId);
    if (!publicId) {
      return { result: 'skipped_not_cloudinary_asset' };
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        invalidate: true,
        resource_type: 'image',
      });
      console.log(`[CloudinaryService] Deleted asset (${publicId}) from Cloudinary:`, result);
      return result;
    } catch (error) {
      console.warn(`[CloudinaryService] Failed to destroy asset (${publicId}):`, error);
      return { result: 'error', error };
    }
  }
}

export const cloudinaryService = new CloudinaryService();
