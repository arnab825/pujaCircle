import { and, eq, ilike, or, gte, sql } from 'drizzle-orm';
import { db } from '@/db/index.js';
import { users, priestProfiles, priestServices, priestAvailabilityExceptions, pujaCatalog, bookings } from '@/models/index.js';
import {
  UpdatePriestProfileInput,
  CreatePriestServiceInput,
  UpdatePriestServiceInput,
  PriestFilterParams,
  UpdatePriestAvailabilityExceptionInput,
  PriestWorkingHoursInput,
} from '@/schemas/priest.schema.js';
import { cloudinaryService } from './cloudinary.service.js';
import { toISTDateString, toISTTimeString } from './availability.service.js';
import { AppError } from '@/utils/AppError.js';
import { resolvePriestProfileId } from '@/repositories/priest.repository.js';
import { PriestViewModel, PriestServiceViewModel } from '@/views/priest.view.js';
import { getPagination } from '@/utils/pagination.js';

// Service managing verified Purohit directory, profile configurations, ritual catalog offerings, and working hours
export class PriestService {
  // Delegate to shared repository for resolving canonical profile UUID
  async resolvePriestProfileId(idOrUserId: string): Promise<string | null> {
    return resolvePriestProfileId(idOrUserId);
  }

  // Search and filter approved priests for devotee catalog listings
  async searchPriests(params?: PriestFilterParams & { page?: number; limit?: number }): Promise<PriestViewModel[]> {
    const conditions = [];

    // Filter by approval status (default: APPROVED)
    if (params?.status && params.status !== 'ALL') {
      conditions.push(eq(priestProfiles.approvalStatus, params.status));
    } else if (!params?.status) {
      conditions.push(eq(priestProfiles.approvalStatus, 'APPROVED'));
    }

    // Filter by account active status (default: ACTIVE)
    if (params?.accountStatus && params.accountStatus !== 'ALL') {
      conditions.push(eq(users.accountStatus, params.accountStatus));
    } else if (!params?.accountStatus) {
      conditions.push(eq(users.accountStatus, 'ACTIVE'));
    }

    // 1. PINCODE-based locality matching
    if (params?.pincode && params.pincode.trim()) {
      const cleanPin = params.pincode.trim().replace(/\D/g, '');
      if (cleanPin.length === 6) {
        conditions.push(
          or(
            eq(priestProfiles.pincode, cleanPin),
            sql`REPLACE(COALESCE(${priestProfiles.pincode}, ''), ' ', '') = ${cleanPin}`,
            sql`${priestProfiles.serviceAreas}::text ILIKE ${'%' + cleanPin + '%'}`
          )!
        );
      }
    }

    // 2. City filter
    if (params?.city && params.city.trim()) {
      const cleanCity = params.city.trim();
      conditions.push(ilike(priestProfiles.city, `%${cleanCity}%`));
    }

    // 3. Language filter
    if (params?.language && params.language.trim() && params.language.toLowerCase() !== 'all') {
      const cleanLang = params.language.trim();
      conditions.push(sql`${priestProfiles.languages}::text ILIKE ${'%' + cleanLang + '%'}`);
    }

    // 4. Minimum Experience filter
    if (params?.minExperience !== undefined && Number(params.minExperience) > 0) {
      conditions.push(gte(priestProfiles.experienceYears, Number(params.minExperience)));
    }

    // 5. Ceremony / Catalog ID filter
    if (params?.catalogId && params.catalogId.trim()) {
      const catId = params.catalogId.trim();
      conditions.push(
        sql`EXISTS (
          SELECT 1 FROM ${priestServices}
          WHERE ${priestServices.priestId} = ${priestProfiles.id}
            AND (
              ${priestServices.pujaCatalogId} = ${catId}::uuid
              OR EXISTS (
                SELECT 1 FROM ${pujaCatalog}
                WHERE ${pujaCatalog.id} = ${catId}::uuid
                  AND (
                    ${priestServices.serviceName} ILIKE ('%' || ${pujaCatalog.name} || '%')
                    OR ${pujaCatalog.name} ILIKE ('%' || ${priestServices.serviceName} || '%')
                  )
              )
            )
            AND ${priestServices.isActive} = true
        )`
      );
    }

    // 6. Service Name filter
    if (params?.serviceName && params.serviceName.trim()) {
      const sName = params.serviceName.trim();
      conditions.push(
        sql`EXISTS (
          SELECT 1 FROM ${priestServices}
          WHERE ${priestServices.priestId} = ${priestProfiles.id}
            AND (
              ${priestServices.serviceName} ILIKE ${'%' + sName + '%'}
              OR ${sName} ILIKE ('%' || ${priestServices.serviceName} || '%')
            )
            AND ${priestServices.isActive} = true
        )`
      );
    }

    // 7. General search query (priest name, bio, city, or service name)
    if (params?.searchQuery && params.searchQuery.trim()) {
      const rawTerm = params.searchQuery.trim();
      const term = `%${rawTerm}%`;
      conditions.push(
        or(
          ilike(users.name, term),
          ilike(priestProfiles.bio, term),
          ilike(priestProfiles.city, term),
          sql`${priestProfiles.serviceAreas}::text ILIKE ${term}`,
          sql`EXISTS (
            SELECT 1 FROM ${priestServices}
            WHERE ${priestServices.priestId} = ${priestProfiles.id}
              AND (
                ${priestServices.serviceName} ILIKE ${term}
                OR ${rawTerm} ILIKE ('%' || ${priestServices.serviceName} || '%')
              )
              AND ${priestServices.isActive} = true
          )`
        )!
      );
    }

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
        completedPujas: sql<number>`COALESCE((
          SELECT COUNT(*)::int
          FROM ${bookings}
          WHERE ${bookings.priestId} = ${priestProfiles.id}
            AND ${bookings.status} = 'COMPLETED'
        ), 0)`.mapWith(Number),
        defaultStartTime: priestProfiles.defaultStartTime,
        defaultEndTime: priestProfiles.defaultEndTime,
        createdAt: priestProfiles.createdAt,
      })
      .from(priestProfiles)
      .innerJoin(users, eq(priestProfiles.userId, users.id))
      .where(and(...conditions));

    if (params?.page || params?.limit) {
      const { limit, offset } = getPagination(params);
      query = query.limit(limit).offset(offset) as any;
    }

    const records = await query;

    return records.map((p) => ({
      ...p,
      isPhoneVerified: true,
      rating: Number(p.rating || 0),
      completedPujas: Number(p.completedPujas || 0),
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
    }));
  }

  // Retrieve a single priest public profile with configured services
  async getPriestById(priestId: string): Promise<PriestViewModel | null> {
    const [record] = await db
      .select({
        id: priestProfiles.id,
        userId: users.id,
        fullName: users.name,
        displayName: users.name,
        phoneNumber: users.phoneNumber,
        email: users.email,
        approvalStatus: priestProfiles.approvalStatus,
        rejectionReason: priestProfiles.rejectionReason,
        accountStatus: users.accountStatus,
        banReason: users.banReason,
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
        completedPujas: sql<number>`COALESCE((
          SELECT COUNT(*)::int
          FROM ${bookings}
          WHERE ${bookings.priestId} = ${priestProfiles.id}
            AND ${bookings.status} = 'COMPLETED'
        ), 0)`.mapWith(Number),
        defaultStartTime: priestProfiles.defaultStartTime,
        defaultEndTime: priestProfiles.defaultEndTime,
        createdAt: priestProfiles.createdAt,
        updatedAt: priestProfiles.updatedAt,
      })
      .from(priestProfiles)
      .innerJoin(users, eq(priestProfiles.userId, users.id))
      .where(or(eq(priestProfiles.id, priestId), eq(priestProfiles.userId, priestId)))
      .limit(1);

    if (!record) return null;

    const services = await db
      .select({
        id: priestServices.id,
        priestId: priestServices.priestId,
        serviceName: priestServices.serviceName,
        pujaCatalogId: priestServices.pujaCatalogId,
        category: priestServices.category,
        samagriList: priestServices.samagriList,
        price: priestServices.price,
        isCustom: priestServices.isCustom,
        isActive: priestServices.isActive,
        durationMinutes: pujaCatalog.durationMinutes,
        createdAt: priestServices.createdAt,
        updatedAt: priestServices.updatedAt,
      })
      .from(priestServices)
      .leftJoin(pujaCatalog, eq(priestServices.pujaCatalogId, pujaCatalog.id))
      .where(eq(priestServices.priestId, record.id));

    return {
      ...record,
      isPhoneVerified: true,
      rating: Number(record.rating || 0),
      completedPujas: Number(record.completedPujas || 0),
      createdAt: record.createdAt ? new Date(record.createdAt).toISOString() : new Date().toISOString(),
      services: services.map((s) => ({
        id: s.id,
        priestId: s.priestId,
        serviceName: s.serviceName,
        price: s.price,
        category: s.category,
        samagriList: s.samagriList,
        isActive: s.isActive,
        isCustom: s.isCustom,
        pujaCatalogId: s.pujaCatalogId,
        durationMinutes: s.durationMinutes,
      })),
    };
  }

  // Retrieve current authenticated priest profile
  async getMyProfile(userId: string): Promise<PriestViewModel | null> {
    return this.getPriestById(userId);
  }

  // Update priest profile credentials, bio, and languages, syncing avatar with Cloudinary + users table
  async updatePriestProfile(id: string, updates: UpdatePriestProfileInput & { fullName?: string; displayName?: string; name?: string }): Promise<PriestViewModel | null> {
    const existing = await this.getPriestById(id);
    if (!existing) {
      throw new AppError(404, 'Priest profile not found.');
    }

    // Destructure profileImageUrl separately so we control its persistence
    const { fullName, displayName, name, profileImageUrl, ...profileUpdates } = updates as any;
    const newName = fullName || displayName || name;
    let finalImageUrl: string | null = null;

    // 1. Handle Cloudinary Upload & Avatar Sync for users + priestProfiles tables
    if (profileImageUrl !== undefined) {
      const oldImageUrl = existing.profileImageUrl || existing.avatarUrl;

      if (typeof profileImageUrl === 'string' && profileImageUrl.trim().length > 0) {
        const trimmed = profileImageUrl.trim();

        // Case A: Base64 Data URI from file picker -> Upload to Cloudinary
        if (trimmed.startsWith('data:image/') || trimmed.startsWith('data:')) {
          try {
            const uploadResult = await cloudinaryService.uploadImage(trimmed, 'pujacircle/priests');
            finalImageUrl = uploadResult.secure_url || uploadResult.url;
          } catch (uploadError: any) {
            console.error('[PriestService] Cloudinary avatar upload failed:', uploadError);
            throw new AppError(500, 'Failed to upload profile picture to cloud storage.');
          }
        }
        // Case B: Already a hosted URL (e.g. from Cloudinary or external)
        else if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
          finalImageUrl = trimmed;
        }

        // Cleanup: Purge previous image from Cloudinary if different
        if (oldImageUrl && oldImageUrl.startsWith('http') && oldImageUrl !== finalImageUrl) {
          await cloudinaryService.deleteImageByUrl(oldImageUrl).catch((err) => {
            console.warn('[PriestService] Failed to clean up previous Cloudinary asset:', err);
          });
        }
      } else {
        // Case C: Photo removed (empty string or null) -> Clean up Cloudinary
        if (oldImageUrl && oldImageUrl.startsWith('http')) {
          await cloudinaryService.deleteImageByUrl(oldImageUrl).catch((err) => {
            console.warn('[PriestService] Failed to clean up previous Cloudinary asset:', err);
          });
        }
        finalImageUrl = null;
      }

      // Sync to priest_profiles table (profile_image_url defaults to empty string)
      profileUpdates.profileImageUrl = finalImageUrl || '';
    }

    // 2. Wrap multi-table database updates in a transaction for atomic integrity
    await db.transaction(async (tx) => {
      // A. Persist priest display name to users table
      if (newName && typeof newName === 'string' && newName.trim()) {
        await tx
          .update(users)
          .set({ name: newName.trim(), updatedAt: new Date() })
          .where(eq(users.id, existing.userId));
      }

      // B. Sync avatar to users table (users.avatar_url is nullable)
      if (profileImageUrl !== undefined) {
        await tx
          .update(users)
          .set({ avatarUrl: finalImageUrl, updatedAt: new Date() })
          .where(eq(users.id, existing.userId));
      }

      // C. Persist other profile fields to priest_profiles table
      await tx
        .update(priestProfiles)
        .set({
          ...profileUpdates,
          updatedAt: new Date(),
        })
        .where(or(eq(priestProfiles.id, id), eq(priestProfiles.userId, id)));
    });

    return this.getPriestById(id);
  }

  // Query all service offerings for a given priest
  async getPriestServices(priestId: string): Promise<PriestServiceViewModel[]> {
    const priest = await this.getPriestById(priestId);
    return priest?.services ?? [];
  }

  // Create a new ritual service offering from the authoritative puja catalog
  async createPriestService(priestId: string, data: CreatePriestServiceInput): Promise<any> {
    const profileId = await resolvePriestProfileId(priestId);

    if (!profileId) {
      throw new AppError(404, `Priest profile not found for ID: ${priestId}`);
    }

    let catalogEntry = null;

    if (data.pujaCatalogId) {
      const [entry] = await db
        .select()
        .from(pujaCatalog)
        .where(eq(pujaCatalog.id, data.pujaCatalogId))
        .limit(1);
      catalogEntry = entry;
    } else if (data.serviceName) {
      const [entry] = await db
        .select()
        .from(pujaCatalog)
        .where(ilike(pujaCatalog.name, data.serviceName.trim()))
        .limit(1);
      catalogEntry = entry;
    }

    if (!catalogEntry) {
      throw new AppError(400, 'Please select a valid ceremony from the sacred puja catalog.');
    }

    const [existing] = await db
      .select({ id: priestServices.id })
      .from(priestServices)
      .where(
        and(
          eq(priestServices.priestId, profileId),
          or(
            eq(priestServices.pujaCatalogId, catalogEntry.id),
            ilike(priestServices.serviceName, catalogEntry.name)
          )
        )
      )
      .limit(1);

    if (existing) {
      throw new AppError(409, `Service "${catalogEntry.name}" has already been added.`);
    }

    const [record] = await db
      .insert(priestServices)
      .values({
        priestId: profileId,
        serviceName: catalogEntry.name,
        pujaCatalogId: catalogEntry.id,
        category: catalogEntry.category || 'General',
        samagriList: catalogEntry.samagriList || [],
        price: data.price,
        isCustom: false,
        isActive: data.isActive ?? true,
      })
      .returning();

    return record;
  }

  // Update service pricing and active status for a priest service
  async updatePriestService(
    priestId: string,
    serviceId: string,
    data: UpdatePriestServiceInput
  ): Promise<any> {
    const profileId = await resolvePriestProfileId(priestId);

    if (!profileId) {
      throw new AppError(404, `Priest profile not found for ID: ${priestId}`);
    }

    const [currentService] = await db
      .select()
      .from(priestServices)
      .where(and(eq(priestServices.id, serviceId), eq(priestServices.priestId, profileId)))
      .limit(1);

    if (!currentService) {
      throw new AppError(404, `Service not found for ID: ${serviceId}`);
    }

    if (data.serviceName) {
      const normalizedName = data.serviceName.trim();
      if (normalizedName.toLowerCase() !== currentService.serviceName.toLowerCase()) {
        const [duplicate] = await db
          .select({ id: priestServices.id })
          .from(priestServices)
          .where(
            and(
              eq(priestServices.priestId, profileId),
              ilike(priestServices.serviceName, normalizedName)
            )
          )
          .limit(1);

        if (duplicate) {
          throw new AppError(409, `Another service named "${data.serviceName}" already exists.`);
        }
      }
    }

    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (data.serviceName !== undefined) updateData.serviceName = data.serviceName.trim();
    if (data.price !== undefined) updateData.price = data.price;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.samagriList !== undefined) updateData.samagriList = data.samagriList;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const [updated] = await db
      .update(priestServices)
      .set(updateData)
      .where(and(eq(priestServices.id, serviceId), eq(priestServices.priestId, profileId)))
      .returning();

    return updated;
  }

  // Remove a service offering from a priest roster
  async deletePriestService(priestId: string, serviceId: string): Promise<void> {
    const profileId = await resolvePriestProfileId(priestId);
    const targetPriestId = profileId || priestId;

    // Disassociate existing bookings referencing this service to avoid FK constraint violation
    await db
      .update(bookings)
      .set({ priestServiceId: null })
      .where(eq(bookings.priestServiceId, serviceId));

    const [deleted] = await db
      .delete(priestServices)
      .where(and(eq(priestServices.id, serviceId), eq(priestServices.priestId, targetPriestId)))
      .returning();

    if (!deleted) {
      throw new AppError(404, 'Service offering not found or you are not authorized to remove it.');
    }
  }

  // Toggle service active/inactive status for bookings
  async togglePriestService(priestId: string, serviceId: string): Promise<any> {
    const profileId = await resolvePriestProfileId(priestId);
    const targetPriestId = profileId || priestId;

    const [existing] = await db
      .select({ id: priestServices.id, isActive: priestServices.isActive })
      .from(priestServices)
      .where(and(eq(priestServices.id, serviceId), eq(priestServices.priestId, targetPriestId)))
      .limit(1);

    if (!existing) {
      throw new AppError(404, `Service not found for ID: ${serviceId}`);
    }

    const [updated] = await db
      .update(priestServices)
      .set({ isActive: !existing.isActive, updatedAt: new Date() })
      .where(eq(priestServices.id, serviceId))
      .returning();

    return updated;
  }

  // Query all availability exceptions (full-day leaves, partial blackouts) for a priest
  async getPriestExceptions(
    priestId: string,
    _query?: { startDate?: string; endDate?: string; date?: string }
  ): Promise<any[]> {
    const profileId = await resolvePriestProfileId(priestId);
    const targetPriestId = profileId || priestId;

    const rows = await db
      .select()
      .from(priestAvailabilityExceptions)
      .where(eq(priestAvailabilityExceptions.priestId, targetPriestId));

    return rows.map((r) => {
      const start = new Date(r.startAt);
      const end = new Date(r.endAt);
      const dateStr = toISTDateString(start);
      const startH = toISTTimeString(start);
      const endH = toISTTimeString(end);
      const isFullLeave = (r.isFullDay || r.reason?.includes('Full Day') || (startH === '07:00' && endH === '21:00') || (startH === '00:00' && endH === '23:59'));

      return {
        id: r.id,
        priestId: r.priestId,
        date: dateStr,
        type: isFullLeave ? 'FULL_DAY_LEAVE' : (r.exceptionType === 'CUSTOM_HOURS' ? 'CUSTOM_HOURS' : 'PARTIAL_BLACKOUT'),
        startTime: startH,
        endTime: endH,
        exceptionType: r.exceptionType,
        startAt: r.startAt ? new Date(r.startAt).toISOString() : '',
        endAt: r.endAt ? new Date(r.endAt).toISOString() : '',
        reason: r.reason || '',
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      };
    });
  }

  // Update an existing availability exception owned by this priest
  async updatePriestException(
    priestId: string,
    exceptionId: string,
    data: UpdatePriestAvailabilityExceptionInput
  ): Promise<any> {
    const profileId = await resolvePriestProfileId(priestId);
    if (!profileId) throw new AppError(404, 'Priest profile not found.');

    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (data.startAt) updateData.startAt = new Date(data.startAt);
    if (data.endAt) updateData.endAt = new Date(data.endAt);
    if (data.exceptionType) updateData.exceptionType = data.exceptionType;
    if (data.reason !== undefined) updateData.reason = data.reason;

    const [updated] = await db
      .update(priestAvailabilityExceptions)
      .set(updateData)
      .where(
        and(
          eq(priestAvailabilityExceptions.id, exceptionId),
          eq(priestAvailabilityExceptions.priestId, profileId)
        )
      )
      .returning();

    if (!updated) {
      throw new AppError(404, 'Availability exception not found or access denied.');
    }

    return updated;
  }

  // Delete an availability exception owned by this priest
  async deletePriestException(priestId: string, exceptionId: string): Promise<void> {
    const profileId = await resolvePriestProfileId(priestId);
    if (!profileId) throw new AppError(404, 'Priest profile not found.');

    const [deleted] = await db
      .delete(priestAvailabilityExceptions)
      .where(
        and(
          eq(priestAvailabilityExceptions.id, exceptionId),
          eq(priestAvailabilityExceptions.priestId, profileId)
        )
      )
      .returning();

    if (!deleted) {
      throw new AppError(404, 'Availability exception not found or access denied.');
    }
  }

  // Retrieve default working hours window for a priest
  async getWorkingHours(priestId: string): Promise<any> {
    const profileId = await resolvePriestProfileId(priestId);
    const targetPriestId = profileId || priestId;

    const [profile] = await db
      .select({
        defaultStartTime: priestProfiles.defaultStartTime,
        defaultEndTime: priestProfiles.defaultEndTime,
      })
      .from(priestProfiles)
      .where(eq(priestProfiles.id, targetPriestId))
      .limit(1);

    return {
      defaultStartTime: profile?.defaultStartTime || '07:00',
      defaultEndTime: profile?.defaultEndTime || '21:00',
    };
  }

  // Update default working hours window for a priest
  async updateWorkingHours(
    priestId: string,
    data: PriestWorkingHoursInput
  ): Promise<any> {
    const profileId = await resolvePriestProfileId(priestId);
    const targetPriestId = profileId || priestId;

    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (data.defaultStartTime !== undefined) {
      updateData.defaultStartTime = data.defaultStartTime;
    }
    if (data.defaultEndTime !== undefined) {
      updateData.defaultEndTime = data.defaultEndTime;
    }

    const [updated] = await db
      .update(priestProfiles)
      .set(updateData)
      .where(eq(priestProfiles.id, targetPriestId))
      .returning({
        defaultStartTime: priestProfiles.defaultStartTime,
        defaultEndTime: priestProfiles.defaultEndTime,
      });

    return updated || {
      defaultStartTime: data.defaultStartTime,
      defaultEndTime: data.defaultEndTime,
    };
  }
}

export const priestService = new PriestService();
