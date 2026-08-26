import {
  mockLogin,
  mockSendPhoneOtp,
  mockVerifyPhoneOtp,
  mockSendEmailOtp,
  mockVerifyEmailOtp,
  mockLookupPincode,
  mockCreateAddress,
  mockGetPriests,
  mockGetPriestById,
  mockUpdatePriestProfile,
  mockGetPriestServices,
  mockCreatePriestService,
  mockUpdatePriestService,
  mockDeletePriestService,
  mockGetWeeklyAvailability,
  mockCreateWeeklyAvailabilityRule,
  mockUpdateWeeklyAvailabilityRule,
  mockDeleteWeeklyAvailabilityRule,
  mockGetAvailabilityExceptions,
  mockCreateAvailabilityException,
  mockDeleteAvailabilityException,
  mockGetAvailableSlotsForDate,
  mockCreateBooking,
  mockAcceptBooking,
  mockRejectBooking,
  mockCancelBooking,
  mockCompleteBooking,
  mockSubmitRating,
  mockAdminApprovePriest,
  mockAdminRejectPriest,
  mockAdminBanPriest,
  mockAdminUnbanPriest,
  mockAdminBanUser,
  mockAdminUnbanUser,
  mockAdminGetDashboardStats,
} from './mock-api';
import { mockDb, resetMockDb, validateMockDbIntegrity } from './db';
import { sanitizeErrorMessage, getUserFriendlyErrorMessage } from '../lib/errorHandler';

async function runValidationTests() {
  console.log('\n--- STARTING PUJACIRCLE COMPREHENSIVE SRS & ERROR HANDLING SUITE ---\n');
  let testsPassed = 0;
  let testsTotal = 0;

  function assert(condition: boolean, message: string) {
    testsTotal++;
    if (!condition) {
      console.error(`  ❌ FAILED: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
    console.log(`  ✓ ${message}`);
    testsPassed++;
  }

  // Reset database to ensure clean state
  resetMockDb();

  // ----------------------------------------------------
  // TEST 1: Database Integrity & Seed Baseline
  // ----------------------------------------------------
  console.log('[1/11] Testing Mock Database Structure & Integrity...');
  const integrity = validateMockDbIntegrity();
  assert(integrity.isValid && integrity.errors.length === 0, 'Initial mock database passes complete integrity validation');
  assert(mockDb.priests.length >= 7, 'Mock DB seeded with 7+ realistic priests');
  assert(mockDb.weeklyAvailabilityRules.length >= 8, 'Mock DB seeded with weekly recurring availability rules');

  const publicPriests = await mockGetPriests();
  assert(publicPriests.success && publicPriests.data.every((p) => p.approvalStatus === 'APPROVED' && p.accountStatus === 'ACTIVE'), 'Public directory only lists approved and active priests');

  // ----------------------------------------------------
  // TEST 2: Authentication & Strict Input Schema Validation
  // ----------------------------------------------------
  console.log('\n[2/11] Testing Multi-Role Authentication & Strict Schema Rejection...');
  const userRes = await mockLogin({ phoneNumber: '+919876543210', password: 'User@123' });
  assert(userRes.success && userRes.data?.user.role === 'USER', 'Devotee phone login succeeds with USER role');

  const priestRes = await mockLogin({ phoneNumber: '+919876543211', password: 'Priest@123' });
  assert(priestRes.success && priestRes.data?.user.role === 'PRIEST', 'Priest phone login succeeds with PRIEST role');

  const adminRes = await mockLogin({ email: 'admin@pujacircle.demo', password: 'Admin@123' });
  assert(adminRes.success && adminRes.data?.user.role === 'ADMIN', 'Admin email login succeeds with ADMIN role');

  const badLogin = await mockLogin({ phoneNumber: '+919876543210', password: 'WrongPassword' });
  assert(!badLogin.success, 'Invalid password correctly rejected');

  const bannedLogin = await mockLogin({ phoneNumber: '+919833445566', password: 'User@123' });
  assert(!bannedLogin.success && bannedLogin.message.includes('banned'), 'Banned user login rejected with ban message');

  // Strict schema format rejection on authentication
  const malformedPhoneLogin = await mockLogin({ phoneNumber: '12345', password: 'User@123' });
  assert(!malformedPhoneLogin.success, 'Malformed mobile number (< 10 digits) strictly rejected by schema');

  const malformedEmailLogin = await mockLogin({ email: 'not-an-email', password: 'Admin@123' });
  assert(!malformedEmailLogin.success, 'Malformed email format strictly rejected by schema');

  const otpSend = await mockSendPhoneOtp({ phoneNumber: '+919876543299' });
  assert(otpSend.success, 'Phone OTP sent with development mock code');
  
  const badOtpSend = await mockSendPhoneOtp({ phoneNumber: 'abcdef' });
  assert(!badOtpSend.success, 'Non-numeric phone string rejected by sendPhoneOtpSchema');

  const otpVerify = await mockVerifyPhoneOtp({ phoneNumber: '+919876543299', otp: '123456' });
  assert(otpVerify.success, 'Phone OTP verified successfully');

  const badOtpLengthVerify = await mockVerifyPhoneOtp({ phoneNumber: '+919876543299', otp: '123' });
  assert(!badOtpLengthVerify.success, 'Non-6-digit OTP strictly rejected by verifyPhoneOtpSchema');

  const emailOtpSend = await mockSendEmailOtp({ email: 'devotee@example.demo' });
  assert(emailOtpSend.success, 'Email OTP sent with development mock code');
  
  const badEmailOtpSend = await mockSendEmailOtp({ email: 'bad-email' });
  assert(!badEmailOtpSend.success, 'Invalid email strictly rejected by sendEmailOtpSchema');

  const emailOtpVerify = await mockVerifyEmailOtp({ email: 'devotee@example.demo', otp: '123456' });
  assert(emailOtpVerify.success, 'Email OTP verified successfully');

  // ----------------------------------------------------
  // TEST 3: PIN Code & Address Management
  // ----------------------------------------------------
  console.log('\n[3/11] Testing PIN Code Lookup & Strict Address Validation...');
  const pinRes = await mockLookupPincode('400050');
  assert(pinRes.locations.length > 0 && pinRes.locations[0].city === 'Mumbai', 'PIN 400050 resolves to Mumbai');

  const addrRes = await mockCreateAddress('user-devotee-1', {
    houseNo: 'Flat 101, Shanti Sadan',
    villageTown: 'Bandra West',
    pincode: '400050',
    city: 'Mumbai',
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    isDefault: true,
  });
  assert(addrRes.success && addrRes.data?.houseNo === 'Flat 101, Shanti Sadan', 'Address created with houseNo and PIN code');

  const badPinRes = await mockCreateAddress('user-devotee-1', {
    houseNo: '102',
    villageTown: 'Bandra',
    pincode: '1234',
    city: 'Mumbai',
    district: 'Mumbai',
    state: 'Maharashtra',
  });
  assert(!badPinRes.success, 'Invalid PIN code (< 6 digits) strictly rejected by addressSchema');

  const zeroPinRes = await mockCreateAddress('user-devotee-1', {
    houseNo: '102',
    villageTown: 'Bandra',
    pincode: '012345',
    city: 'Mumbai',
    district: 'Mumbai',
    state: 'Maharashtra',
  });
  assert(!zeroPinRes.success, 'Invalid PIN code (starting with 0) strictly rejected by addressSchema');

  // ----------------------------------------------------
  // TEST 4: Priest Profile & Services Model
  // ----------------------------------------------------
  console.log('\n[4/11] Testing Priest Profile & Strict Service Schema Validation...');
  const priestProfile = await mockGetPriestById('priest-1');
  assert(!!(priestProfile.success && priestProfile.data?.fullName.includes('Shastri')), 'Priest profile retrieved');

  const updateProfileRes = await mockUpdatePriestProfile('priest-1', {
    experienceYears: 19,
    bio: 'Updated Vedic scholar trained in Varanasi Gurukul with 19 years of ritual expertise.',
  });
  assert(updateProfileRes.success && updateProfileRes.data?.experienceYears === 19, 'Priest profile updated in mock DB');

  const initialServices = await mockGetPriestServices('priest-1');
  assert(initialServices.success && initialServices.data.length >= 2, 'Retrieved initial priest services catalog');

  const newServiceRes = await mockCreatePriestService('priest-1', {
    serviceName: 'Navchandi Yagya',
    price: 5500,
  });
  assert(newServiceRes.success && newServiceRes.data?.price === 5500, 'Priest created custom service with priest-specific price ₹5500');

  const duplicateServiceRes = await mockCreatePriestService('priest-1', {
    serviceName: 'Navchandi Yagya',
    price: 6000,
  });
  assert(!duplicateServiceRes.success, 'Duplicate service name for same priest correctly rejected');

  const negativePriceRes = await mockCreatePriestService('priest-1', {
    serviceName: 'Free Puja',
    price: -500,
  });
  assert(!negativePriceRes.success, 'Negative price strictly rejected by priestServiceSchema');

  const floatPriceRes = await mockCreatePriestService('priest-1', {
    serviceName: 'Decimal Price Puja',
    price: 1500.75,
  });
  assert(!floatPriceRes.success, 'Non-integer price strictly rejected by priestServiceSchema');

  const unauthorizedServiceEdit = await mockUpdatePriestService('service-1', 'priest-2', { price: 9999 });
  assert(!unauthorizedServiceEdit.success, 'Priest-2 blocked from editing Priest-1 service');

  // ----------------------------------------------------
  // TEST 5: Recurring Weekly Availability & Slot Generator Engine
  // ----------------------------------------------------
  console.log('\n[5/11] Testing Recurring Weekly Availability Schedule & Strict Time Validation...');
  const rulesRes = await mockGetWeeklyAvailability('priest-1');
  assert(rulesRes.success && rulesRes.data.length >= 7, 'Retrieved weekly schedule rules for Priest-1');

  // Create a new valid weekly rule (Thursday afternoon)
  const addRuleRes = await mockCreateWeeklyAvailabilityRule('priest-1', {
    dayOfWeek: 4, // Thursday
    startTime: '14:00',
    endTime: '18:00',
    slotDurationMinutes: 60,
    bufferMinutes: 0,
    isActive: true,
  });
  assert(addRuleRes.success && addRuleRes.data?.startTime === '14:00', 'Created non-overlapping weekly availability rule');

  // Invalid time format rejection (e.g. "25:99")
  const invalidTimeRuleRes = await mockCreateWeeklyAvailabilityRule('priest-1', {
    dayOfWeek: 4,
    startTime: '25:99',
    endTime: '28:00',
    slotDurationMinutes: 60,
    bufferMinutes: 0,
    isActive: true,
  });
  assert(!invalidTimeRuleRes.success, 'Invalid time format (25:99) strictly rejected by weeklyAvailabilityRuleSchema');

  // Update rule
  const updateRuleRes = await mockUpdateWeeklyAvailabilityRule(addRuleRes.data!.id, 'priest-1', {
    endTime: '19:00',
  });
  assert(updateRuleRes.success && updateRuleRes.data?.endTime === '19:00', 'Updated weekly availability rule');

  // Delete rule
  const deleteRuleRes = await mockDeleteWeeklyAvailabilityRule(addRuleRes.data!.id, 'priest-1');
  assert(deleteRuleRes.success, 'Deleted weekly availability rule');

  // Overlapping weekly rule rejection
  const overlapRuleRes = await mockCreateWeeklyAvailabilityRule('priest-1', {
    dayOfWeek: 1, // Monday (already 08:00-14:00)
    startTime: '09:00',
    endTime: '11:00',
    slotDurationMinutes: 60,
    bufferMinutes: 0,
    isActive: true,
  });
  assert(!overlapRuleRes.success, 'Overlapping weekly availability rule on same weekday correctly rejected');

  // Test slot generator for a future Monday (e.g. 2026-09-07)
  const slotsForMonday = await mockGetAvailableSlotsForDate('priest-1', '2026-09-07');
  assert(slotsForMonday.success && slotsForMonday.data.length > 0, 'Generated bookable slots from weekly schedule for Monday');
  assert(slotsForMonday.data.some((s) => s.startTime === '08:00' && s.endTime === '09:00'), 'Generated exact 60-minute slots starting at 08:00');

  // Test date exception: Block a specific date (e.g. 2026-09-14)
  const blockDateRes = await mockCreateAvailabilityException('priest-1', {
    date: '2026-09-14',
    type: 'BLOCKED',
    reason: 'Family temple visit',
  });
  assert(blockDateRes.success, 'Blocked specific calendar date exception created');

  const invalidDateFormatException = await mockCreateAvailabilityException('priest-1', {
    date: '14-09-2026', // wrong format, should be YYYY-MM-DD
    type: 'BLOCKED',
  });
  assert(!invalidDateFormatException.success, 'Invalid date format (14-09-2026) strictly rejected by availabilityExceptionSchema');

  const excList = await mockGetAvailabilityExceptions('priest-1');
  assert(excList.success && excList.data.some((e) => e.date === '2026-09-14'), 'Retrieved priest availability exceptions list');

  const slotsForBlockedDate = await mockGetAvailableSlotsForDate('priest-1', '2026-09-14');
  assert(
    slotsForBlockedDate.data.length === 1 && slotsForBlockedDate.data[0].status === 'BLOCKED',
    'Blocked date exception overrides weekly rules and returns BLOCKED status'
  );

  // Delete exception
  const deleteExcRes = await mockDeleteAvailabilityException(blockDateRes.data!.id, 'priest-1');
  assert(deleteExcRes.success, 'Deleted availability date exception');

  // ----------------------------------------------------
  // TEST 6: Booking Creation, Immutability & Double Booking Prevention
  // ----------------------------------------------------
  console.log('\n[6/11] Testing Booking Creation & Authoritative Price Snapshotting...');
  const testDate = '2026-09-21'; // A Monday
  const generatedSlots = await mockGetAvailableSlotsForDate('priest-1', testDate);
  const targetSlot = generatedSlots.data.find((s) => s.status === 'AVAILABLE');
  assert(!!targetSlot, 'Found available generated slot for booking test');

  // Invalid date format on booking creation rejected
  const badDateBooking = await mockCreateBooking('user-devotee-1', {
    priestId: 'priest-1',
    priestServiceId: 'service-1',
    slotId: targetSlot!.id,
    addressId: 'address-1',
    bookingDate: '21/09/2026',
    startTime: targetSlot!.startTime,
    endTime: targetSlot!.endTime,
  });
  assert(!badDateBooking.success, 'Invalid date format on booking creation strictly rejected by createBookingSchema');

  const bookingRes = await mockCreateBooking('user-devotee-1', {
    priestId: 'priest-1',
    priestServiceId: 'service-1', // Griha Pravesh ₹3100
    slotId: targetSlot!.id,
    addressId: 'address-1',
    bookingDate: testDate,
    startTime: targetSlot!.startTime,
    endTime: targetSlot!.endTime,
  });

  assert(bookingRes.success && bookingRes.data?.status === 'PENDING', 'Booking request created with status PENDING');
  assert(bookingRes.data?.servicePrice === 3100, 'Authoritative service price ₹3100 locked in snapshot');

  // Test price immutability after priest increases service price
  await mockUpdatePriestService('service-1', 'priest-1', { price: 4900 });
  const updatedBookingCheck = mockDb.bookings.find((b) => b.id === bookingRes.data?.id);
  assert(updatedBookingCheck?.servicePrice === 3100, 'Existing booking retains snapshot price of ₹3100 after priest raises service price to ₹4900');

  // Double-booking conflict prevention on same date and overlapping slot
  const doubleBookingRes = await mockCreateBooking('user-devotee-2', {
    priestId: 'priest-1',
    priestServiceId: 'service-2',
    slotId: `another-slot-id`,
    addressId: 'address-3',
    bookingDate: testDate,
    startTime: targetSlot!.startTime,
    endTime: targetSlot!.endTime,
  });
  assert(!doubleBookingRes.success, 'Double booking attempt on overlapping time slot correctly rejected');

  // ----------------------------------------------------
  // TEST 7: Booking Lifecycle (Accept, Reject, Cancel, Complete)
  // ----------------------------------------------------
  console.log('\n[7/11] Testing Booking State Machine Transitions & Strict Cancellation...');
  const createdBookingId = bookingRes.data!.id;

  // Priest accepts booking -> CONFIRMED
  const acceptRes = await mockAcceptBooking(createdBookingId, 'priest-1');
  assert(acceptRes.success && acceptRes.data?.status === 'CONFIRMED', 'Priest accepted booking -> status becomes CONFIRMED');

  // Test cancel & reject flows on a separate booking
  const cancelTestDate = '2026-09-28';
  const cancelSlots = await mockGetAvailableSlotsForDate('priest-1', cancelTestDate);
  const cancelSlot = cancelSlots.data.find((s) => s.status === 'AVAILABLE');
  const b2Res = await mockCreateBooking('user-devotee-1', {
    priestId: 'priest-1',
    priestServiceId: 'service-1',
    slotId: cancelSlot!.id,
    addressId: 'address-1',
    bookingDate: cancelTestDate,
    startTime: cancelSlot!.startTime,
    endTime: cancelSlot!.endTime,
  });

  // Short cancellation reason (< 3 chars) rejection
  const shortReasonCancel = await mockCancelBooking(b2Res.data!.id, 'user-devotee-1', 'x');
  assert(!shortReasonCancel.success, 'Too-short cancellation reason strictly rejected by cancelBookingSchema');

  const cancelRes = await mockCancelBooking(b2Res.data!.id, 'user-devotee-1', 'Family date change');
  assert(cancelRes.success && cancelRes.data?.status === 'CANCELLED', 'Devotee cancelled pending booking');

  // Priest rejects another booking
  const b3Res = await mockCreateBooking('user-devotee-1', {
    priestId: 'priest-1',
    priestServiceId: 'service-1',
    slotId: cancelSlot!.id,
    addressId: 'address-1',
    bookingDate: cancelTestDate,
    startTime: cancelSlot!.startTime,
    endTime: cancelSlot!.endTime,
  });
  const rejectRes = await mockRejectBooking(b3Res.data!.id, 'priest-1', 'Unavailable for emergency vidhi');
  assert(rejectRes.success && rejectRes.data?.status === 'REJECTED', 'Priest rejected booking request with reason');

  // Complete first ceremony -> COMPLETED
  const completeRes = await mockCompleteBooking(createdBookingId, 'priest-1');
  assert(completeRes.success && completeRes.data?.status === 'COMPLETED', 'Priest marked booking as COMPLETED after cash settlement');

  // ----------------------------------------------------
  // TEST 8: Verified 5-Star Devotee Ratings & Strict Rating Schema
  // ----------------------------------------------------
  console.log('\n[8/11] Testing Verified Rating & Review Strict Constraints...');
  // Non-owner rating rejection
  const nonOwnerRating = await mockSubmitRating('user-devotee-2', {
    bookingId: createdBookingId,
    rating: 5,
    review: 'Trying to rate someone else ceremony',
  });
  assert(!nonOwnerRating.success, 'Rating submission by non-owner user correctly rejected');

  // Out of bounds rating rejection (rating > 5)
  const invalidHighRating = await mockSubmitRating('user-devotee-1', {
    bookingId: createdBookingId,
    rating: 10,
    review: '10 stars',
  });
  assert(!invalidHighRating.success, 'Out-of-bounds rating (> 5) strictly rejected by ratingSchema');

  // Rating < 1 rejection
  const zeroRating = await mockSubmitRating('user-devotee-1', {
    bookingId: createdBookingId,
    rating: 0,
  });
  assert(!zeroRating.success, 'Rating < 1 strictly rejected by ratingSchema');

  // Valid rating submission by owner
  const validRating = await mockSubmitRating('user-devotee-1', {
    bookingId: createdBookingId,
    rating: 5,
    review: 'Flawless Vedic ceremony and mantras!',
  });
  assert(validRating.success && validRating.data?.rating === 5, 'Devotee submitted verified 5-star rating on completed ceremony');

  // Duplicate rating rejection
  const duplicateRating = await mockSubmitRating('user-devotee-1', {
    bookingId: createdBookingId,
    rating: 4,
  });
  assert(!duplicateRating.success, 'Duplicate rating on same booking correctly rejected');

  // ----------------------------------------------------
  // TEST 9: Admin Verification, Moderation & Dashboard KPIs
  // ----------------------------------------------------
  console.log('\n[9/11] Testing Administrator Moderation & Decoupled Account Status...');
  // Admin rejects a pending priest with reason
  const rejectPriestRes = await mockAdminRejectPriest('priest-4', 'Incomplete Gurukul certification document');
  assert(rejectPriestRes.success, 'Admin rejected priest application with reason');

  // Admin approves pending priest
  const approvePriestRes = await mockAdminApprovePriest('priest-3');
  assert(approvePriestRes.success, 'Admin approved pending priest (Pt. Krishnakant Upadhyay)');
  const p3 = mockDb.priests.find((p) => p.id === 'priest-3');
  assert(p3?.approvalStatus === 'APPROVED' && p3?.accountStatus === 'ACTIVE', 'Priest approval status changed to APPROVED while remaining ACTIVE');

  // Admin bans priest
  const banPriestRes = await mockAdminBanPriest('priest-3', 'Policy violation');
  assert(banPriestRes.success, 'Admin banned priest');
  assert(p3?.accountStatus === 'BANNED' && p3?.approvalStatus === 'APPROVED', 'Priest accountStatus is BANNED while approvalStatus remains APPROVED');

  // Admin unbans priest
  const unbanPriestRes = await mockAdminUnbanPriest('priest-3');
  assert(unbanPriestRes.success, 'Admin reactivated priest');
  assert(p3?.accountStatus === 'ACTIVE', 'Priest accountStatus restored to ACTIVE');

  // Admin suspends user & unbans user
  const suspendUserRes = await mockAdminBanUser('user-devotee-2', 'Suspicious activity');
  assert(suspendUserRes.success, 'Admin suspended user account');
  const u2 = mockDb.users.find((u) => u.id === 'user-devotee-2');
  assert(u2?.accountStatus === 'BANNED', 'User accountStatus updated to BANNED');

  const unbanUserRes = await mockAdminUnbanUser('user-devotee-2');
  assert(unbanUserRes.success, 'Admin restored user account');
  assert(u2?.accountStatus === 'ACTIVE', 'User accountStatus restored to ACTIVE');

  // Admin dashboard metrics
  const adminStats = await mockAdminGetDashboardStats();
  assert(adminStats.totalPriests >= 7, 'Admin stats report total priests accurately');
  assert(adminStats.totalBookings > 0, 'Admin stats report total bookings accurately');

  // ----------------------------------------------------
  // TEST 10: Service Deletion
  // ----------------------------------------------------
  console.log('\n[10/11] Testing Service Deletion...');
  const deleteServiceRes = await mockDeletePriestService(newServiceRes.data!.id, 'priest-1');
  assert(deleteServiceRes.success, 'Created service successfully deleted');

  // ----------------------------------------------------
  // TEST 11: Error Sanitization & Safe Failure Reporting
  // ----------------------------------------------------
  console.log('\n[11/11] Testing Error Sanitization & Protection Against Leaking Internals...');
  
  // 1. Raw database exception sanitization
  const dbError = 'Fatal error: SELECT * FROM `pujacircle_priests` WHERE `id` = 123 - Database connection lost';
  const cleanDbError = sanitizeErrorMessage(dbError);
  assert(!cleanDbError.includes('SELECT') && !cleanDbError.includes('Database'), 'Raw SQL error is sanitized into a clean generic message');

  // 2. File path leakage prevention
  const pathError = 'Error: Cannot find module at /Users/subhajit/Developer/Development/pujaCircle/frontend/src/api/auth.ts:12:3';
  const cleanPathError = sanitizeErrorMessage(pathError);
  assert(!cleanPathError.includes('/Users/subhajit/'), 'Internal filesystem paths are sanitized into a clean generic message');

  // 3. Stack trace leakage prevention
  const stackError = new Error('Runtime error\n    at eval (file:///Users/subhajit/app.js:20:5)\n    at emit (events.js:12:3)');
  const cleanStackError = getUserFriendlyErrorMessage(stackError);
  assert(!cleanStackError.includes('at eval') && !cleanStackError.includes('events.js'), 'Stack trace lines are stripped and never exposed to the user');

  // 4. Safe user message preservation
  const cleanUserMessage = getUserFriendlyErrorMessage('Mobile number must be at least 10 digits');
  assert(cleanUserMessage === 'Mobile number must be at least 10 digits', 'Valid user-facing business validation messages are preserved untouched');

  console.log(`\n🎉 [PASS] ALL ${testsPassed}/${testsTotal} COMPREHENSIVE VALIDATION & ERROR HANDLING TESTS PASSED SUCCESSFULLY!\n`);
}

runValidationTests().catch((err) => {
  console.error('\n❌ VALIDATION TEST SUITE ENCOUNTERED AN ERROR:\n', err);
  process.exit(1);
});
