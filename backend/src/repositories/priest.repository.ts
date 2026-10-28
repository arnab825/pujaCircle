import { or, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { priestProfiles } from '../models/priest.model.js';

// Resolves canonical priestProfiles.id from either a profile UUID or linked user UUID
export async function resolvePriestProfileId(idOrUserId: string): Promise<string | null> {
  const [profile] = await db
    .select({ id: priestProfiles.id })
    .from(priestProfiles)
    .where(or(eq(priestProfiles.id, idOrUserId), eq(priestProfiles.userId, idOrUserId)))
    .limit(1);
  return profile?.id ?? null;
}
