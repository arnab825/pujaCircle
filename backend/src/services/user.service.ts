import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from '../db/index.js';
import { users } from '../models/user.model.js';
import { priestProfiles } from '../models/priest.model.js';
import { toUserView, UserViewModel } from '../views/user.view.js';
import { UpdateUserProfileInput, ChangePasswordInput } from '../schemas/user.schema.js';
import { AppError } from '../utils/AppError.js';
import { cloudinaryService } from './cloudinary.service.js';
import { cloudinary } from '../config/cloudinary.js';

// Service managing devotee user profile details, contact information, and credentials
export class UserService {
  // Retrieve devotee profile details by user ID
  async getProfile(userId: string): Promise<UserViewModel> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new AppError(404, 'User profile not found.');
    }

    return toUserView(user);
  }

  // Update devotee profile details (name, avatar, contact)
  async updateProfile(userId: string, data: UpdateUserProfileInput): Promise<UserViewModel> {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!existingUser) {
      throw new AppError(404, 'User profile not found.');
    }

    const { avatarUrl, ...otherFields } = data;
    const updatePayload: Partial<typeof users.$inferInsert> = {
      ...otherFields,
      updatedAt: new Date(),
    };

    if (avatarUrl !== undefined) {
      const oldAvatarUrl = existingUser.avatarUrl;
      let finalAvatarUrl: string | null = null;

      if (typeof avatarUrl === 'string' && avatarUrl.trim().length > 0) {
        const trimmed = avatarUrl.trim();

        // Case A: Base64 Data URI from file picker -> Upload to Cloudinary in 'pujacircle/user' folder
        if (trimmed.startsWith('data:image/') || trimmed.startsWith('data:')) {
          try {
            // Ensure 'pujacircle/user' folder exists in the Cloudinary account
            await cloudinary.api.create_folder('pujacircle/user').catch(() => { });
            // Clean up any accidentally created root-level 'user' folder if empty
            await cloudinary.api.delete_folder('user').catch(() => { });

            const uploadResult = await cloudinaryService.uploadImage(trimmed, 'pujacircle/user');
            finalAvatarUrl = uploadResult.secure_url || uploadResult.url;
          } catch (uploadError: any) {
            console.error('[UserService] Cloudinary avatar upload failed:', uploadError);
            throw new AppError(500, 'Failed to upload profile picture to cloud storage.');
          }
        }
        // Case B: Already a hosted URL (e.g. from Cloudinary or external)
        else if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
          finalAvatarUrl = trimmed;
        }

        // Cleanup: Purge previous image from Cloudinary if different
        if (oldAvatarUrl && oldAvatarUrl.startsWith('http') && oldAvatarUrl !== finalAvatarUrl) {
          await cloudinaryService.deleteImageByUrl(oldAvatarUrl).catch((err) => {
            console.warn('[UserService] Failed to clean up previous Cloudinary asset:', err);
          });
        }
      } else {
        // Case C: Photo removed (empty string or null) -> Clean up Cloudinary
        if (oldAvatarUrl && oldAvatarUrl.startsWith('http')) {
          await cloudinaryService.deleteImageByUrl(oldAvatarUrl).catch((err) => {
            console.warn('[UserService] Failed to clean up previous Cloudinary asset:', err);
          });
        }
        finalAvatarUrl = null;
      }

      updatePayload.avatarUrl = finalAvatarUrl;

      // Sync avatar to priest_profiles if this devotee is also a registered priest
      try {
        await db
          .update(priestProfiles)
          .set({ profileImageUrl: finalAvatarUrl || '', updatedAt: new Date() })
          .where(eq(priestProfiles.userId, userId));
      } catch {
        // Safe to ignore if user has no priest profile
      }
    }

    const [updatedUser] = await db
      .update(users)
      .set(updatePayload)
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      throw new AppError(404, 'User profile not found.');
    }

    return toUserView(updatedUser);
  }

  // Update devotee password
  async changePassword(userId: string, data: ChangePasswordInput): Promise<void> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new AppError(404, 'User profile not found.');
    }

    if (user.password) {
      if (!data.currentPassword) {
        throw new AppError(400, 'Current password is required.');
      }
      const isValid = await bcrypt.compare(data.currentPassword, user.password);
      if (!isValid) {
        throw new AppError(400, 'Current password is incorrect.');
      }
    }

    if (data.currentPassword && data.currentPassword === data.newPassword) {
      throw new AppError(400, 'New password cannot be the same as your current password.');
    }

    const passwordHash = await bcrypt.hash(data.newPassword, 10);
    await db.update(users).set({ password: passwordHash, updatedAt: new Date() }).where(eq(users.id, userId));
  }
}

export const userService = new UserService();
