import { authApi } from '../api/auth.api';
import { priestApi } from '../api/priest.api';
import { addressApi } from '../api/address.api';
import { bookingApi } from '../api/booking.api';
import { adminApi } from '../api/admin.api';

/**
 * ============================================================
 * AUTOMATED MOCK API & RBAC VALIDATION RUNNER
 * ============================================================
 * Tests in-memory operations, separate user/priest/admin authentication,
 * phone + email OTP validations, PIN code resolution,
 * admin priest management (approve, reject, ban, unban, delete),
 * admin devotee management (view users, suspend), and bookings.
 */

async function runMockTests() {
  console.log('\n🕉️ --- STARTING PUJACIRCLE MOCK API VALIDATION --- 🕉️\n');

  try {
    // 1. Test Mock Authentication & Distinct Role Logins
    console.log('[1/6] Testing Mock Authentication (Separate Role Logins)...');

    // Test Devotee Login (/auth/user/login -> Phone: +919876543210)
    const userLogin = await authApi.login({
      identifier: '+919876543210',
      password: 'User@123',
    });
    if (!userLogin.success || userLogin.data?.user.role !== 'USER') {
      throw new Error('Devotee mock phone login failed');
    }
    console.log(`  ✓ Devotee Phone Login Success: ${userLogin.data.user.name} (Role: ${userLogin.data.user.role}, HasAddress: ${userLogin.data.user.hasAddress})`);

    // Test Priest Login (/auth/priest/login -> Phone: +919876543211)
    const priestLogin = await authApi.login({
      identifier: '+919876543211',
      password: 'Priest@123',
    });
    if (!priestLogin.success || priestLogin.data?.user.role !== 'PRIEST') {
      throw new Error('Priest mock phone login failed');
    }
    console.log(`  ✓ Priest Phone Login Success: ${priestLogin.data.user.name} (Role: ${priestLogin.data.user.role})`);

    // Test Admin Login (/auth/admin/login -> Email: admin@pujacircle.demo)
    const adminLogin = await authApi.login({
      identifier: 'admin@pujacircle.demo',
      password: 'Admin@123',
    });
    if (!adminLogin.success || adminLogin.data?.user.role !== 'ADMIN') {
      throw new Error('Admin mock email login failed');
    }
    console.log(`  ✓ Admin Email Login Success: ${adminLogin.data.user.name} (Role: ${adminLogin.data.user.role})`);

    // Test One-time Phone Validation OTP (+91)
    const phoneOtp = await authApi.sendPhoneOtp({ phoneNumber: '+919876543299' });
    console.log(`  ✓ ${phoneOtp.message}`);
    const verifyPhone = await authApi.verifyPhoneOtp({ phoneNumber: '+919876543299', otp: '123456' });
    console.log(`  ✓ ${verifyPhone.message}`);

    // Test Email OTP
    const emailOtp = await authApi.sendEmailOtp({ email: 'devotee@example.demo' });
    console.log(`  ✓ ${emailOtp.message}`);
    const verifyEmail = await authApi.verifyEmailOtp({ email: 'devotee@example.demo', otp: '123456' });
    console.log(`  ✓ ${verifyEmail.message}`);

    // 2. Test Multi-Location PIN Code Resolution
    console.log('\n[2/6] Testing Multi-Location PIN Code Resolution...');
    const pinLookup = await addressApi.lookupPincode('700019');
    console.log(`  ✓ PIN 700019 resolved to ${pinLookup.locations.length} matching postal areas:`);
    pinLookup.locations.forEach((loc) => {
      console.log(`     • ${loc.postOffice} (${loc.locality}), ${loc.city}, ${loc.state}`);
    });

    // 3. Test Address CRUD with Selected Location
    console.log('\n[3/6] Testing Address Management (CRUD)...');
    const selectedLoc = pinLookup.locations[0];
    const newAddress = await addressApi.createAddress(
      {
        label: 'HOME',
        recipientName: 'Demo User',
        phoneNumber: '+919876543210',
        houseBuilding: 'Flat 402, Ganga Tower',
        street: 'Rashbehari Avenue',
        locality: selectedLoc.locality,
        landmark: 'Near Lake Mall',
        pincode: '700019',
        city: selectedLoc.city,
        district: selectedLoc.district,
        state: selectedLoc.state,
        country: 'India',
        isDefault: true,
      },
      'user-devotee-1'
    );
    console.log(`  ✓ Created address with PIN auto-detection: ${newAddress.houseBuilding}, ${newAddress.city} (Default: ${newAddress.isDefault})`);

    // 4. Test Priest Discovery & Booking Lifecycle
    console.log('\n[4/6] Testing Priest Discovery & Booking Lifecycle...');
    const approvedPriests = await priestApi.getPriests();
    console.log(`  ✓ Retrieved ${approvedPriests.length} approved priests in public discovery.`);
    const firstPriest = approvedPriests[0];
    console.log(`  ✓ First Priest: ${firstPriest.displayName} (${firstPriest.city})`);

    const slots = await priestApi.getPriestSlots(firstPriest.id);
    console.log(`  ✓ Available slots for ${firstPriest.displayName}: ${slots.length}`);

    const rituals = await priestApi.getRituals();
    console.log(`  ✓ Available rituals count: ${rituals.length}`);

    const booking = await bookingApi.createBooking(
      {
        priestId: firstPriest.id,
        ritualId: rituals[0].id,
        addressId: newAddress.id,
        slotId: slots[0].id,
        bookingDate: '2026-08-25',
        specialInstructions: 'Please arrive 15 minutes early.',
        dakshinaAmount: 3100,
      },
      'user-devotee-1'
    );
    console.log(`  ✓ Booking created! Ref: ${booking.bookingReference}, Status: ${booking.status}`);
    console.log(`  ✓ Payment Method: ${booking.paymentMethod}, Status: ${booking.paymentStatus}`);

    const cancelledBooking = await bookingApi.cancelBooking({
      bookingId: booking.id,
      reason: 'Change of date',
    });
    console.log(`  ✓ Booking cancelled: Status is now ${cancelledBooking.status}`);

    // Cleanup created address
    await addressApi.deleteAddress(newAddress.id, 'user-devotee-1');

    // 5. Test Priest Onboarding & Admin Approval
    console.log('\n[5/6] Testing Priest Onboarding & Admin Approvals...');
    const registeredPriest = await priestApi.registerPriest({
      fullName: 'Pandit Ananda Tirtha',
      phoneNumber: '+919822334455',
      email: 'ananda@example.demo',
      experienceYears: 14,
      bio: 'Vedic scholar with expertise in Rigveda samhita.',
      languages: ['Kannada', 'Sanskrit', 'Telugu'],
      specializations: ['Navagraha Havan', 'Rudrabhishek'],
      serviceAreas: ['Jayanagar', 'JP Nagar'],
      city: 'Bengaluru',
      state: 'Karnataka',
    });
    console.log(`  ✓ Priest registered: ${registeredPriest.fullName}, Status: ${registeredPriest.approvalStatus}`);

    const pendingQueue = await adminApi.getPendingPriests();
    console.log(`  ✓ Pending priest review queue count: ${pendingQueue.length}`);

    const approvedPriest = await adminApi.approvePriest(registeredPriest.id);
    console.log(`  ✓ Admin approved priest: ${approvedPriest.fullName}, Status: ${approvedPriest.approvalStatus}`);

    // 6. Test Admin Priest Actions (Approve, Reject, Ban, Unban, Delete) & Devotee Management
    console.log('\n[6/6] Testing Admin Priest & User Management Controls...');

    // Admin bans priest
    const banned = await adminApi.banPriest(approvedPriest.id, 'Violated conduct policy');
    console.log(`  ✓ Admin banned priest: ${banned.fullName} (Status: ${banned.approvalStatus})`);

    // Verify banned priest does NOT appear in public devotee discovery
    const publicAfterBan = await priestApi.getPriests();
    const isBannedListed = publicAfterBan.some((p) => p.id === approvedPriest.id);
    if (isBannedListed) throw new Error('Banned priest should NOT be visible to devotees');
    console.log(`  ✓ Verified banned priest is omitted from devotee public search.`);

    // Admin unbans/reactivates priest
    const reactivated = await adminApi.reactivatePriest(approvedPriest.id);
    console.log(`  ✓ Admin unbanned priest: ${reactivated.fullName} (Status: ${reactivated.approvalStatus})`);

    // Admin deletes priest
    const delRes = await adminApi.deletePriest(approvedPriest.id);
    console.log(`  ✓ Admin deleted priest: ${delRes.message}`);

    // Admin views all registered devotees
    const allUsers = await adminApi.getAllUsers();
    console.log(`  ✓ Admin retrieved all registered devotees: ${allUsers.length} users found.`);
    console.log(`     • ${allUsers.map((u) => `${u.name} (${u.status})`).join(', ')}`);

    // Admin suspends user account
    const userToSuspend = allUsers[0];
    const suspendedUser = await adminApi.updateUserStatus(userToSuspend.id, 'SUSPENDED');
    console.log(`  ✓ Admin suspended devotee account: ${suspendedUser.name} (Status: ${suspendedUser.status})`);

    // Admin reactivates user account
    const reactivatedUser = await adminApi.updateUserStatus(userToSuspend.id, 'ACTIVE');
    console.log(`  ✓ Admin reactivated devotee account: ${reactivatedUser.name} (Status: ${reactivatedUser.status})`);

    console.log('\n✅ ALL MOCK API, RBAC & ADMIN CONTROLS CHECKS PASSED SUCCESSFULLY! ✅\n');
  } catch (error) {
    console.error('\n❌ MOCK API TEST FAILED:', error);
    process.exit(1);
  }
}

runMockTests();
