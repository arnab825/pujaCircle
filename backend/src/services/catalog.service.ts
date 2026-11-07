import { and, eq, ilike, inArray, or, sql } from 'drizzle-orm';
import { db } from '@/db/index.js';
import { pujaCatalog, NewPujaCatalog } from '@/models/catalog.model.js';
import { priestServices, priestProfiles, users, bookings } from '@/models/index.js';
import { cloudinaryService } from './cloudinary.service.js';
import { AppError } from '@/utils/AppError.js';

/**
 * [SERVICE] Catalog Service
 * Handles sacred puja catalog listings, ceremony details, and administration.
 */
export class CatalogService {
  /**
   * Get all active sacred ceremonies for catalog with optional category, search query,
   * and withPriestsOnly filters (to only return ceremonies with approved, active priests).
   */
  async getCatalog(category?: string, query?: string, withPriestsOnly = false) {
    const conditions = [];
    if (category) {
      conditions.push(eq(pujaCatalog.category, category));
    }
    if (query) {
      conditions.push(ilike(pujaCatalog.name, `%${query}%`));
    }

    const entries = await db
      .select({
        id: pujaCatalog.id,
        name: pujaCatalog.name,
        deity: pujaCatalog.deity,
        description: pujaCatalog.description,
        category: pujaCatalog.category,
        durationMinutes: pujaCatalog.durationMinutes,
        intentTags: pujaCatalog.intentTags,
        samagriList: pujaCatalog.samagriList,
        steps: pujaCatalog.steps,
        timingNote: pujaCatalog.timingNote,
        coverImage: pujaCatalog.coverImage,
        isActive: pujaCatalog.isActive,
        createdAt: pujaCatalog.createdAt,
        updatedAt: pujaCatalog.updatedAt,
        priestCount: sql<number>`CAST(COUNT(DISTINCT ${priestProfiles.id}) FILTER (
          WHERE ${priestServices.id} IS NOT NULL 
            AND ${priestServices.isActive} = true 
            AND ${priestProfiles.approvalStatus} = 'APPROVED'
            AND ${users.accountStatus} = 'ACTIVE'
        ) AS INTEGER)`,
        startingPrice: sql<number | null>`MIN(${priestServices.price}) FILTER (
          WHERE ${priestServices.id} IS NOT NULL 
            AND ${priestServices.isActive} = true 
            AND ${priestProfiles.approvalStatus} = 'APPROVED'
            AND ${users.accountStatus} = 'ACTIVE'
        )`,
      })
      .from(pujaCatalog)
      .leftJoin(
        priestServices,
        or(
          eq(priestServices.pujaCatalogId, pujaCatalog.id),
          ilike(priestServices.serviceName, sql`'%' || ${pujaCatalog.name} || '%'`),
          ilike(pujaCatalog.name, sql`'%' || ${priestServices.serviceName} || '%'`)
        )
      )
      .leftJoin(priestProfiles, eq(priestServices.priestId, priestProfiles.id))
      .leftJoin(users, eq(priestProfiles.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(pujaCatalog.id);

    let mapped = entries.map((e) => ({
      ...e,
      priestCount: Number(e.priestCount || 0),
      startingPrice: e.startingPrice !== null ? Number(e.startingPrice) : null,
      coverImage: e.coverImage || '/images/hero_vedic_puja.webp',
    }));

    if (withPriestsOnly) {
      mapped = mapped.filter((e) => e.priestCount > 0);
    }

    return mapped;
  }

  /**
   * Query a single sacred ceremony from catalog by ID
   */
  async getCatalogById(id: string): Promise<any> {
    const [entry] = await db
      .select()
      .from(pujaCatalog)
      .where(eq(pujaCatalog.id, id));

    if (!entry) return null;

    return {
      ...entry,
      coverImage: entry.coverImage || '/images/hero_vedic_puja.webp',
    };
  }

  /**
   * Insert a new sacred ceremony into the catalog
   */
  async createCatalogEntry(data: NewPujaCatalog) {
    const [entry] = await db
      .insert(pujaCatalog)
      .values({
        name: data.name,
        deity: data.deity,
        category: data.category,
        description: data.description,
        intentTags: data.intentTags || [],
        samagriList: data.samagriList || [],
        steps: data.steps || [],
        timingNote: data.timingNote || '',
        durationMinutes: data.durationMinutes,
        coverImage: data.coverImage,
        isActive: data.isActive ?? true,
      })
      .returning();

    return entry;
  }

  /**
   * Update a sacred ceremony in the catalog by ID.
   * If the coverImage is updated, automatically purges the old image from Cloudinary.
   */
  async updateCatalogEntry(id: string, data: Partial<NewPujaCatalog>): Promise<any> {
    const [existing] = await db
      .select()
      .from(pujaCatalog)
      .where(eq(pujaCatalog.id, id));

    if (!existing) return null;

    // Purge old cover image from Cloudinary if replacing with a new one or removing it
    if (
      existing.coverImage &&
      data.coverImage !== undefined &&
      data.coverImage !== existing.coverImage
    ) {
      await cloudinaryService.deleteImageByUrl(existing.coverImage).catch(() => {});
    }

    const [updated] = await db
      .update(pujaCatalog)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(pujaCatalog.id, id))
      .returning();

    return updated;
  }

  /**
   * Delete a sacred ceremony in the catalog by ID.
   * Disassociates priestServices and bookings to preserve historical booking information.
   * Automatically purges its associated cover image from Cloudinary.
   */
  async deleteCatalogEntry(id: string): Promise<void> {
    const [existing] = await db
      .select()
      .from(pujaCatalog)
      .where(eq(pujaCatalog.id, id));

    if (!existing) {
      throw new AppError(404, 'Catalog ceremony entry not found.');
    }

    // Find all priest services linked to this catalog ceremony
    const linkedServices = await db
      .select({ id: priestServices.id })
      .from(priestServices)
      .where(eq(priestServices.pujaCatalogId, id));

    const linkedServiceIds = linkedServices.map((s) => s.id);

    // Disassociate bookings referencing this catalog item or its priest services
    // to preserve historical booking information, payments, and audit logs
    if (linkedServiceIds.length > 0) {
      await db
        .update(bookings)
        .set({ priestServiceId: null, pujaCatalogId: null })
        .where(
          or(
            inArray(bookings.priestServiceId, linkedServiceIds),
            eq(bookings.pujaCatalogId, id)
          )
        );
    } else {
      await db
        .update(bookings)
        .set({ pujaCatalogId: null })
        .where(eq(bookings.pujaCatalogId, id));
    }

    // Delete all priest services offering this catalog puja
    await db
      .delete(priestServices)
      .where(eq(priestServices.pujaCatalogId, id));

    // Delete catalog entry from database
    await db
      .delete(pujaCatalog)
      .where(eq(pujaCatalog.id, id));

    // Purge associated cover image if present on Cloudinary
    if (existing.coverImage) {
      await cloudinaryService.deleteImageByUrl(existing.coverImage).catch(() => {});
    }
  }
}

export const catalogService = new CatalogService();
