import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../models/user.model.js';
import { supabase, supabaseAdmin } from '../config/supabase.js';
import { toUserView, UserViewModel } from '../views/user.view.js';
import { UpdateUserProfileInput, ChangePasswordInput } from '../schemas/user.schema.js';
import { AppError } from '../utils/AppError.js';

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
    const [updatedUser] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      throw new AppError(404, 'User profile not found.');
    }

    return toUserView(updatedUser);
  }

  // Update devotee password via Supabase Auth
  async changePassword(userId: string, data: ChangePasswordInput): Promise<void> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new AppError(404, 'User profile not found.');
    }

    if (data.currentPassword && user.email) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email.trim().toLowerCase(),
        password: data.currentPassword,
      });

      if (signInError) {
        throw new AppError(400, 'Current password is incorrect.');
      }
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: data.newPassword,
    });

    if (updateError) {
      throw new AppError(400, updateError.message || 'Failed to update credentials. Please try again.');
    }
  }
}

export const userService = new UserService();
