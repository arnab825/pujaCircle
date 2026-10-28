import { count, eq, sql, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users, priestProfiles, bookings } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

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
      db.select({ value: count() }).from(users).where(sql`${users.role} = 'USER' AND ${users.accountStatus} = 'ACTIVE'`),
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

  /**
   * Get all priests joined with user information
   */
  async getAllPriests(): Promise<any[]> {
    const records = await db
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
        profileImageUrl: priestProfiles.profileImageUrl,
        rating: priestProfiles.rating,
        reviewCount: priestProfiles.reviewCount,
        createdAt: priestProfiles.createdAt,
      })
      .from(priestProfiles)
      .innerJoin(users, eq(priestProfiles.userId, users.id));

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
        profileImageUrl: priestProfiles.profileImageUrl,
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

  /**
   * Get all devotee users joined with their booking counts
   */
  async getAllUsers(): Promise<any[]> {
    const records = await db
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

    return records;
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

  // Query platform ceremony bookings with SQL joins and pagination
  async getAllBookings(page = 1, limit = 50): Promise<any[]> {
    const offset = (page - 1) * limit;

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
      .limit(limit)
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
