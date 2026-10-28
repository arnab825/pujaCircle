import { randomInt } from 'crypto';
import { eq, and, or, desc, inArray, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db } from '../db/index.js';
import { bookings, priestProfiles, priestServices, pujaCatalog, addresses, users } from '../models/index.js';
import { CreateBookingInput, RatingInput } from '../schemas/booking.schema.js';
import { AppError } from '../utils/AppError.js';
import { availabilityService } from './availability.service.js';
import { resolvePriestProfileId } from '../repositories/priest.repository.js';
import { BookingViewModel } from '../views/booking.view.js';
import { getPagination } from '../utils/pagination.js';

function addMinutesToTime(time: string, minutes: number): string {
  const [h = '9', m = '0'] = time.split(':');
  const totalMinutes = parseInt(h, 10) * 60 + parseInt(m, 10) + minutes;
  const hours = Math.floor(totalMinutes / 60) % 24;
  const mins = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export interface BookingFilterOptions {
  userId?: string;
  priestId?: string;
  page?: number;
  limit?: number;
}

// Service managing ceremony reservations, status transitions, completion verification, and devotee reviews
export class BookingService {
  // Format raw database record and joins into consistent BookingViewModel
  private formatBookingResponse(b: any): BookingViewModel {
    return {
      id: b.id,
      bookingReference: b.bookingReference,
      userId: b.userId,
      priestId: b.priestId,
      serviceName: b.serviceName,
      servicePrice: b.servicePrice,
      totalPrice: b.totalPrice,
      bookingDate: b.bookingDate,
      startTime: b.startTime,
      endTime: b.endTime,
      status: b.status,
      paymentStatus: b.paymentStatus,
      specialInstructions: b.specialInstructions,
      completionCode: b.completionCode,
      rejectionReason: b.rejectionReason,
      cancellationReason: b.cancellationReason,
      rating: b.rating,
      review: b.review,
      scheduledDate: b.scheduledDate,
      cancelledAt: b.cancelledAt,
      completedAt: b.completedAt,
      createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: b.updatedAt ? new Date(b.updatedAt).toISOString() : undefined,
      priest: b.priestProfile
        ? {
            id: b.priestProfile.id,
            displayName: b.priestProfile.user?.name || 'Assigned Purohit',
            fullName: b.priestProfile.user?.name || 'Assigned Purohit',
            phoneNumber: b.priestProfile.user?.phoneNumber,
            email: b.priestProfile.user?.email,
            profileImageUrl: b.priestProfile.profileImageUrl,
          }
        : undefined,
      ritual: b.catalog || undefined,
      slot: {
        startTime: b.startTime,
        endTime: b.endTime,
      },
      venueAddressSnapshot: b.address || undefined,
      userName: b.user?.name,
      userPhone: b.user?.phoneNumber,
    };
  }

  // Query bookings with optional devotee and priest filters
  async getBookings(filters: BookingFilterOptions): Promise<BookingViewModel[]> {
    let resolvedPriestId = filters.priestId;
    if (filters.priestId) {
      resolvedPriestId = (await resolvePriestProfileId(filters.priestId)) || filters.priestId;
    }

    const conditions = [];
    if (filters.userId) {
      conditions.push(eq(bookings.userId, filters.userId));
    }
    if (resolvedPriestId) {
      conditions.push(eq(bookings.priestId, resolvedPriestId));
    }

    const whereClause =
      conditions.length === 0
        ? undefined
        : conditions.length === 1
          ? conditions[0]
          : and(...conditions);

    const pagination = filters.page || filters.limit ? getPagination(filters) : undefined;

    const rawBookings = await db.query.bookings.findMany({
      where: whereClause,
      orderBy: [desc(bookings.createdAt)],
      limit: pagination?.limit,
      offset: pagination?.offset,
      with: {
        user: true,
        priestProfile: {
          with: {
            user: true,
          },
        },
        priestService: true,
        catalog: true,
        address: true,
      },
    });

    return rawBookings.map((b) => this.formatBookingResponse(b));
  }

  // Retrieve single booking details by UUID
  async getBookingById(id: string): Promise<BookingViewModel> {
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, id),
      with: {
        user: true,
        priestProfile: {
          with: {
            user: true,
          },
        },
        priestService: true,
        catalog: true,
        address: true,
      },
    });

    if (!booking) {
      throw new AppError(404, `Booking with ID ${id} not found.`);
    }

    return this.formatBookingResponse(booking);
  }

  // Submit a new ceremony reservation request in PENDING state
  async createBooking(userId: string, data: CreateBookingInput): Promise<BookingViewModel> {
    const resolvedPriestId = await resolvePriestProfileId(data.priestId);
    if (!resolvedPriestId) {
      throw new AppError(404, 'Priest profile not found.');
    }

    // Validate venue address
    const [addr] = await db
      .select({ id: addresses.id })
      .from(addresses)
      .where(eq(addresses.id, data.addressId))
      .limit(1);

    if (!addr) {
      throw new AppError(404, 'Ceremony venue address not found.');
    }

    // Generate collision-resistant unique booking reference e.g. PC-2026-X8K9M2
    const bookingReference = `PC-${new Date().getFullYear()}-${nanoid(6).toUpperCase()}`;

    // Lock authoritative price snapshot: servicePrice = priestService.price, totalPrice = servicePrice
    let servicePrice = data.servicePrice || 1001;
    let totalPrice = data.totalPrice || servicePrice;
    let serviceName = data.serviceName || 'Puja Ceremony';
    let resolvedPujaCatalogId = data.pujaCatalogId;

    if (data.priestServiceId) {
      const [service] = await db
        .select()
        .from(priestServices)
        .where(and(eq(priestServices.id, data.priestServiceId), eq(priestServices.priestId, resolvedPriestId)))
        .limit(1);

      if (service) {
        servicePrice = service.price;
        totalPrice = service.price;
        serviceName = service.serviceName;
        if (!resolvedPujaCatalogId && service.pujaCatalogId) {
          resolvedPujaCatalogId = service.pujaCatalogId;
        }
      }
    }

    // If endTime missing: calculate endTime = startTime + pujaCatalog.durationMinutes
    const startTime = data.startTime || '09:00';
    let endTime = data.endTime;

    if (!endTime) {
      let durationMinutes = 120;
      if (resolvedPujaCatalogId) {
        const [catalog] = await db
          .select({ durationMinutes: pujaCatalog.durationMinutes, name: pujaCatalog.name })
          .from(pujaCatalog)
          .where(eq(pujaCatalog.id, resolvedPujaCatalogId))
          .limit(1);

        if (catalog?.durationMinutes) {
          durationMinutes = catalog.durationMinutes;
        }
        if (!serviceName || serviceName === 'Puja Ceremony') {
          serviceName = catalog?.name || serviceName;
        }
      }
      endTime = addMinutesToTime(startTime, durationMinutes);
    }

    // Verify no overlap via availabilityService.checkBookingOverlap
    const hasOverlap = await availabilityService.checkBookingOverlap(
      resolvedPriestId,
      data.bookingDate,
      startTime,
      endTime
    );
    if (hasOverlap) {
      throw new AppError(409, 'The priest already has a confirmed ceremony booking during this time slot.');
    }

    let scheduledDate = new Date(`${data.bookingDate}T${startTime.length === 5 ? startTime : '09:00'}:00`);
    if (isNaN(scheduledDate.getTime())) {
      scheduledDate = new Date();
    }

    const [newBooking] = await db
      .insert(bookings)
      .values({
        bookingReference,
        userId,
        priestId: resolvedPriestId,
        priestServiceId: data.priestServiceId || null,
        pujaCatalogId: resolvedPujaCatalogId || null,
        addressId: data.addressId,
        serviceName,
        servicePrice,
        totalPrice,
        bookingDate: data.bookingDate,
        startTime,
        endTime,
        scheduledDate,
        status: 'PENDING',
        paymentMethod: 'OFFLINE_CASH',
        paymentStatus: 'PENDING',
        specialInstructions: data.specialInstructions || null,
        notes: data.notes || null,
      })
      .returning();

    return this.getBookingById(newBooking.id);
  }

  // Priest accepts a pending ceremony booking (status -> CONFIRMED)
  async acceptBooking(bookingId: string, priestId: string): Promise<BookingViewModel> {
    const resolvedPriestId = (await resolvePriestProfileId(priestId)) || priestId;

    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!booking) {
      throw new AppError(404, `Booking with ID ${bookingId} not found.`);
    }

    if (booking.priestId !== resolvedPriestId) {
      throw new AppError(403, 'You are not authorized to accept this ceremony booking.');
    }

    if (booking.status !== 'PENDING') {
      throw new AppError(400, `Cannot accept booking. Current status is ${booking.status}.`);
    }

    const hasOverlap = await availabilityService.checkBookingOverlap(
      resolvedPriestId,
      booking.bookingDate,
      booking.startTime,
      booking.endTime
    );
    if (hasOverlap) {
      throw new AppError(409, 'Cannot accept booking: you already have a confirmed ceremony during this time slot.');
    }

    // Cryptographically secure 4-digit completion code
    const completionCode = randomInt(1000, 9999).toString();

    await db
      .update(bookings)
      .set({
        status: 'CONFIRMED',
        completionCode,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId));

    return this.getBookingById(bookingId);
  }

  // Priest declines a pending ceremony booking (status -> REJECTED)
  async rejectBooking(bookingId: string, priestId: string, reason?: string): Promise<BookingViewModel> {
    const resolvedPriestId = (await resolvePriestProfileId(priestId)) || priestId;

    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!booking) {
      throw new AppError(404, `Booking with ID ${bookingId} not found.`);
    }

    if (booking.priestId !== resolvedPriestId) {
      throw new AppError(403, 'You are not authorized to decline this ceremony booking.');
    }

    if (booking.status !== 'PENDING') {
      throw new AppError(400, `Cannot reject booking. Current status is ${booking.status}.`);
    }

    await db
      .update(bookings)
      .set({
        status: 'REJECTED',
        rejectionReason: reason || 'Declined by priest due to schedule constraints',
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId));

    return this.getBookingById(bookingId);
  }

  // Devotee or Priest cancels a pending or confirmed booking (status -> CANCELLED)
  async cancelBooking(bookingId: string, actorId: string, reason?: string): Promise<BookingViewModel> {
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!booking) {
      throw new AppError(404, `Booking with ID ${bookingId} not found.`);
    }

    const resolvedPriestId = (await resolvePriestProfileId(actorId)) || actorId;
    const isDevotee = booking.userId === actorId;
    const isPriest = booking.priestId === resolvedPriestId;

    if (!isDevotee && !isPriest) {
      throw new AppError(403, 'You are not authorized to cancel this ceremony booking.');
    }

    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
      throw new AppError(400, `Cannot cancel booking. Current status is ${booking.status}. Only PENDING or CONFIRMED bookings may be cancelled.`);
    }

    const now = new Date();
    await db
      .update(bookings)
      .set({
        status: 'CANCELLED',
        cancelledBy: isDevotee ? 'USER' : 'PRIEST',
        cancellationReason: reason || (isDevotee ? 'Cancelled by devotee' : 'Cancelled by priest'),
        cancelledAt: now,
        updatedAt: now,
      })
      .where(eq(bookings.id, bookingId));

    return this.getBookingById(bookingId);
  }

  // Priest marks ceremony completed after verifying 4-digit devotee completionCode
  async completeBooking(
    bookingId: string,
    priestId: string,
    completionCode?: string
  ): Promise<BookingViewModel> {
    const resolvedPriestId = (await resolvePriestProfileId(priestId)) || priestId;

    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!booking) {
      throw new AppError(404, `Booking with ID ${bookingId} not found.`);
    }

    if (booking.priestId !== resolvedPriestId) {
      throw new AppError(403, 'You are not authorized to complete this ceremony booking.');
    }

    if (booking.status === 'COMPLETED') {
      throw new AppError(400, 'This ceremony is already marked as completed.');
    }
    if (booking.status !== 'CONFIRMED') {
      throw new AppError(
        400,
        `Cannot complete booking. Current status is ${booking.status}. Only confirmed ceremonies can be completed.`
      );
    }

    if (!completionCode || !completionCode.trim()) {
      throw new AppError(400, '4-digit devotee completion verification code is required.');
    }

    if (booking.completionCode && booking.completionCode.trim() !== completionCode.trim()) {
      throw new AppError(400, 'Invalid completion code. Please verify the 4-digit code provided by the devotee.');
    }

    const now = new Date();
    await db
      .update(bookings)
      .set({
        status: 'COMPLETED',
        paymentStatus: 'PAID_OFFLINE',
        completedAt: now,
        updatedAt: now,
      })
      .where(eq(bookings.id, bookingId));

    return this.getBookingById(bookingId);
  }

  // Devotee submits star rating and review feedback for a completed ceremony
  async submitRating(userId: string, data: RatingInput): Promise<any> {
    if (!data.bookingId) {
      throw new AppError(400, 'Booking ID is required to submit a rating.');
    }

    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, data.bookingId))
      .limit(1);

    if (!booking) {
      throw new AppError(404, `Booking with ID ${data.bookingId} not found.`);
    }

    if (booking.userId !== userId) {
      throw new AppError(403, 'You are not authorized to submit a review for this ceremony booking.');
    }

    if (booking.status !== 'COMPLETED') {
      throw new AppError(400, 'Ratings and reviews can only be submitted for completed ceremonies.');
    }

    if (booking.rating !== null && booking.rating !== undefined) {
      throw new AppError(400, 'A review has already been submitted for this ceremony booking.');
    }

    const now = new Date();
    const finalRating = data.rating ?? booking.rating ?? 5;
    const finalReview = data.review !== undefined ? (data.review ? data.review.trim() : null) : booking.review;
    await db
      .update(bookings)
      .set({
        rating: finalRating,
        review: finalReview,
        updatedAt: now,
      })
      .where(eq(bookings.id, data.bookingId));

    // Recompute priest average rating & reviewCount
    const priestCompletedBookings = await db
      .select({ rating: bookings.rating })
      .from(bookings)
      .where(
        and(
          eq(bookings.priestId, booking.priestId),
          eq(bookings.status, 'COMPLETED')
        )
      );

    const validRatings = priestCompletedBookings
      .map((b) => b.rating)
      .filter((r): r is number => typeof r === 'number' && r > 0);

    const reviewCount = validRatings.length;
    const avgRating = reviewCount > 0
      ? validRatings.reduce((acc, curr) => acc + curr, 0) / reviewCount
      : 0;

    await db
      .update(priestProfiles)
      .set({
        rating: avgRating.toFixed(2),
        reviewCount,
        updatedAt: now,
      })
      .where(eq(priestProfiles.id, booking.priestId));

    return {
      bookingId: data.bookingId,
      rating: finalRating,
      review: finalReview,
      priestAverageRating: avgRating.toFixed(2),
      priestReviewCount: reviewCount,
    };
  }

  // Automatically transition stale pending reservations to EXPIRED status
  async expireStalePendingBookings(): Promise<number> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const todayIST = new Date().toISOString().slice(0, 10);

    const staleRecords = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(
          eq(bookings.status, 'PENDING'),
          or(
            sql`${bookings.createdAt} < ${oneDayAgo}`,
            sql`${bookings.bookingDate} < ${todayIST}`
          )
        )
      );

    if (staleRecords.length === 0) {
      return 0;
    }

    const idsToExpire = staleRecords.map((r) => r.id);
    await db
      .update(bookings)
      .set({
        status: 'EXPIRED',
        rejectionReason: 'Reservation request expired automatically after 24 hours without priest confirmation.',
      })
      .where(inArray(bookings.id, idsToExpire));

    return idsToExpire.length;
  }
}

export const bookingService = new BookingService();
