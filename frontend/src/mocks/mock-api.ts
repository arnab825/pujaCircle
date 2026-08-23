import { mockDb } from './db';
import { delay } from './delay';
import { AuthUser, AuthResponse, RegisterUserRequest } from '@/types/auth.types';
import { Priest, PriestRegistrationRequest, PriestFilterParams, PriestSlot, Ritual } from '@/types/priest.types';
import { Address, CreateAddressRequest, UpdateAddressRequest } from '@/types/address.types';
import { Booking, CreateBookingRequest } from '@/types/booking.types';

// ==========================================
// 1. AUTHENTICATION MOCK APIs
// ==========================================

export async function mockRegisterUser(data: RegisterUserRequest): Promise<AuthResponse> {
  await delay();
  const existing = mockDb.users.find((u) => u.phoneNumber === data.phoneNumber);
  if (existing) {
    return {
      user: existing,
      token: `mock_jwt_token_${existing.id}`,
      message: 'User already exists. OTP sent for verification.',
    };
  }

  const newUser: AuthUser = {
    id: `usr_mock_${Date.now()}`,
    fullName: data.fullName,
    phoneNumber: data.phoneNumber,
    role: 'USER',
    isPhoneVerified: false,
    createdAt: new Date().toISOString(),
  };

  mockDb.users.push(newUser);
  return {
    user: newUser,
    token: `mock_jwt_token_${newUser.id}`,
    message: 'Registration initiated. OTP sent to mobile.',
  };
}

export async function mockVerifyUserOtp(phoneNumber: string, otp: string): Promise<AuthResponse> {
  await delay();
  // Allow '123456' or any 6-digit mock OTP for testing
  if (otp.length !== 6) {
    throw new Error('Invalid OTP length. Please enter a 6-digit code.');
  }

  let user = mockDb.users.find((u) => u.phoneNumber === phoneNumber);
  if (!user) {
    user = {
      id: `usr_mock_${Date.now()}`,
      fullName: 'Devotee',
      phoneNumber,
      role: 'USER',
      isPhoneVerified: true,
      createdAt: new Date().toISOString(),
    };
    mockDb.users.push(user);
  } else {
    user.isPhoneVerified = true;
  }

  return {
    user,
    token: `mock_jwt_token_${user.id}`,
    message: 'OTP verified successfully.',
  };
}

export async function mockLogin(phoneNumber: string): Promise<{ success: boolean; message: string }> {
  await delay();
  return {
    success: true,
    message: `OTP sent to +91 ${phoneNumber}. Use 123456 to verify.`,
  };
}

export async function mockLogout(): Promise<{ success: boolean; message: string }> {
  await delay();
  return {
    success: true,
    message: 'Logged out successfully.',
  };
}

// ==========================================
// 2. PRIEST MOCK APIs
// ==========================================

export async function mockGetPriests(params?: PriestFilterParams): Promise<Priest[]> {
  await delay();
  let result = mockDb.priests.filter((p) => p.approvalStatus === 'APPROVED');

  if (params?.city) {
    result = result.filter((p) => p.city.toLowerCase() === params.city?.toLowerCase());
  }
  if (params?.language) {
    result = result.filter((p) => p.languages.includes(params.language!));
  }
  if (params?.specialization) {
    result = result.filter((p) => p.specializations.includes(params.specialization!));
  }
  if (params?.searchQuery) {
    const q = params.searchQuery.toLowerCase();
    result = result.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.displayName.toLowerCase().includes(q) ||
        p.specializations.some((s) => s.toLowerCase().includes(q))
    );
  }

  return [...result];
}

export async function mockGetPriestById(id: string): Promise<Priest> {
  await delay();
  const priest = mockDb.priests.find((p) => p.id === id);
  if (!priest) {
    throw new Error(`Priest with ID ${id} not found.`);
  }
  return { ...priest };
}

export async function mockGetPriestSlots(priestId: string, date?: string): Promise<PriestSlot[]> {
  await delay();
  let slots = mockDb.slots.filter((s) => s.priestId === priestId);
  if (date) {
    slots = slots.filter((s) => s.date === date);
  }
  return [...slots];
}

// ==========================================
// 3. RITUAL MOCK APIs
// ==========================================

export async function mockGetRituals(): Promise<Ritual[]> {
  await delay();
  return [...mockDb.rituals];
}

export async function mockGetRitualBySlug(slug: string): Promise<Ritual> {
  await delay();
  const ritual = mockDb.rituals.find((r) => r.slug === slug);
  if (!ritual) {
    throw new Error(`Ritual with slug ${slug} not found.`);
  }
  return { ...ritual };
}

// ==========================================
// 4. ADDRESS MOCK APIs
// ==========================================

export async function mockGetAddresses(userId = 'usr_mock_1'): Promise<Address[]> {
  await delay();
  return mockDb.addresses.filter((a) => a.userId === userId);
}

export async function mockGetAddressById(id: string): Promise<Address> {
  await delay();
  const address = mockDb.addresses.find((a) => a.id === id);
  if (!address) {
    throw new Error(`Address with ID ${id} not found.`);
  }
  return { ...address };
}

export async function mockCreateAddress(data: CreateAddressRequest, userId = 'usr_mock_1'): Promise<Address> {
  await delay();
  if (data.isDefault) {
    mockDb.addresses.forEach((a) => {
      if (a.userId === userId) a.isDefault = false;
    });
  }

  const newAddress: Address = {
    id: `addr_mock_${Date.now()}`,
    userId,
    label: data.label,
    recipientName: data.recipientName,
    phoneNumber: data.phoneNumber,
    houseBuilding: data.houseBuilding,
    street: data.street,
    locality: data.locality,
    landmark: data.landmark,
    pincode: data.pincode,
    city: data.city,
    district: data.district,
    state: data.state,
    country: data.country || 'India',
    isDefault: data.isDefault ?? mockDb.addresses.filter((a) => a.userId === userId).length === 0,
    createdAt: new Date().toISOString(),
  };

  mockDb.addresses.push(newAddress);
  return { ...newAddress };
}

export async function mockUpdateAddress(data: UpdateAddressRequest, userId = 'usr_mock_1'): Promise<Address> {
  await delay();
  const index = mockDb.addresses.findIndex((a) => a.id === data.id && a.userId === userId);
  if (index === -1) {
    throw new Error(`Address with ID ${data.id} not found.`);
  }

  if (data.isDefault) {
    mockDb.addresses.forEach((a) => {
      if (a.userId === userId) a.isDefault = false;
    });
  }

  mockDb.addresses[index] = {
    ...mockDb.addresses[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  return { ...mockDb.addresses[index] };
}

export async function mockDeleteAddress(id: string, userId = 'usr_mock_1'): Promise<{ success: boolean; id: string }> {
  await delay();
  const index = mockDb.addresses.findIndex((a) => a.id === id && a.userId === userId);
  if (index === -1) {
    throw new Error(`Address with ID ${id} not found.`);
  }

  mockDb.addresses.splice(index, 1);
  return { success: true, id };
}

export async function mockSetDefaultAddress(id: string, userId = 'usr_mock_1'): Promise<Address> {
  await delay();
  const target = mockDb.addresses.find((a) => a.id === id && a.userId === userId);
  if (!target) {
    throw new Error(`Address with ID ${id} not found.`);
  }

  mockDb.addresses.forEach((a) => {
    if (a.userId === userId) a.isDefault = a.id === id;
  });

  return { ...target, isDefault: true };
}

// ==========================================
// 5. BOOKING MOCK APIs
// ==========================================

export async function mockCreateBooking(data: CreateBookingRequest, userId = 'usr_mock_1'): Promise<Booking> {
  await delay();

  const priest = mockDb.priests.find((p) => p.id === data.priestId);
  const ritual = mockDb.rituals.find((r) => r.id === data.ritualId);
  const address = mockDb.addresses.find((a) => a.id === data.addressId);
  const slot = mockDb.slots.find((s) => s.id === data.slotId);

  if (!priest) throw new Error('Selected priest does not exist.');
  if (!ritual) throw new Error('Selected ritual does not exist.');
  if (!address) throw new Error('Selected address does not exist.');
  if (!slot) throw new Error('Selected time slot does not exist.');
  if (slot.status === 'BOOKED') throw new Error('This time slot has already been booked.');

  slot.status = 'BOOKED';

  const newBooking: Booking = {
    id: `bk_mock_${Date.now()}`,
    bookingReference: `PC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    userId,
    priestId: data.priestId,
    ritualId: data.ritualId,
    addressId: data.addressId,
    slotId: data.slotId,
    bookingDate: data.bookingDate,
    startTime: slot.startTime,
    endTime: slot.endTime,
    status: 'CONFIRMED',
    paymentMethod: 'OFFLINE_CASH',
    paymentStatus: 'PENDING',
    dakshinaAmount: data.dakshinaAmount || priest.dakshinaSuggested || 2100,
    specialInstructions: data.specialInstructions,
    createdAt: new Date().toISOString(),
    priest,
    ritual,
    address,
    slot,
  };

  mockDb.bookings.push(newBooking);
  return { ...newBooking };
}

export async function mockGetBookings(userId = 'usr_mock_1'): Promise<Booking[]> {
  await delay();
  return mockDb.bookings
    .filter((b) => b.userId === userId)
    .map((b) => ({
      ...b,
      priest: mockDb.priests.find((p) => p.id === b.priestId),
      ritual: mockDb.rituals.find((r) => r.id === b.ritualId),
      address: mockDb.addresses.find((a) => a.id === b.addressId),
      slot: mockDb.slots.find((s) => s.id === b.slotId),
    }));
}

export async function mockGetBookingById(id: string): Promise<Booking> {
  await delay();
  const booking = mockDb.bookings.find((b) => b.id === id);
  if (!booking) {
    throw new Error(`Booking with ID ${id} not found.`);
  }

  return {
    ...booking,
    priest: mockDb.priests.find((p) => p.id === booking.priestId),
    ritual: mockDb.rituals.find((r) => r.id === booking.ritualId),
    address: mockDb.addresses.find((a) => a.id === booking.addressId),
    slot: mockDb.slots.find((s) => s.id === booking.slotId),
  };
}

export async function mockCancelBooking(bookingId: string, reason: string): Promise<Booking> {
  await delay();
  const booking = mockDb.bookings.find((b) => b.id === bookingId);
  if (!booking) {
    throw new Error(`Booking with ID ${bookingId} not found.`);
  }

  booking.status = 'CANCELLED';
  booking.cancellationReason = reason;
  booking.cancelledBy = 'USER';
  booking.cancelledAt = new Date().toISOString();

  // Release the slot
  const slot = mockDb.slots.find((s) => s.id === booking.slotId);
  if (slot) {
    slot.status = 'AVAILABLE';
  }

  return { ...booking };
}

// ==========================================
// 6. PRIEST ONBOARDING & ADMIN MOCK APIs
// ==========================================

export async function mockRegisterPriest(data: PriestRegistrationRequest): Promise<Priest> {
  await delay();
  const newPriest: Priest = {
    id: `pr_mock_${Date.now()}`,
    fullName: data.fullName,
    displayName: `Pt. ${data.fullName.split(' ')[0]}`,
    phoneNumber: data.phoneNumber,
    email: data.email,
    isPhoneVerified: true,
    approvalStatus: 'PENDING',
    experienceYears: data.experienceYears,
    bio: data.bio,
    languages: data.languages,
    specializations: data.specializations,
    serviceAreas: data.serviceAreas,
    city: data.city,
    state: data.state,
    profileImageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
    createdAt: new Date().toISOString(),
  };

  mockDb.priests.push(newPriest);
  return { ...newPriest };
}

export async function mockVerifyPriestOtp(phoneNumber: string, otp: string): Promise<{ success: boolean; message: string }> {
  await delay();
  if (otp.length !== 6) throw new Error('Invalid OTP');
  return { success: true, message: `Priest phone ${phoneNumber} verified. Awaiting admin approval.` };
}

export async function mockGetPendingPriests(): Promise<Priest[]> {
  await delay();
  return mockDb.priests.filter((p) => p.approvalStatus === 'PENDING');
}

export async function mockApprovePriest(priestId: string): Promise<Priest> {
  await delay();
  const priest = mockDb.priests.find((p) => p.id === priestId);
  if (!priest) throw new Error('Priest not found');
  priest.approvalStatus = 'APPROVED';
  return { ...priest };
}

export async function mockRejectPriest(priestId: string): Promise<Priest> {
  await delay();
  const priest = mockDb.priests.find((p) => p.id === priestId);
  if (!priest) throw new Error('Priest not found');
  priest.approvalStatus = 'REJECTED';
  return { ...priest };
}
