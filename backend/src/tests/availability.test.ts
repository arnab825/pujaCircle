import assert from 'node:assert/strict';
import { markDayOffSchema, blockHoursSchema } from '@/schemas/availability.schema.js';
import {
  AvailabilityService,
  parseISTDateTime,
  toISTDateString,
  toISTTimeString,
} from '@/services/availability.service.js';
import { geoService } from '@/services/geo.service.js';

/**
 * ============================================================================
 * [UNIT & INTEGRATION TESTS]
 * Suite: Availability, Timezones, & Scheduling Rules
 * ============================================================================
 */
async function runTests() {
  console.log('\n--- 🕉️ PujaCircle Availability & Business Logic Tests ---');

  // Test 1: Day Off Schema Validation
  console.log('✔ Test 1: markDayOffSchema validations');
  const validDayOff = markDayOffSchema.parse({ date: '2026-11-01', reason: 'Family Festival' });
  assert.equal(validDayOff.date, '2026-11-01');
  assert.equal(validDayOff.reason, 'Family Festival');

  assert.throws(() => {
    markDayOffSchema.parse({ date: 'invalid-date' });
  }, /Date must be in YYYY-MM-DD format/);

  // Test 2: Block Hours Schema Validation
  console.log('✔ Test 2: blockHoursSchema validations');
  const validBlock = blockHoursSchema.parse({
    date: '2026-11-01',
    startTime: '13:00',
    endTime: '15:30',
    reason: 'Lunch & Rest',
  });
  assert.equal(validBlock.startTime, '13:00');
  assert.equal(validBlock.endTime, '15:30');

  // Rejects end <= start
  assert.throws(() => {
    blockHoursSchema.parse({
      date: '2026-11-01',
      startTime: '16:00',
      endTime: '14:00',
    });
  }, /End time must be later than start time/);

  // Test 3: Timezone conversion (Asia/Kolkata IST)
  console.log('✔ Test 3: Timezone helpers consistency (Asia/Kolkata)');
  const parsedDate = parseISTDateTime('2026-11-05', '07:30');
  // 07:30 IST is 02:00 UTC
  assert.equal(parsedDate.toISOString(), '2026-11-05T02:00:00.000Z');

  const istDateStr = toISTDateString(parsedDate);
  const istTimeStr = toISTTimeString(parsedDate);
  assert.equal(istDateStr, '2026-11-05');
  assert.equal(istTimeStr, '07:30');

  // Test 4: Block hours rejects invalid time range at service layer
  console.log('✔ Test 4: AvailabilityService rejects inverted time window');
  const service = new AvailabilityService();
  await assert.rejects(async () => {
    await service.blockHours('dummy-id', '2026-11-05', '18:00', '15:00');
  }, /End time must be later than start time/);

  // Test 5: Geo Service District Token Normalization
  console.log('✔ Test 5: GeoService district normalization & equivalence');
  assert.equal(geoService.normalizeDistrictTokens('Calcutta'), 'kolkata');
  assert.equal(geoService.normalizeDistrictTokens('Gurgaon'), 'gurugram');
  assert.equal(geoService.normalizeDistrictTokens('North Twenty Four Parganas'), '24northparganas');
  assert.equal(geoService.areDistrictsEquivalent('Kolkata', 'Calcutta'), true);
  assert.equal(geoService.areDistrictsEquivalent('Gurugram', 'Gurgaon'), true);
  assert.equal(geoService.areDistrictsEquivalent('Kolkata', 'Mumbai'), false);

  console.log('\n🎉 ALL PUJACIRCLE LOGIC TESTS PASSED SUCCESSFULLY! (100% OK)\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
