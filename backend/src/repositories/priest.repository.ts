import { or, eq } from 'drizzle-orm';
import { db } from '@/db/index.js';
import { priestProfiles } from '@/models/priest.model.js';

// In-memory cache to eliminate repetitive N+1 database lookups for priest ID resolution
const profileIdCache = new Map<string, { id: string; timestamp: number }>();
const CACHE_TTL_MS = 60 * 1000; // 60-second TTL

// Resolves canonical priestProfiles.id from either a profile UUID or linked user UUID
export async function resolvePriestProfileId(idOrUserId: string): Promise<string | null> {
  if (!idOrUserId) return null;

  const cached = profileIdCache.get(idOrUserId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.id;
  }

  const [profile] = await db
    .select({ id: priestProfiles.id })
    .from(priestProfiles)
    .where(or(eq(priestProfiles.id, idOrUserId), eq(priestProfiles.userId, idOrUserId)))
    .limit(1);

  if (profile) {
    profileIdCache.set(idOrUserId, { id: profile.id, timestamp: Date.now() });
    profileIdCache.set(profile.id, { id: profile.id, timestamp: Date.now() });
    return profile.id;
  }

  return null;
}
