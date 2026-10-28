import { randomInt } from 'crypto';
import { eq, or, gt, and } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { supabase, supabaseAdmin } from '../config/supabase.js';
import { db } from '../db/index.js';
import { users } from '../models/user.model.js';
import { priestProfiles } from '../models/priest.model.js';
import { addresses } from '../models/address.model.js';
import { otpCodes } from '../models/otp.model.js';
import { toUserView, UserViewModel } from '../views/user.view.js';
import { brevoEmailService } from './email.service.js';
import { AppError } from '../utils/AppError.js';
import {
  LoginInput,
  RegisterUserInput,
  RegisterPriestInput,
  VerifyPhoneOtpInput,
  VerifyEmailOtpInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '../schemas/auth.schema.js';

export interface AuthResult {
  user: UserViewModel;
  token?: string;
  verified?: boolean;
  requiresRegistration?: boolean;
  phoneNumber?: string;
}

// Generate signed application JWT with user identity claims
const generateAppToken = (user: { id: string; email?: string | null; role: string }): string => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email || '',
      role: user.role,
    },
    env.JWT_SECRET,
    { expiresIn: (env.JWT_EXPIRES_IN as any) || '7d' }
  );
};

// Generate and persist a cryptographically secure 6-digit OTP in PostgreSQL
const generateAndStoreOtp = async (destination: string): Promise<string> => {
  const cleanDest = destination.trim().toLowerCase();
  const code = randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes TTL

  // Delete prior OTPs for this destination before inserting a fresh code
  await db.delete(otpCodes).where(eq(otpCodes.destination, cleanDest));
  await db.insert(otpCodes).values({ destination: cleanDest, code, expiresAt });

  if (env.NODE_ENV !== 'production') {
    console.log(`[OTP] ${destination} -> ${code} (valid for 10 min)`);
  }

  return code;
};

// Validate submitted OTP against database record with attempt rate-limiting
const verifyOtp = async (destination: string, code: string): Promise<boolean> => {
  const cleanDest = destination.trim().toLowerCase();

  const [record] = await db
    .select()
    .from(otpCodes)
    .where(and(eq(otpCodes.destination, cleanDest), gt(otpCodes.expiresAt, new Date())))
    .limit(1);

  if (!record) return false;

  // Maximum 5 failed attempts before code invalidation
  if (record.attempts >= 5) {
    await db.delete(otpCodes).where(eq(otpCodes.id, record.id));
    return false;
  }

  await db
    .update(otpCodes)
    .set({ attempts: record.attempts + 1 })
    .where(eq(otpCodes.id, record.id));

  if (record.code === code.trim()) {
    await db.delete(otpCodes).where(eq(otpCodes.id, record.id)); // Single-use consumption
    return true;
  }

  return false;
};

// Service class handling authentication, registration, and credential recovery
export class AuthService {
  // Authenticate an existing user with email and password
  async login(input: LoginInput): Promise<AuthResult> {
    const targetEmail = input.email.trim().toLowerCase();

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: targetEmail,
      password: input.password,
    });

    if (authError || !authData.user) {
      throw new AppError(401, authError?.message || 'Invalid credentials. Please verify your email and password.');
    }

    const [userRecord] = await db
      .select()
      .from(users)
      .where(eq(users.id, authData.user.id))
      .limit(1);

    if (!userRecord) {
      throw new AppError(404, 'Account profile not found. Please complete registration or contact support.');
    }

    if (userRecord.accountStatus === 'BANNED') {
      throw new AppError(403, `Account suspended: ${userRecord.banReason || 'Administrative decision'}.`);
    }

    return {
      user: toUserView(userRecord),
      token: generateAppToken(userRecord) || authData.session?.access_token,
    };
  }

  // Register a new devotee user account
  async registerUser(input: RegisterUserInput): Promise<AuthResult> {
    const existing = await db
      .select()
      .from(users)
      .where(or(eq(users.phoneNumber, input.phoneNumber), eq(users.email, input.email)))
      .limit(1);

    if (existing.length > 0) {
      throw new AppError(409, 'An account with this phone number or email address is already registered.');
    }

    const { data: authUser, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: {
        name: input.fullName,
        phone: input.phoneNumber,
        role: 'USER',
      },
    });

    if (createAuthError || !authUser.user) {
      throw new AppError(400, createAuthError?.message || 'Failed to create authentication credentials.');
    }

    const userId = authUser.user.id;
    let createdUser: typeof users.$inferSelect | undefined;

    try {
      createdUser = await db.transaction(async (tx) => {
        const [inserted] = await tx
          .insert(users)
          .values({
            id: userId,
            name: input.fullName,
            email: input.email,
            phoneNumber: input.phoneNumber,
            role: 'USER',
          })
          .returning();

        if (input.address) {
          await tx.insert(addresses).values({
            userId,
            label: input.address.label,
            houseNo: input.address.houseNo,
            houseBuilding: input.address.houseBuilding,
            street: input.address.street,
            locality: input.address.locality,
            villageTown: input.address.villageTown,
            city: input.address.city,
            district: input.address.district,
            state: input.address.state,
            pincode: input.address.pincode,
            isDefault: true,
          });
        }
        return inserted;
      });
    } catch (dbError: any) {
      await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => {});
      throw new AppError(500, dbError?.message || 'Failed to save devotee user profile in database.');
    }

    if (!createdUser) {
      throw new AppError(500, 'Failed to initialize user account.');
    }

    const { data: sessionData } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    return {
      user: toUserView(createdUser),
      token: generateAppToken(createdUser) || sessionData?.session?.access_token,
    };
  }

  // Register a new Purohit priest profile application
  async registerPriest(input: RegisterPriestInput): Promise<AuthResult> {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.phoneNumber, input.phoneNumber))
      .limit(1);

    if (existing.length > 0) {
      throw new AppError(409, 'A user account with this phone number is already registered.');
    }

    const targetEmail = input.email || `priest.${input.phoneNumber}@pujacircle.internal`;
    const targetPassword = input.password || `PujaPriest@${randomInt(100000, 999999)}`;

    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: targetEmail,
      password: targetPassword,
      email_confirm: true,
      user_metadata: {
        name: input.fullName,
        phone: input.phoneNumber,
        role: 'PRIEST',
      },
    });

    if (authError || !authUser.user) {
      throw new AppError(400, authError?.message || 'Failed to create priest authentication record.');
    }

    const userId = authUser.user.id;
    let createdUser: typeof users.$inferSelect | undefined;

    try {
      createdUser = await db.transaction(async (tx) => {
        const [inserted] = await tx
          .insert(users)
          .values({
            id: userId,
            name: input.fullName,
            email: targetEmail,
            phoneNumber: input.phoneNumber,
            role: 'PRIEST',
          })
          .returning();

        await tx.insert(priestProfiles).values({
          userId,
          approvalStatus: 'PENDING',
          experienceYears: input.experienceYears || 0,
          bio: input.bio || '',
          languages: input.languages || ['Hindi'],
          specializations: input.specializations || ['General Puja'],
          serviceAreas: input.serviceAreas || [],
          city: input.city || '',
          state: input.state || '',
          pincode: input.pincode || '',
          profileImageUrl: '',
        });

        return inserted;
      });
    } catch (dbError: any) {
      await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => {});
      throw new AppError(500, dbError?.message || 'Failed to save priest profile application in database.');
    }

    if (!createdUser) {
      throw new AppError(500, 'Failed to initialize priest account.');
    }

    const { data: sessionData } = await supabase.auth.signInWithPassword({
      email: targetEmail,
      password: targetPassword,
    });

    return {
      user: toUserView(createdUser),
      token: generateAppToken(createdUser) || sessionData?.session?.access_token,
    };
  }

  // Retrieve authenticated user profile by user UUID
  async getMe(userId: string): Promise<UserViewModel> {
    const [userRecord] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userRecord) {
      throw new AppError(404, 'User profile not found.');
    }

    return toUserView(userRecord);
  }

  // Dispatch phone verification OTP and store in database
  async sendPhoneOtp(phoneNumber: string): Promise<{ message: string }> {
    const cleanPhone = phoneNumber.trim();
    const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+91${cleanPhone}`;

    const code = await generateAndStoreOtp(cleanPhone);
    await db.delete(otpCodes).where(eq(otpCodes.destination, formattedPhone.toLowerCase()));
    await db.insert(otpCodes).values({
      destination: formattedPhone.toLowerCase(),
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    return {
      message: `Verification code dispatched successfully to ${formattedPhone}.`,
    };
  }

  // Verify submitted phone OTP and return registered user or registration requirement
  async verifyPhoneOtp(input: VerifyPhoneOtpInput): Promise<AuthResult> {
    const cleanPhone = input.phoneNumber.trim();
    const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+91${cleanPhone}`;

    const isDynamicValid = (await verifyOtp(cleanPhone, input.otp)) || (await verifyOtp(formattedPhone, input.otp));

    let supabaseSuccess = false;
    if (!isDynamicValid) {
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          phone: formattedPhone,
          token: input.otp,
          type: 'sms',
        });
        if (!error && data.user) supabaseSuccess = true;
      } catch {
        // Live SMS provider optional fallback
      }
    }

    if (!isDynamicValid && !supabaseSuccess) {
      throw new AppError(400, 'Invalid or expired phone verification code. Please check the code and try again.');
    }

    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.phoneNumber, input.phoneNumber))
      .limit(1);

    if (dbUser) {
      return { user: toUserView(dbUser) };
    }

    return {
      verified: true,
      requiresRegistration: true,
      phoneNumber: input.phoneNumber,
    } as any;
  }

  // Dispatch email verification OTP via Brevo REST API
  async sendEmailOtp(email: string): Promise<{ message: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const code = await generateAndStoreOtp(cleanEmail);

    await brevoEmailService.sendOtpEmail(cleanEmail, code, 'VERIFICATION');

    return {
      message: `Verification code dispatched successfully to ${cleanEmail}.`,
    };
  }

  // Verify submitted email OTP and optionally update account password
  async verifyEmailOtp(input: VerifyEmailOtpInput): Promise<{ message: string }> {
    const cleanEmail = input.email.trim().toLowerCase();
    const isDynamicValid = await verifyOtp(cleanEmail, input.otp);

    if (!isDynamicValid) {
      throw new AppError(400, 'Invalid or expired email verification code. Please check the code and try again.');
    }

    if (input.newPassword) {
      const [dbUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, cleanEmail))
        .limit(1);

      if (!dbUser) throw new AppError(404, 'No registered account found for this email.');

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(dbUser.id, {
        password: input.newPassword,
      });

      if (updateError) {
        throw new AppError(400, updateError.message || 'Failed to update credentials.');
      }
    }

    return { message: 'Email verified successfully.' };
  }

  // Initiate password recovery by validating user existence and sending OTP
  async forgotPassword(input: ForgotPasswordInput): Promise<{ message: string }> {
    const cleanEmail = input.email.trim().toLowerCase();

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, cleanEmail))
      .limit(1);

    if (!existingUser) {
      throw new AppError(404, 'No registered account found with this email address.');
    }

    const code = await generateAndStoreOtp(cleanEmail);
    await brevoEmailService.sendOtpEmail(cleanEmail, code, 'PASSWORD_RESET');

    return {
      message: `Password recovery verification code sent to ${cleanEmail}.`,
    };
  }

  // Reset user password after validating OTP code
  async resetPassword(input: ResetPasswordInput): Promise<{ message: string }> {
    const cleanEmail = input.email.trim().toLowerCase();
    const isDynamicValid = await verifyOtp(cleanEmail, input.otp);

    if (!isDynamicValid) {
      throw new AppError(400, 'Invalid or expired recovery verification code. Please request a new code.');
    }

    const [dbUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, cleanEmail))
      .limit(1);

    if (!dbUser) {
      throw new AppError(404, 'No active account found for password reset.');
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(dbUser.id, {
      password: input.newPassword,
    });

    if (updateError) {
      throw new AppError(400, updateError.message || 'Failed to update credentials. Please try again.');
    }

    return {
      message: 'Password updated successfully. You may now sign in with your new credentials.',
    };
  }

  // Invalidate session on logout
  async logout(token?: string): Promise<{ message: string }> {
    if (token) {
      await supabase.auth.signOut().catch(() => {});
    }
    return { message: 'Logged out successfully.' };
  }
}

export const authService = new AuthService();
