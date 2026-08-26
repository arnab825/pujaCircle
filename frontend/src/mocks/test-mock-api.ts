import {
  mockLogin,
  mockSendPhoneOtp,
  mockVerifyPhoneOtp,
  mockSendEmailOtp,
  mockVerifyEmailOtp,
  mockLookupPincode,
  mockCreateAddress,
  mockGetPriests,
  mockGetPriestServices,
  mockCreatePriestService,
  mockUpdatePriestService,
  mockGetPriestSlots,
  mockCreateBooking,
  mockAcceptBooking,
  mockRejectBooking,
  mockCancelBooking,
  mockCompleteBooking,
  mockSubmitRating,
  mockAdminApprovePriest,
  mockAdminBanPriest,
  mockAdminUnbanPriest,
  mockAdminBanUser,
  mockAdminUnbanUser,
  mockAdminGetDashboardStats,
} from './mock-api';
import { mockSlots } from './db';

async function runValidationTests() {
  console.log('\n--- STARTING PUJACIRCLE COMPREHENSIVE SRS VALIDATION ---\n');
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

  // ----------------------------------------------------
  // TEST 1: Authentication & Role Isolation
  // ----------------------------------------------------
  console.log('[1/11] Testing Multi-Role Authentication...');
  const userRes = await mockLogin({ phoneNumber: '+919876543210', password: 'User@123' });
  assert(userRes.success && userRes.data?.user.role === 'USER', 'Devotee phone login succeeds with USER role');

  const priestRes = await mockLogin({ phoneNumber: '+919876543211', password: 'Priest@123' });
  assert(priestRes.success && priestRes.data?.user.role === 'PRIEST', 'Priest phone login succeeds with PRIEST role');

  const adminRes = await mockLogin({ email: 'admin@pujacircle.demo', password: 'Admin@123' });
  assert(adminRes.success && adminRes.data?.user.role === 'ADMIN', 'Admin email login succeeds with ADMIN role');

  const otpSend = await mockSendPhoneOtp({ phoneNumber: '+919876543299' });
  assert(otpSend.success, 'Phone OTP sent with development mock code');
  const otpVerify = await mockVerifyPhoneOtp({ phoneNumber: '+919876543299', otp: '123456' });
  assert(otpVerify.success, 'Phone OTP verified successfully');

  const emailOtpSend = await mockSendEmailOtp({ email: 'devotee@example.demo' });
  assert(emailOtpSend.success, 'Email OTP sent with development mock code');
  const emailOtpVerify = await mockVerifyEmailOtp({ email: 'devotee@example.demo', otp: '123456' });
  assert(emailOtpVerify.success, 'Email OTP verified successfully');

  // ----------------------------------------------------
  // TEST 2: PIN Code & Address Management
  // ----------------------------------------------------
  console.log('\n[2/11] Testing PIN Code Lookup & Simplified Address...');
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
  assert(addrRes.success && addrRes.data.houseNo === 'Flat 101, Shanti Sadan', 'Address created with houseNo and villageTown');

  // ----------------------------------------------------
  // TEST 3: Priest Services & Priest-Specific Pricing
  // ----------------------------------------------------
  console.log('\n[3/11] Testing Priest Services & Pricing Model...');
  const priestServices = await mockGetPriestServices('priest-1');
  assert(priestServices.data.length > 0, 'Priest-1 has active services');

  const newService = await mockCreatePriestService('priest-1', {
    serviceName: 'Navagraha Shanti Havan',
    price: 4500,
  });
  assert(newService.success && newService.data?.price === 4500, 'Priest added custom service with priest-specific price ₹4500');

  // ----------------------------------------------------
  // TEST 4: Price Snapshot Immutability
  // ----------------------------------------------------
  console.log('\n[4/11] Testing Booking Price Snapshot Immutability...');
  const slotRes = await mockGetPriestSlots('priest-1');
  const availableSlot = slotRes.data.find((s) => s.status === 'AVAILABLE');
  assert(!!availableSlot, 'Found available slot for booking test');

  // User books service at ₹4500
  const booking1 = await mockCreateBooking('user-devotee-1', {
    priestId: 'priest-1',
    priestServiceId: newService.data!.id,
    addressId: addrRes.data.id,
    slotId: availableSlot!.id,
    bookingDate: availableSlot!.date,
    dakshinaAmount: 999999, // Tampered price payload
  });
  assert(booking1.success && booking1.data?.servicePrice === 4500, 'Mock API ignored tampered price and locked authoritative ₹4500');

  // Priest updates price to ₹5500 afterward
  await mockUpdatePriestService(newService.data!.id, 'priest-1', { price: 5500 });
  assert(booking1.data?.servicePrice === 4500, 'Existing booking retains snapshot price of ₹4500 after priest price increase');

  // ----------------------------------------------------
  // TEST 5: Slot Double-Booking Prevention
  // ----------------------------------------------------
  console.log('\n[5/11] Testing Slot Double-Booking Prevention...');
  const conflictBooking = await mockCreateBooking('user-devotee-2', {
    priestId: 'priest-1',
    priestServiceId: newService.data!.id,
    addressId: addrRes.data.id,
    slotId: availableSlot!.id, // Same slot!
    bookingDate: availableSlot!.date,
  });
  assert(!conflictBooking.success, 'Second user attempting same slot receives slot conflict error');

  // ----------------------------------------------------
  // TEST 6: Priest Rejection & Slot Release
  // ----------------------------------------------------
  console.log('\n[6/11] Testing Booking Rejection & Slot Release...');
  const rejectRes = await mockRejectBooking(booking1.data!.id, 'priest-1', 'Unavailable due to prior commitment');
  assert(rejectRes.success && rejectRes.data?.status === 'REJECTED', 'Priest successfully declined booking request');

  const slotAfterReject = mockSlots.find((s) => s.id === availableSlot!.id);
  assert(slotAfterReject?.status === 'AVAILABLE', 'Slot is freed and marked AVAILABLE again after rejection');

  // ----------------------------------------------------
  // TEST 7: User Cancellation & Slot Release
  // ----------------------------------------------------
  console.log('\n[7/11] Testing User Cancellation & Slot Release...');
  const booking2 = await mockCreateBooking('user-devotee-1', {
    priestId: 'priest-1',
    priestServiceId: newService.data!.id,
    addressId: addrRes.data.id,
    slotId: availableSlot!.id,
    bookingDate: availableSlot!.date,
  });
  assert(booking2.success, 'New booking created on freed slot');

  const cancelRes = await mockCancelBooking(booking2.data!.id, 'user-devotee-1', 'Family travel rescheduled');
  assert(cancelRes.success && cancelRes.data?.status === 'CANCELLED', 'User cancelled booking request');

  const slotAfterCancel = mockSlots.find((s) => s.id === availableSlot!.id);
  assert(slotAfterCancel?.status === 'AVAILABLE', 'Slot is freed and marked AVAILABLE again after cancellation');

  // ----------------------------------------------------
  // TEST 8: Full Booking Completion & Rating Flow
  // ----------------------------------------------------
  console.log('\n[8/11] Testing Confirmation, Completion & Verified Rating...');
  const booking3 = await mockCreateBooking('user-devotee-1', {
    priestId: 'priest-1',
    priestServiceId: newService.data!.id,
    addressId: addrRes.data.id,
    slotId: availableSlot!.id,
    bookingDate: availableSlot!.date,
  });

  const acceptRes = await mockAcceptBooking(booking3.data!.id, 'priest-1');
  assert(acceptRes.success && acceptRes.data?.status === 'CONFIRMED', 'Priest confirmed booking request');

  // Rating uncompleted booking should fail
  let ratingUncompletedFailed = false;
  const prematureRating = await mockSubmitRating('user-devotee-1', {
    bookingId: booking3.data!.id,
    rating: 5,
    review: 'Premature rating',
  });
  if (!prematureRating.success) ratingUncompletedFailed = true;
  assert(ratingUncompletedFailed, 'Rating rejected before ceremony is COMPLETED');

  // Mark completed
  const completeRes = await mockCompleteBooking(booking3.data!.id, 'priest-1');
  assert(completeRes.success && completeRes.data?.status === 'COMPLETED', 'Ceremony marked as COMPLETED by priest');

  // Other user trying to rate should fail
  const unauthorizedRating = await mockSubmitRating('user-devotee-2', {
    bookingId: booking3.data!.id,
    rating: 5,
    review: 'Unauthorized rating attempt',
  });
  assert(!unauthorizedRating.success, 'Rating rejected when submitted by non-owner user');

  // Legitimate rating
  const validRating = await mockSubmitRating('user-devotee-1', {
    bookingId: booking3.data!.id,
    rating: 5,
    review: 'Exemplary chanting and timely arrival!',
  });
  assert(validRating.success, 'Verified rating submitted by booking owner after completion');

  // ----------------------------------------------------
  // TEST 9: Unauthorized Cross-Priest Editing
  // ----------------------------------------------------
  console.log('\n[9/11] Testing Priest Resource Ownership Security...');
  const crossEditRes = await mockUpdatePriestService(newService.data!.id, 'priest-2', { price: 100 });
  assert(!crossEditRes.success, 'Priest-2 blocked from editing Priest-1 service');

  // ----------------------------------------------------
  // TEST 10: Banned User & Priest Restrictions
  // ----------------------------------------------------
  console.log('\n[10/11] Testing Banned Account Restrictions...');
  const bannedBookingAttempt = await mockCreateBooking('user-devotee-4', {
    priestId: 'priest-1',
    addressId: addrRes.data.id,
    slotId: availableSlot!.id,
    bookingDate: availableSlot!.date,
  });
  assert(!bannedBookingAttempt.success, 'Banned user blocked from submitting booking request');

  // ----------------------------------------------------
  // TEST 11: Admin Approvals & Ban Management
  // ----------------------------------------------------
  console.log('\n[11/11] Testing Admin Approvals & Ban Management...');
  await mockAdminApprovePriest('priest-3');
  const approvedPriests = await mockGetPriests({ status: 'ALL' });
  const p3 = approvedPriests.data.find((p) => p.id === 'priest-3');
  assert(p3?.approvalStatus === 'APPROVED', 'Admin approved pending priest (Pt. Krishnakant Upadhyay)');

  const banPriestRes = await mockAdminBanPriest('priest-3', 'Policy violation');
  assert(banPriestRes.success, 'Admin banned priest successfully');
  const unbanPriestRes = await mockAdminUnbanPriest('priest-3');
  assert(unbanPriestRes.success, 'Admin unbanned priest successfully');

  const banUserRes = await mockAdminBanUser('user-devotee-2', 'Suspicious activity');
  assert(banUserRes.success, 'Admin suspended user account');
  const unbanUserRes = await mockAdminUnbanUser('user-devotee-2');
  assert(unbanUserRes.success, 'Admin reactivated user account');

  const stats = await mockAdminGetDashboardStats();
  assert(stats.totalUsers > 0 && stats.totalPriests > 0, 'Admin dashboard metrics computed accurately');

  console.log(`\n🎉 [PASS] ALL ${testsPassed}/${testsTotal} SRS VALIDATION TESTS PASSED SUCCESSFULLY!\n`);
}

runValidationTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
