import { randomInt, randomUUID } from 'crypto';
import { eq, or, gt, and, sql } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '@/config/env.js';
import { db } from '@/db/index.js';
import { users } from '@/models/user.model.js';
import { priestProfiles } from '@/models/priest.model.js';
import { addresses } from '@/models/address.model.js';
import { otpCodes } from '@/models/otp.model.js';
import { toUserView, UserViewModel } from '@/views/user.view.js';
import { brevoEmailService } from '@/services/email.service.js';
import { AppError } from '@/utils/AppError.js';
import { normalizePhoneNumber } from '@/utils/auth.util.js';
import {
  LoginInput,
  RegisterUserInput,
  RegisterPriestInput,
  VerifyEmailOtpInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '@/schemas/auth.schema.js';

export interface AuthResult {
  user?: UserViewModel;
  token?: string;
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

  // Verify code match first
  if (record.code === code.trim()) {
    await db.delete(otpCodes).where(eq(otpCodes.id, record.id)); // Single-use consumption
    return true;
  }

  // Only increment attempt counter on incorrect code entry
  await db
    .update(otpCodes)
    .set({ attempts: record.attempts + 1 })
    .where(eq(otpCodes.id, record.id));

  return false;
};

// Service class handling authentication, registration, and credential recovery
export class AuthService {
  // Authenticate an existing user with email and password
  async login(input: LoginInput): Promise<AuthResult> {
    const targetEmail = input.email.trim().toLowerCase();

    // 1. Verify user profile exists in application database
    const [userRecord] = await db
      .select()
      .from(users)
      .where(sql`LOWER(${users.email}) = ${targetEmail}`)
      .limit(1);

    if (!userRecord) {
      throw new AppError(
        404,
        'No registered account found with this email address. Please check your email spelling or register a new account.'
      );
    }

    if (userRecord.accountStatus === 'BANNED') {
      throw new AppError(
        403,
        `Account suspended: ${userRecord.banReason || 'Administrative decision'}. Please contact platform support.`
      );
    }

    // For PRIEST role: verify priestProfile exists
    let approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | undefined;
    if (userRecord.role === 'PRIEST') {
      const [priestProfile] = await db
        .select({
          approvalStatus: priestProfiles.approvalStatus,
          profileImageUrl: priestProfiles.profileImageUrl,
        })
        .from(priestProfiles)
        .where(eq(priestProfiles.userId, userRecord.id))
        .limit(1);

      if (!priestProfile) {
        throw new AppError(
          404,
          'Priest profile record not found. Your Vedic Purohit profile was removed by administration. You have to register as a Vedic Purohit first.'
        );
      }
      approvalStatus = priestProfile.approvalStatus;

      const effectiveAvatar =
        userRecord.avatarUrl ||
        priestProfile.profileImageUrl ||
        null;

      userRecord.avatarUrl = effectiveAvatar;
    }

    // 2. Validate credentials with bcrypt
    const isValid = await bcrypt.compare(input.password, userRecord.password || '');
    if (!isValid) {
      throw new AppError(401, 'Invalid password. Please check your password and try again.');
    }

    return {
      user: toUserView(userRecord, approvalStatus),
      token: generateAppToken(userRecord),
    };
  }

  // Register a new devotee user account
  async registerUser(input: RegisterUserInput): Promise<AuthResult> {
    const cleanEmail = input.email.trim().toLowerCase();
    const formattedPhone = normalizePhoneNumber(input.phoneNumber);
    const rawPhone = input.phoneNumber.trim();
    const digitsOnly = formattedPhone.replace(/\D/g, '').slice(-10);

    const existing = await db
      .select({
        id: users.id,
        phoneNumber: users.phoneNumber,
        email: users.email,
      })
      .from(users)
      .where(or(
        eq(users.phoneNumber, formattedPhone),
        eq(users.phoneNumber, rawPhone),
        eq(users.phoneNumber, digitsOnly),
        sql`LOWER(${users.email}) = ${cleanEmail}`
      ))
      .limit(1);

    if (existing.length > 0) {
      const match = existing[0];
      if (match.email && match.email.toLowerCase() === cleanEmail) {
        throw new AppError(409, 'An account with this email address is already registered. Please sign in or use another email.');
      }
      throw new AppError(409, 'An account with this phone number is already registered. Please sign in or use another phone number.');
    }

    const userId = randomUUID();
    const passwordHash = await bcrypt.hash(input.password, 10);

    const createdUser = await db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(users)
        .values({
          id: userId,
          name: input.fullName,
          email: input.email,
          phoneNumber: formattedPhone,
          password: passwordHash,
          role: 'USER',
        })
        .returning();

      if (input.address) {
        await tx.insert(addresses).values({
          userId,
          houseNo: input.address.houseNo,
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

    return {
      user: toUserView(createdUser),
      token: generateAppToken(createdUser),
    };
  }

  // Register a new Purohit priest profile application
  async registerPriest(input: RegisterPriestInput): Promise<AuthResult> {
    const formattedPhone = normalizePhoneNumber(input.phoneNumber);
    const rawPhone = input.phoneNumber.trim();
    const digitsOnly = formattedPhone.replace(/\D/g, '').slice(-10);
    const targetEmail = (input.email && input.email.trim())
      ? input.email.trim().toLowerCase()
      : `priest.${formattedPhone.replace('+', '')}@pujacircle.internal`;

    const existing = await db
      .select({
        id: users.id,
        phoneNumber: users.phoneNumber,
        email: users.email,
      })
      .from(users)
      .where(or(
        eq(users.phoneNumber, formattedPhone),
        eq(users.phoneNumber, rawPhone),
        eq(users.phoneNumber, digitsOnly),
        sql`LOWER(${users.email}) = ${targetEmail}`
      ))
      .limit(1);

    if (existing.length > 0) {
      const match = existing[0];
      if (match.email && match.email.toLowerCase() === targetEmail) {
        throw new AppError(409, 'An account with this email address is already registered. Please sign in or use another email.');
      }
      throw new AppError(409, 'A user account with this phone number is already registered. Please sign in or use another phone number.');
    }

    const targetPassword = input.password || `PujaPriest@${randomInt(100000, 999999)}`;

    const userId = randomUUID();
    const passwordHash = await bcrypt.hash(targetPassword, 10);

    const createdUser = await db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(users)
        .values({
          id: userId,
          name: input.fullName,
          email: targetEmail,
          phoneNumber: formattedPhone,
          password: passwordHash,
          role: 'PRIEST',
          avatarUrl: null,
        })
        .returning();

      await tx.insert(priestProfiles).values({
        userId,
        approvalStatus: 'PENDING',
        experienceYears: input.experienceYears || 0,
        bio: input.bio || '',
        languages: input.languages || ['Hindi'],
        serviceAreas: input.serviceAreas || [],
        city: input.city || '',
        state: input.state || '',
        pincode: input.pincode || '',
        profileImageUrl: '',
        rating: '0.00',
        reviewCount: 0,
        defaultStartTime: '07:00:00',
        defaultEndTime: '21:00:00',
      });

      return inserted;
    });

    return {
      user: toUserView(createdUser),
      token: generateAppToken(createdUser),
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

    let approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | undefined;
    if (userRecord.role === 'PRIEST') {
      const [priestProfile] = await db
        .select({
          approvalStatus: priestProfiles.approvalStatus,
          profileImageUrl: priestProfiles.profileImageUrl,
        })
        .from(priestProfiles)
        .where(eq(priestProfiles.userId, userRecord.id))
        .limit(1);
      approvalStatus = priestProfile?.approvalStatus;

      const effectiveAvatar =
        userRecord.avatarUrl ||
        priestProfile?.profileImageUrl ||
        null;

      userRecord.avatarUrl = effectiveAvatar;
    }

    return toUserView(userRecord, approvalStatus);
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

      const passwordHash = await bcrypt.hash(input.newPassword, 10);
      await db.update(users).set({ password: passwordHash }).where(eq(users.id, dbUser.id));
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
      .where(sql`LOWER(${users.email}) = ${cleanEmail}`)
      .limit(1);

    if (!dbUser) {
      throw new AppError(404, 'No active account found for password reset.');
    }

    const passwordHash = await bcrypt.hash(input.newPassword, 10);
    await db.update(users).set({ password: passwordHash }).where(eq(users.id, dbUser.id));

    return {
      message: 'Password updated successfully. You may now sign in with your new credentials.',
    };
  }

  // Invalidate session on logout
  async logout(_token?: string): Promise<{ message: string }> {
    return { message: 'Logged out successfully.' };
  }
}

export const authService = new AuthService();
