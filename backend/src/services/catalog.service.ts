import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { pujaCatalog, NewPujaCatalog } from '../models/catalog.model.js';
import { cloudinaryService } from './cloudinary.service.js';

/**
 * [SERVICE] Catalog Service
 * Handles sacred puja catalog listings, ceremony details, and administration.
 */
export class CatalogService {
  /**
   * Get all active sacred ceremonies for catalog
   */
  async getCatalog(_category?: string, _query?: string) {
    const entries = await db
      .select()
      .from(pujaCatalog);

    return entries.map((e) => ({
      ...e,
      coverImage: e.coverImage || '/images/hero_vedic_puja.jpg',
    }));
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
      coverImage: entry.coverImage || '/images/hero_vedic_puja.jpg',
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
      await cloudinaryService.deleteImageByUrl(existing.coverImage);
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
   * Automatically purges its associated cover image from Cloudinary.
   */
  async deleteCatalogEntry(id: string): Promise<void> {
    const [existing] = await db
      .select()
      .from(pujaCatalog)
      .where(eq(pujaCatalog.id, id));

    if (existing) {
      if (existing.coverImage) {
        await cloudinaryService.deleteImageByUrl(existing.coverImage);
      }
      await db
        .delete(pujaCatalog)
        .where(eq(pujaCatalog.id, id));
    }
  }
}

export const catalogService = new CatalogService();
