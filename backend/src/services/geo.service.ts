/**
 * ============================================================================
 * [ARCHITECTURAL LAYER: SERVICE]
 * Module: Geo & Postal Directory Service
 * 
 * Purpose:
 * Provides unified postal code lookup and district resolution across India.
 * Implements an in-memory TTL cache to minimize external network latency and
 * prevent exceeding external API rate limits.
 * ============================================================================
 */

export interface PincodeLocation {
  postOffice: string;
  locality: string;
  villageTown: string;
  city: string;
  district: string;
  state: string;
  country: string;
}

export interface PincodeLookupResult {
  pincode: string;
  locations: PincodeLocation[];
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class GeoService {
  // In-memory cache for full PIN code responses (1 hour TTL)
  private readonly lookupCache = new Map<string, CacheEntry<PincodeLocation[]>>();
  // Dedicated cache for resolved district names
  private readonly districtCache = new Map<string, CacheEntry<string>>();
  private readonly CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

  /**
   * Look up postal information for a 6-digit Indian PIN code.
   * Returns empty locations array if PIN code is invalid or not found.
   */
  async lookupPincode(pincode: string): Promise<PincodeLookupResult> {
    const cleanPin = (pincode || '').trim().replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      return { pincode: cleanPin, locations: [] };
    }

    // 1. Check in-memory cache
    const cached = this.lookupCache.get(cleanPin);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return { pincode: cleanPin, locations: cached.data };
    }

    // 2. Fetch from India Post API with 3.5s timeout
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, {
        signal: AbortSignal.timeout(3500),
      });

      if (response.ok) {
        const data: any = await response.json();
        if (Array.isArray(data) && data[0]?.Status === 'Success' && Array.isArray(data[0]?.PostOffice)) {
          const locations: PincodeLocation[] = data[0].PostOffice.map((po: any) => ({
            postOffice: `${po.Name} Post Office`,
            locality: po.Name,
            villageTown: po.Name,
            city: po.District || po.Block || po.Circle || 'Unknown',
            district: po.District || 'Unknown',
            state: po.State || 'Unknown',
            country: po.Country || 'India',
          }));

          // Cache result
          this.lookupCache.set(cleanPin, { data: locations, timestamp: Date.now() });

          // Also populate district cache if available
          const firstDistrict = locations[0]?.district;
          if (firstDistrict && firstDistrict !== 'Unknown') {
            this.districtCache.set(cleanPin, { data: firstDistrict.trim(), timestamp: Date.now() });
          }

          return { pincode: cleanPin, locations };
        }
      }
    } catch {
      // Graceful fallback on network timeout or external API downtime
    }

    return { pincode: cleanPin, locations: [] };
  }

  /**
   * Resolve the canonical district name for a 6-digit PIN code.
   */
  async resolveDistrictFromPincode(pincode: string): Promise<string | null> {
    const cleanPin = (pincode || '').trim().replace(/\D/g, '');
    if (cleanPin.length !== 6) return null;

    const cachedDistrict = this.districtCache.get(cleanPin);
    if (cachedDistrict && Date.now() - cachedDistrict.timestamp < this.CACHE_TTL_MS) {
      return cachedDistrict.data;
    }

    const result = await this.lookupPincode(cleanPin);
    if (result.locations.length > 0 && result.locations[0].district !== 'Unknown') {
      const district = result.locations[0].district.trim();
      this.districtCache.set(cleanPin, { data: district, timestamp: Date.now() });
      return district;
    }

    return null;
  }

  /**
   * Canonical token normalizer for Indian district and city names.
   * Handles common aliases (e.g., Calcutta -> Kolkata, Gurgaon -> Gurugram, 24 Parganas).
   */
  normalizeDistrictTokens(value?: string | null): string {
    if (!value) return '';
    return value
      .toLowerCase()
      .replace(/twenty\s*four/g, '24')
      .replace(/twentyfour/g, '24')
      .replace(/\bgurgaon\b/g, 'gurugram')
      .replace(/\bbangalore\b/g, 'bengaluru')
      .replace(/\bcalcutta\b/g, 'kolkata')
      .replace(/\bbombay\b/g, 'mumbai')
      .replace(/\bmadras\b/g, 'chennai')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\b(district|city|urban|rural|division|corporation)\b/g, '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .sort()
      .join('');
  }

  /**
   * Checks whether two district names represent the same administrative area.
   */
  areDistrictsEquivalent(firstDistrict?: string | null, secondDistrict?: string | null): boolean {
    if (!firstDistrict || !secondDistrict) return true;
    const norm1 = this.normalizeDistrictTokens(firstDistrict);
    const norm2 = this.normalizeDistrictTokens(secondDistrict);
    if (!norm1 || !norm2) return true;
    if (norm1 === norm2) return true;
    if (norm1.includes(norm2) || norm2.includes(norm1)) return true;
    return false;
  }
}

export const geoService = new GeoService();
export const normalizeDistrictTokens = (val?: string | null) => geoService.normalizeDistrictTokens(val);
export const areDistrictsEquivalent = (d1?: string | null, d2?: string | null) => geoService.areDistrictsEquivalent(d1, d2);
