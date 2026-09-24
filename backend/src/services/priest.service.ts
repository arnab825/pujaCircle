import { eq, or, and, asc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users, priestProfiles, priestServices, priestSlots } from '../models/index.js';
import {
  UpdatePriestProfileInput,
  CreatePriestServiceInput,
  UpdatePriestServiceInput,
  CreatePriestSlotInput,
  PriestFilterParams,
} from '../schemas/priest.schema.js';

/**
 * [SERVICE] Priest Service
 * Handles verified purohit directory, profile configuration, service pricing, and calendar slots.
 */
export class PriestService {
  /**
   * Search and filter verified priests for devotee catalog listings
   */
  async searchPriests(_params?: PriestFilterParams): Promise<any[]> {
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

  /**
   * Retrieve a single priest public profile by ID
   */
  async getPriestById(priestId: string): Promise<any> {
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
        profileImageUrl: priestProfiles.profileImageUrl,
        rating: priestProfiles.rating,
        reviewCount: priestProfiles.reviewCount,
        createdAt: priestProfiles.createdAt,
        updatedAt: priestProfiles.updatedAt,
      })
      .from(priestProfiles)
      .innerJoin(users, eq(priestProfiles.userId, users.id))
      .where(or(eq(priestProfiles.id, priestId), eq(priestProfiles.userId, priestId)))
      .limit(1);

    if (!record) return null;

    const services = await db
      .select()
      .from(priestServices)
      .where(eq(priestServices.priestId, record.id));

    return {
      ...record,
      isPhoneVerified: true,
      rating: Number(record.rating || 0),
      createdAt: record.createdAt ? new Date(record.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: record.updatedAt ? new Date(record.updatedAt).toISOString() : undefined,
      services,
    };
  }

  /**
   * Retrieve the current authenticated priest's profile
   */
  async getMyProfile(userId: string): Promise<any> {
    return this.getPriestById(userId);
  }

  /**
   * Update priest profile credentials, bio, and languages
   */
  async updatePriestProfile(id: string, updates: UpdatePriestProfileInput): Promise<any> {
    await db
      .update(priestProfiles)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(or(eq(priestProfiles.id, id), eq(priestProfiles.userId, id)));

    return this.getPriestById(id);
  }

  /**
   * Query all service offerings for a given priest
   */
  async getPriestServices(priestId: string): Promise<any[]> {
    const priest = await this.getPriestById(priestId);
    return priest?.services ?? [];
  }

  /**
   * Create a new ritual service offering for a priest
   */
  async createPriestService(_priestId: string, _data: CreatePriestServiceInput): Promise<any> {
    // TODO: [Teammate - Priest] Insert new service offering into priest_services table
    return null;
  }

  /**
   * Update service pricing and samagri list for a priest service
   */
  async updatePriestService(
    _priestId: string,
    _serviceId: string,
    _data: UpdatePriestServiceInput
  ): Promise<any> {
    // TODO: [Teammate - Priest] Update service in priest_services table by id and priestId
    return null;
  }

  /**
   * Remove a service offering from a priest's roster
   */
  async deletePriestService(_priestId: string, _serviceId: string): Promise<void> {
    // TODO: [Teammate - Priest] Delete service from priest_services table by id and priestId
  }

  /**
   * Toggle service active/inactive status for bookings
   */
  async togglePriestService(_priestId: string, _serviceId: string): Promise<any> {
    // TODO: [Teammate - Priest] Toggle isActive flag in priest_services table
    return null;
  }

  /**
   * Query availability slots for a priest on a given date or range
   */
  async getPriestSlots(priestId: string, date?: string): Promise<any[]> {
    const priest = await this.getPriestById(priestId);
    if (!priest) return [];

    const records = await db
      .select()
      .from(priestSlots)
      .where(
        date
          ? and(eq(priestSlots.priestId, priest.id), eq(priestSlots.slotDate, date))
          : eq(priestSlots.priestId, priest.id)
      )
      .orderBy(asc(priestSlots.slotDate), asc(priestSlots.startTime));

    return records.map((s) => ({
      ...s,
      date: s.slotDate,
    }));
  }

  /**
   * Query only available (unbooked) slots for a priest on a given date
   */
  async getAvailableSlots(_priestId: string, _date?: string): Promise<any[]> {
    // TODO: [Teammate - Priest] Query priest_slots where priestId = id, status = 'AVAILABLE', and slotDate = date
    return [];
  }

  /**
   * Create a new date-based availability slot for bookings
   */
  async createPriestSlot(priestId: string, data: CreatePriestSlotInput): Promise<any> {
    const priest = await this.getPriestById(priestId);
    if (!priest) return null;

    const [slot] = await db
      .insert(priestSlots)
      .values({
        priestId: priest.id,
        slotDate: (data.slotDate || data.date)!,
        startTime: data.startTime,
        endTime: data.endTime,
        status: data.isAvailable === false ? 'BOOKED' : 'AVAILABLE',
      })
      .returning();

    return slot;
  }

  /**
   * Update an existing availability slot timing or status
   */
  async updatePriestSlot(
    _priestId: string,
    _slotId: string,
    _data: Partial<CreatePriestSlotInput>
  ): Promise<any> {
    // TODO: [Teammate - Priest] Update availability slot in priest_slots table
    return null;
  }

  /**
   * Delete an availability slot
   */
  async deletePriestSlot(_priestId: string, _slotId: string): Promise<void> {
    // TODO: [Teammate - Priest] Delete availability slot from priest_slots table
  }
}

export const priestService = new PriestService();
