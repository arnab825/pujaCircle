import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from '@/db/index.js';
import { users } from '@/models/user.model.js';
import { priestProfiles } from '@/models/priest.model.js';
import { toUserView, UserViewModel } from '@/views/user.view.js';
import { UpdateUserProfileInput, ChangePasswordInput } from '@/schemas/user.schema.js';
import { AppError } from '@/utils/AppError.js';
import { cloudinaryService } from '@/services/cloudinary.service.js';

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
      const finalAvatarUrl = await cloudinaryService.processAvatarUpload(
        avatarUrl,
        existingUser.avatarUrl,
        'pujacircle/user'
      );

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
