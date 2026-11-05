import { count, eq, sql, desc, and, or, inArray } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db } from '../db/index.js';
import { users, priestProfiles, bookings, addresses } from '../models/index.js';
import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';
import { getPagination } from '../utils/pagination.js';

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalPriests: number;
  approvedPriests: number;
  pendingPriests: number;
  totalBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  revenueEstimate: number;
}

/**
 * [SERVICE] Admin Service
 * Handles platform KPIs, priest approval lifecycle, user moderation, and booking monitoring.
 */
export class AdminService {
  /**
   * Aggregate platform KPIs and statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const [
      [userStats],
      [activeUserStats],
      [priestStats],
      [approvedPriestStats],
      [pendingPriestStats],
      [bookingStats],
      [confirmedBookingStats],
      [completedBookingStats],
      [revenueStats],
    ] = await Promise.all([
      db.select({ value: count() }).from(users).where(eq(users.role, 'USER')),
      db.select({ value: count() }).from(users).where(and(eq(users.role, 'USER'), eq(users.accountStatus, 'ACTIVE'))),
      db.select({ value: count() }).from(priestProfiles),
      db.select({ value: count() }).from(priestProfiles).where(eq(priestProfiles.approvalStatus, 'APPROVED')),
      db.select({ value: count() }).from(priestProfiles).where(eq(priestProfiles.approvalStatus, 'PENDING')),
      db.select({ value: count() }).from(bookings),
      db.select({ value: count() }).from(bookings).where(eq(bookings.status, 'CONFIRMED')),
      db.select({ value: count() }).from(bookings).where(eq(bookings.status, 'COMPLETED')),
      db.select({ total: sql<number>`COALESCE(SUM(${bookings.totalPrice}), 0)` }).from(bookings).where(eq(bookings.status, 'COMPLETED')),
    ]);

    return {
      totalUsers: Number(userStats?.value ?? 0),
      activeUsers: Number(activeUserStats?.value ?? 0),
      totalPriests: Number(priestStats?.value ?? 0),
      approvedPriests: Number(approvedPriestStats?.value ?? 0),
      pendingPriests: Number(pendingPriestStats?.value ?? 0),
      totalBookings: Number(bookingStats?.value ?? 0),
      confirmedBookings: Number(confirmedBookingStats?.value ?? 0),
      completedBookings: Number(completedBookingStats?.value ?? 0),
      revenueEstimate: Number(revenueStats?.total ?? 0),
    };
  }

  // Get all priests joined with user information with optional pagination
  async getAllPriests(pagination?: { page?: number; limit?: number }): Promise<any[]> {
    let query = db
      .select({
        id: priestProfiles.id,
        userId: users.id,
        fullName: users.name,
        displayName: users.name,
        phoneNumber: users.phoneNumber,
        email: users.email,
        approvalStatus: priestProfiles.approvalStatus,
        accountStatus: users.accountStatus,
        banReason: users.banReason,
        rejectionReason: priestProfiles.rejectionReason,
        experienceYears: priestProfiles.experienceYears,
        bio: priestProfiles.bio,
        languages: priestProfiles.languages,
        specializations: priestProfiles.specializations,
        serviceAreas: priestProfiles.serviceAreas,
        city: priestProfiles.city,
        state: priestProfiles.state,
        profileImageUrl: sql<string | null>`NULLIF(${priestProfiles.profileImageUrl}, '')`,
        avatarUrl: sql<string | null>`COALESCE(NULLIF(${users.avatarUrl}, ''), NULLIF(${priestProfiles.profileImageUrl}, ''))`,
        rating: priestProfiles.rating,
        reviewCount: priestProfiles.reviewCount,
        createdAt: priestProfiles.createdAt,
      })
      .from(priestProfiles)
      .innerJoin(users, eq(priestProfiles.userId, users.id));

    if (pagination?.page || pagination?.limit) {
      const { limit, offset } = getPagination(pagination);
      query = query.limit(limit).offset(offset) as any;
    }

    const records = await query;

    return records.map((p) => ({
      ...p,
      isPhoneVerified: true,
      rating: Number(p.rating || 0),
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
    }));
  }

  // Query pending priest registration applications directly from database
  async getPendingPriests(): Promise<any[]> {
    const records = await db
      .select({
        id: priestProfiles.id,
        userId: users.id,
        fullName: users.name,
        phoneNumber: users.phoneNumber,
        email: users.email,
        approvalStatus: priestProfiles.approvalStatus,
        accountStatus: users.accountStatus,
        experienceYears: priestProfiles.experienceYears,
        bio: priestProfiles.bio,
        languages: priestProfiles.languages,
        specializations: priestProfiles.specializations,
        serviceAreas: priestProfiles.serviceAreas,
        city: priestProfiles.city,
        state: priestProfiles.state,
        pincode: priestProfiles.pincode,
        profileImageUrl: sql<string | null>`NULLIF(${priestProfiles.profileImageUrl}, '')`,
        avatarUrl: sql<string | null>`COALESCE(NULLIF(${users.avatarUrl}, ''), NULLIF(${priestProfiles.profileImageUrl}, ''))`,
        rating: priestProfiles.rating,
        reviewCount: priestProfiles.reviewCount,
        defaultStartTime: priestProfiles.defaultStartTime,
        defaultEndTime: priestProfiles.defaultEndTime,
        createdAt: priestProfiles.createdAt,
      })
      .from(priestProfiles)
      .innerJoin(users, eq(priestProfiles.userId, users.id))
      .where(eq(priestProfiles.approvalStatus, 'PENDING'));

    return records.map((p) => ({
      ...p,
      isPhoneVerified: true,
      rating: Number(p.rating || 0),
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
    }));
  }

  /**
   * Approve a pending priest onboarding application
   */
  async approvePriest(priestId: string): Promise<void> {
    await db
      .update(priestProfiles)
      .set({ approvalStatus: 'APPROVED', rejectionReason: null })
      .where(eq(priestProfiles.id, priestId));
  }

  /**
   * Reject a pending priest onboarding application with an audit reason
   */
  async rejectPriest(priestId: string, reason?: string): Promise<void> {
    await db
      .update(priestProfiles)
      .set({
        approvalStatus: 'REJECTED',
        rejectionReason: reason || 'Application declined by administrator',
      })
      .where(eq(priestProfiles.id, priestId));
  }

  /**
   * Reopen a rejected priest application for reconsideration
   */
  async reopenPriestApplication(priestId: string): Promise<void> {
    await db
      .update(priestProfiles)
      .set({ approvalStatus: 'PENDING', rejectionReason: null })
      .where(eq(priestProfiles.id, priestId));
  }

  /**
   * Ban priest account by priestProfile id
   */
  async banPriest(priestId: string, reason?: string): Promise<void> {
    const [priest] = await db
      .select({ userId: priestProfiles.userId })
      .from(priestProfiles)
      .where(eq(priestProfiles.id, priestId))
      .limit(1);

    if (!priest) {
      throw new AppError(404, 'Priest record not found.');
    }

    await db
      .update(users)
      .set({
        accountStatus: 'BANNED',
        banReason: reason || 'Suspended by administrator',
      })
      .where(eq(users.id, priest.userId));
  }

  /**
   * Reactivate / Unban priest account by priestProfile id
   */
  async unbanPriest(priestId: string): Promise<void> {
    const [priest] = await db
      .select({ userId: priestProfiles.userId })
      .from(priestProfiles)
      .where(eq(priestProfiles.id, priestId))
      .limit(1);

    if (!priest) {
      throw new AppError(404, 'Priest record not found.');
    }

    await db
      .update(users)
      .set({
        accountStatus: 'ACTIVE',
        banReason: null,
      })
      .where(eq(users.id, priest.userId));
  }

  // Get all devotee users joined with their booking counts and optional pagination
  async getAllUsers(pagination?: { page?: number; limit?: number }): Promise<any[]> {
    let query = db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phoneNumber: users.phoneNumber,
        role: users.role,
        accountStatus: users.accountStatus,
        banReason: users.banReason,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
        bookingCount: sql<number>`cast(count(${bookings.id}) as int)`,
      })
      .from(users)
      .leftJoin(bookings, eq(users.id, bookings.userId))
      .where(eq(users.role, 'USER'))
      .groupBy(users.id);

    if (pagination?.page || pagination?.limit) {
      const { limit, offset } = getPagination(pagination);
      query = query.limit(limit).offset(offset) as any;
    }

    return await query;
  }

  /**
   * Get single devotee user profile with registered addresses and booking history
   */
  async getUserById(userId: string): Promise<any> {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phoneNumber: users.phoneNumber,
        role: users.role,
        accountStatus: users.accountStatus,
        banReason: users.banReason,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new AppError(404, 'Devotee user not found.');
    }

    const userAddresses = await db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, userId))
      .orderBy(desc(addresses.isDefault), desc(addresses.createdAt));

    const priestUser = alias(users, 'priest_user');
    const userBookings = await db
      .select({
        id: bookings.id,
        bookingReference: bookings.bookingReference,
        serviceName: bookings.serviceName,
        servicePrice: bookings.servicePrice,
        totalPrice: bookings.totalPrice,
        scheduledDate: bookings.scheduledDate,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        status: bookings.status,
        paymentMethod: bookings.paymentMethod,
        specialInstructions: bookings.specialInstructions,
        completionCode: bookings.completionCode,
        createdAt: bookings.createdAt,
        priestId: bookings.priestId,
        priestName: priestUser.name,
        priestPhone: priestUser.phoneNumber,
      })
      .from(bookings)
      .leftJoin(priestProfiles, eq(bookings.priestId, priestProfiles.id))
      .leftJoin(priestUser, eq(priestProfiles.userId, priestUser.id))
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt));

    return {
      ...user,
      createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
      addresses: userAddresses,
      bookings: userBookings.map((b) => ({
        ...b,
        createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString(),
      })),
      bookingCount: userBookings.length,
    };
  }

  /**
   * Suspend a devotee user specifically
   */
  async suspendUser(userId: string, reason?: string): Promise<void> {
    await db
      .update(users)
      .set({
        accountStatus: 'BANNED',
        banReason: reason || 'Suspended by administrator',
      })
      .where(eq(users.id, userId));
  }

  /**
   * Unsuspend / Reactivate a devotee user
   */
  async unsuspendUser(userId: string): Promise<void> {
    await db
      .update(users)
      .set({
        accountStatus: 'ACTIVE',
        banReason: null,
      })
      .where(eq(users.id, userId));
  }

  /**
   * Delete a devotee user account permanently.
   * Associated bookings have their user_id disassociated to null,
   * preserving booking financial and schedule audit history.
   */
  async deleteUser(userId: string, currentAdminId?: string): Promise<void> {
    if (currentAdminId && userId === currentAdminId) {
      throw new AppError(400, 'Security violation: Cannot delete the currently logged-in administrator account.');
    }

    const [user] = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new AppError(404, 'User record not found.');
    }

    if (user.role === 'PRIEST') {
      return this.deletePriest(userId, currentAdminId);
    }

    if (user.role !== 'USER') {
      throw new AppError(400, 'Only devotee accounts can be deleted through this endpoint.');
    }

    // Find all address IDs belonging to this user
    const userAddresses = await db
      .select({ id: addresses.id })
      .from(addresses)
      .where(eq(addresses.userId, userId));
    const addressIds = userAddresses.map((a) => a.id);

    // Disassociate bookings from this user and this user's addresses to preserve booking financial/audit history
    await db
      .update(bookings)
      .set({ userId: null, addressId: null })
      .where(eq(bookings.userId, userId));

    if (addressIds.length > 0) {
      await db
        .update(bookings)
        .set({ addressId: null })
        .where(inArray(bookings.addressId, addressIds));
    }

    // Delete corresponding Supabase Authentication account so the user cannot log in
    // and the same email address can be registered again if needed
    await supabaseAdmin.auth.admin.deleteUser(userId).catch((err) => {
      console.warn('Supabase auth user delete notice:', err?.message || err);
    });

    // Delete user from application users table (cascades cleanly to addresses)
    await db.delete(users).where(eq(users.id, userId));
  }

  /**
   * Delete a priest profile and associated user account.
   * Accepts priestProfiles.id or linked userId.
   * Associated bookings have their priest_id disassociated to null, preserving booking history.
   */
  async deletePriest(priestId: string, currentAdminId?: string): Promise<void> {
    const [priest] = await db
      .select({ id: priestProfiles.id, userId: priestProfiles.userId })
      .from(priestProfiles)
      .where(or(eq(priestProfiles.id, priestId), eq(priestProfiles.userId, priestId)))
      .limit(1);

    if (!priest) {
      throw new AppError(404, 'Priest record not found.');
    }

    if (currentAdminId && priest.userId === currentAdminId) {
      throw new AppError(400, 'Security violation: Cannot delete your own administrator account.');
    }

    // Disassociate bookings from this priest to preserve booking history
    await db
      .update(bookings)
      .set({ priestId: null, priestServiceId: null })
      .where(eq(bookings.priestId, priest.id));

    // Delete corresponding Supabase Authentication account for the priest
    await supabaseAdmin.auth.admin.deleteUser(priest.userId).catch((err) => {
      console.warn('Supabase auth priest delete notice:', err?.message || err);
    });

    // Delete priestProfile (cascades to priest_services and priest_availability_exceptions)
    await db.delete(priestProfiles).where(eq(priestProfiles.id, priest.id));

    // Delete the linked user account
    await db.delete(users).where(eq(users.id, priest.userId));
  }

  /**
   * Update admin display name and/or avatar in the users table
   */
  async updateAdminProfile(
    userId: string,
    dataOrName: string | { name?: string; avatarUrl?: string | null }
  ): Promise<{ id: string; name: string; avatarUrl: string | null }> {
    const data = typeof dataOrName === 'string' ? { name: dataOrName } : dataOrName;
    const updateData: Record<string, any> = { updatedAt: new Date() };

    if (data.name !== undefined) {
      const trimmedName = data.name.trim();
      if (!trimmedName || trimmedName.length < 2) {
        throw new AppError(400, 'Name must be at least 2 characters long.');
      }
      updateData.name = trimmedName;
    }

    if (data.avatarUrl !== undefined) {
      updateData.avatarUrl = data.avatarUrl;
    }

    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning({ id: users.id, name: users.name, avatarUrl: users.avatarUrl });

    if (!updated) {
      throw new AppError(404, 'Admin user record not found.');
    }

    return updated;
  }

  // Query platform ceremony bookings with SQL joins and pagination
  async getAllBookings(page = 1, limit = 50): Promise<any[]> {
    const { limit: safeLimit, offset } = getPagination({ page, limit }, 50, 100);

    const results = await db
      .select({
        id: bookings.id,
        bookingReference: bookings.bookingReference,
        userId: bookings.userId,
        priestId: bookings.priestId,
        priestServiceId: bookings.priestServiceId,
        pujaCatalogId: bookings.pujaCatalogId,
        addressId: bookings.addressId,
        serviceName: bookings.serviceName,
        servicePrice: bookings.servicePrice,
        totalPrice: bookings.totalPrice,
        bookingDate: bookings.bookingDate,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        scheduledDate: bookings.scheduledDate,
        status: bookings.status,
        paymentMethod: bookings.paymentMethod,
        paymentStatus: bookings.paymentStatus,
        specialInstructions: bookings.specialInstructions,
        notes: bookings.notes,
        completionCode: bookings.completionCode,
        rejectionReason: bookings.rejectionReason,
        cancellationReason: bookings.cancellationReason,
        cancelledBy: bookings.cancelledBy,
        cancelledAt: bookings.cancelledAt,
        completedAt: bookings.completedAt,
        rating: bookings.rating,
        review: bookings.review,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        userName: users.name,
        userPhone: users.phoneNumber,
        userEmail: users.email,
      })
      .from(bookings)
      .leftJoin(users, eq(bookings.userId, users.id))
      .leftJoin(priestProfiles, eq(bookings.priestId, priestProfiles.id))
      .orderBy(desc(bookings.createdAt))
      .limit(safeLimit)
      .offset(offset);

    return results.map((b) => ({
      ...b,
      userName: b.userName || 'Devotee',
      userPhone: b.userPhone || '',
      createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: b.updatedAt ? new Date(b.updatedAt).toISOString() : undefined,
      cancelledAt: b.cancelledAt ? new Date(b.cancelledAt).toISOString() : undefined,
      completedAt: b.completedAt ? new Date(b.completedAt).toISOString() : undefined,
      user: b.userId
        ? {
            id: b.userId,
            name: b.userName || 'Devotee',
            phoneNumber: b.userPhone || '',
            email: b.userEmail || '',
          }
        : undefined,
    }));
  }
}

export const adminService = new AdminService();
