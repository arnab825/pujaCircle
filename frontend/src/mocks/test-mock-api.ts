/**
 * Automated Mock API Test Runner
 * Validates that Category B (in-memory mock DB, async delay, CRUD mutations) works end-to-end.
 */
import { priestApi } from '../api/priest.api';
import { addressApi } from '../api/address.api';
import { bookingApi } from '../api/booking.api';

async function runMockTests() {
  console.log('🕉️ --- STARTING PUJACIRCLE MOCK API VALIDATION --- 🕉️\n');

  try {
    // 1. Priests verification
    console.log('[1/4] Testing Priest API...');
    const priests = await priestApi.getPriests();
    console.log(`  ✓ Successfully retrieved ${priests.length} approved priests.`);
    if (priests.length === 0) throw new Error('No priests found in mock database.');
    const firstPriest = priests[0];
    console.log(`  ✓ First Priest: ${firstPriest.displayName} (${firstPriest.city})`);

    const slots = await priestApi.getPriestSlots(firstPriest.id);
    console.log(`  ✓ Priest slots available: ${slots.length}`);

    // 2. Address CRUD verification
    console.log('\n[2/4] Testing Address API (CRUD)...');
    const initialAddresses = await addressApi.getAddresses('usr_mock_1');
    console.log(`  ✓ Initial addresses count: ${initialAddresses.length}`);

    const newAddress = await addressApi.createAddress({
      label: 'HOME',
      recipientName: 'Aditi Sharma',
      phoneNumber: '9876543210',
      houseBuilding: 'Flat 101, Shanti Heights',
      street: 'Temple Road',
      locality: 'Indiranagar',
      pincode: '560038',
      city: 'Bengaluru',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      country: 'India',
      isDefault: true,
    });
    console.log(`  ✓ Created new address ID: ${newAddress.id} (Default: ${newAddress.isDefault})`);

    const updatedAddress = await addressApi.updateAddress({
      id: newAddress.id,
      houseBuilding: 'Flat 101-A, Shanti Heights',
    });
    console.log(`  ✓ Updated address house/building to: ${updatedAddress.houseBuilding}`);

    // PIN lookup stub
    const pincodeData = await addressApi.lookupPincode('560038');
    console.log(`  ✓ Pincode lookup 560038 resolved to: ${pincodeData.city}, ${pincodeData.state}`);

    // 3. Booking lifecycle verification
    console.log('\n[3/4] Testing Booking API Lifecycle...');
    const rituals = await priestApi.getRituals();
    console.log(`  ✓ Available rituals count: ${rituals.length}`);
    const ritual = rituals[0];

    const availableSlot = slots.find((s) => s.status === 'AVAILABLE') || slots[0];

    const booking = await bookingApi.createBooking({
      priestId: firstPriest.id,
      ritualId: ritual.id,
      addressId: newAddress.id,
      slotId: availableSlot.id,
      bookingDate: '2026-08-25',
      specialInstructions: 'Test booking automation',
      dakshinaAmount: 3100,
    });
    console.log(`  ✓ Booking created successfully! Reference: ${booking.bookingReference}, Status: ${booking.status}`);
    console.log(`  ✓ Offline Payment Status: ${booking.paymentStatus}, Method: ${booking.paymentMethod}`);

    const userBookings = await bookingApi.getBookings('usr_mock_1');
    console.log(`  ✓ Devotee has ${userBookings.length} total bookings.`);

    const cancelledBooking = await bookingApi.cancelBooking({
      bookingId: booking.id,
      reason: 'Automated test cancellation verification',
    });
    console.log(`  ✓ Cancelled booking ${cancelledBooking.bookingReference}. Status is now: ${cancelledBooking.status}`);

    // Clean up test address
    await addressApi.deleteAddress(newAddress.id);
    console.log(`  ✓ Cleaned up test address.`);

    // 4. Admin & Priest Onboarding verification
    console.log('\n[4/4] Testing Priest Onboarding & Admin Approvals...');
    const registeredPriest = await priestApi.registerPriest({
      fullName: 'Pandit Ananda Tirtha',
      phoneNumber: '9844001122',
      email: 'ananda@example.com',
      experienceYears: 15,
      bio: 'Expert in Vedic chanting, Satyanarayan Puja and Vastu.',
      languages: ['Kannada', 'Sanskrit', 'Hindi'],
      specializations: ['Satyanarayan Katha', 'Vastu Shanti'],
      serviceAreas: ['Malleshwaram', 'Rajajinagar'],
      city: 'Bengaluru',
      state: 'Karnataka',
    });
    console.log(`  ✓ Registered new priest: ${registeredPriest.fullName}, Status: ${registeredPriest.approvalStatus}`);

    const pendingList = await priestApi.getPendingPriests();
    console.log(`  ✓ Pending priest approval queue count: ${pendingList.length}`);

    const approvedPriest = await priestApi.approvePriest(registeredPriest.id);
    console.log(`  ✓ Admin approved priest: ${approvedPriest.fullName}, Status is now: ${approvedPriest.approvalStatus}`);

    console.log('\n✅ ALL MOCK API CHECKS PASSED SUCCESSFULLY! ✅\n');
  } catch (error) {
    console.error('\n❌ MOCK API TEST FAILED:', error);
    process.exit(1);
  }
}

runMockTests();
