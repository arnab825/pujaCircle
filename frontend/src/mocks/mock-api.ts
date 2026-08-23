import { mockUsers, mockPriests, mockRituals, mockAddresses, mockSlots, mockBookings } from './db';
import { delay } from './delay';
import {
  AuthUser,
  AuthResponse,
  LoginCredentials,
  PhoneOtpRequest,
  VerifyPhoneOtpRequest,
  EmailOtpRequest,
  VerifyEmailOtpRequest,
} from '@/types/auth.types';
import { Priest, PriestFilterParams, PriestSlot, Ritual, PriestRegistrationRequest } from '@/types/priest.types';
import { Address, CreateAddressRequest, UpdateAddressRequest, PincodeLookupResponse } from '@/types/address.types';
import { Booking, CreateBookingRequest } from '@/types/booking.types';

// ==========================================
// 1. AUTHENTICATION MOCK API
// ==========================================

function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return input.trim();
}

/**
 * Mock Login
 * Authenticates using +91 Phone Number (for USER & PRIEST) or Email (for ADMIN).
 */
export async function mockLogin(credentials: LoginCredentials): Promise<AuthResponse> {
  await delay(400);

  const identifier = (credentials.identifier || credentials.phoneNumber || credentials.email || '').trim();
  const normalizedPhone = normalizePhone(identifier);

  const matchedUser = mockUsers.find((u) => {
    const phoneMatches = u.phoneNumber && normalizePhone(u.phoneNumber) === normalizedPhone;
    const emailMatches = u.email && u.email.toLowerCase() === identifier.toLowerCase();
    return (phoneMatches || emailMatches) && u.password === credentials.password;
  });

  if (!matchedUser) {
    return {
      success: false,
      message: 'Invalid credentials. Please check your phone number/email and password or use the demo accounts.',
    };
  }

  const user: AuthUser = {
    id: matchedUser.id,
    name: matchedUser.name,
    email: matchedUser.email,
    phoneNumber: matchedUser.phoneNumber,
    role: matchedUser.role,
    hasAddress: matchedUser.hasAddress ?? true,
  };

  return {
    success: true,
    message: `Welcome back, ${user.name}!`,
    data: { user },
  };
}

export async function mockLogout(): Promise<{ success: boolean; message: string }> {
  await delay(200);
  return {
    success: true,
    message: 'Logged out successfully.',
  };
}

/**
 * One-time Phone Number Validation OTP during Account Registration (+91)
 */
export async function mockSendPhoneOtp(data: PhoneOtpRequest): Promise<{ success: boolean; message: string }> {
  await delay(300);
  return {
    success: true,
    message: `One-time validation OTP sent to ${data.phoneNumber}. Use development OTP: 123456`,
  };
}

export async function mockVerifyPhoneOtp(data: VerifyPhoneOtpRequest): Promise<{ success: boolean; message: string }> {
  await delay(300);
  if (data.otp === '123456') {
    return { success: true, message: 'Phone number validated successfully.' };
  }
  return { success: false, message: 'Invalid OTP. Please use mock OTP: 123456' };
}

/**
 * Email OTP for Forgot Password
 */
export async function mockSendEmailOtp(data: EmailOtpRequest): Promise<{ success: boolean; message: string }> {
  await delay(300);
  return {
    success: true,
    message: `Password reset OTP sent to ${data.email}. Use development OTP: 123456`,
  };
}

export async function mockVerifyEmailOtp(data: VerifyEmailOtpRequest): Promise<{ success: boolean; message: string }> {
  await delay(300);
  if (data.otp === '123456') {
    return { success: true, message: 'Email OTP verified successfully.' };
  }
  return { success: false, message: 'Invalid OTP. Please use mock OTP: 123456' };
}

// ==========================================
// 2. PIN CODE LOOKUP MOCK API
// ==========================================

export async function mockLookupPincode(pincode: string): Promise<PincodeLookupResponse> {
  await delay(300);

  const cleanPin = pincode.trim();

  if (cleanPin.startsWith('700019') || cleanPin.startsWith('700')) {
    return {
      pincode: cleanPin,
      locations: [
        {
          postOffice: 'Ballygunge Post Office',
          locality: 'Ballygunge',
          city: 'Kolkata',
          district: 'Kolkata',
          state: 'West Bengal',
          country: 'India',
        },
        {
          postOffice: 'Gariahat Road Post Office',
          locality: 'Gariahat',
          city: 'Kolkata',
          district: 'Kolkata',
          state: 'West Bengal',
          country: 'India',
        },
        {
          postOffice: 'Dover Lane Post Office',
          locality: 'Dover Terrace',
          city: 'Kolkata',
          district: 'Kolkata',
          state: 'West Bengal',
          country: 'India',
        },
      ],
    };
  }

  if (cleanPin.startsWith('560')) {
    return {
      pincode: cleanPin,
      locations: [
        {
          postOffice: 'Indiranagar Post Office',
          locality: 'Indiranagar 1st Stage',
          city: 'Bengaluru',
          district: 'Bengaluru Urban',
          state: 'Karnataka',
          country: 'India',
        },
        {
          postOffice: 'HAL 2nd Stage Post Office',
          locality: 'HAL 2nd Stage',
          city: 'Bengaluru',
          district: 'Bengaluru Urban',
          state: 'Karnataka',
          country: 'India',
        },
      ],
    };
  }

  if (cleanPin.startsWith('400')) {
    return {
      pincode: cleanPin,
      locations: [
        {
          postOffice: 'Bandra West Post Office',
          locality: 'Bandra West',
          city: 'Mumbai',
          district: 'Mumbai Suburban',
          state: 'Maharashtra',
          country: 'India',
        },
        {
          postOffice: 'Pali Hill Sub Post Office',
          locality: 'Pali Hill',
          city: 'Mumbai',
          district: 'Mumbai Suburban',
          state: 'Maharashtra',
          country: 'India',
        },
      ],
    };
  }

  // Default New Delhi
  return {
    pincode: cleanPin,
    locations: [
      {
        postOffice: 'Connaught Place Head Post Office',
        locality: 'Connaught Place',
        city: 'New Delhi',
        district: 'Central Delhi',
        state: 'Delhi',
        country: 'India',
      },
      {
        postOffice: 'Barakhamba Road Post Office',
        locality: 'Barakhamba',
        city: 'New Delhi',
        district: 'Central Delhi',
        state: 'Delhi',
        country: 'India',
      },
    ],
  };
}

// ==========================================
// 3. PRIESTS MOCK API
// ==========================================

export async function mockGetPriests(params?: PriestFilterParams): Promise<Priest[]> {
  await delay(300);
  let list = mockPriests.filter((p) => p.approvalStatus === 'APPROVED');

  if (params?.city) {
    list = list.filter((p) => p.city.toLowerCase() === params.city?.toLowerCase());
  }
  if (params?.language) {
    list = list.filter((p) => p.languages.includes(params.language!));
  }
  if (params?.specialization) {
    list = list.filter((p) => p.specializations.includes(params.specialization!));
  }
  if (params?.searchQuery) {
    const q = params.searchQuery.toLowerCase();
    list = list.filter((p) => p.fullName.toLowerCase().includes(q) || p.city.toLowerCase().includes(q));
  }

  return list;
}

export async function mockGetPriestById(id: string): Promise<Priest> {
  await delay(300);
  const priest = mockPriests.find((p) => p.id === id);
  if (!priest) throw new Error('Priest not found');
  return { ...priest };
}

export async function mockGetPriestSlots(priestId: string, date?: string): Promise<PriestSlot[]> {
  await delay(200);
  let slots = mockSlots.filter((s) => s.priestId === priestId);
  if (date) {
    slots = slots.filter((s) => s.date === date);
  }
  return slots;
}

// ==========================================
// 4. RITUALS MOCK API
// ==========================================

export async function mockGetRituals(): Promise<Ritual[]> {
  await delay(200);
  return [...mockRituals];
}

export async function mockGetRitualBySlug(slug: string): Promise<Ritual> {
  await delay(200);
  const ritual = mockRituals.find((r) => r.slug === slug);
  if (!ritual) throw new Error('Ritual not found');
  return { ...ritual };
}

// ==========================================
// 5. ADDRESSES MOCK API (CRUD)
// ==========================================

export async function mockGetAddresses(userId = 'user-devotee-1'): Promise<Address[]> {
  await delay(300);
  return mockAddresses.filter((a) => a.userId === userId);
}

export async function mockGetAddressById(id: string): Promise<Address> {
  await delay(200);
  const address = mockAddresses.find((a) => a.id === id);
  if (!address) throw new Error('Address not found');
  return { ...address };
}

export async function mockCreateAddress(data: CreateAddressRequest, userId = 'user-devotee-1'): Promise<Address> {
  await delay(400);

  if (data.isDefault) {
    for (const addr of mockAddresses) {
      if (addr.userId === userId) {
        addr.isDefault = false;
      }
    }
  }

  const newAddress: Address = {
    id: `address-${Date.now()}`,
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
    isDefault: data.isDefault || mockAddresses.filter((a) => a.userId === userId).length === 0,
    createdAt: new Date().toISOString(),
  };

  mockAddresses.push(newAddress);
  return { ...newAddress };
}

export async function mockUpdateAddress(data: UpdateAddressRequest, userId = 'user-devotee-1'): Promise<Address> {
  await delay(400);

  const index = mockAddresses.findIndex((a) => a.id === data.id && a.userId === userId);
  if (index === -1) {
    throw new Error('Address not found');
  }

  if (data.isDefault) {
    for (const addr of mockAddresses) {
      if (addr.userId === userId) {
        addr.isDefault = false;
      }
    }
  }

  mockAddresses[index] = { ...mockAddresses[index], ...data };
  return { ...mockAddresses[index] };
}

export async function mockDeleteAddress(id: string, userId = 'user-devotee-1'): Promise<{ success: boolean; id: string }> {
  await delay(300);
  const index = mockAddresses.findIndex((a) => a.id === id && a.userId === userId);
  if (index !== -1) {
    mockAddresses.splice(index, 1);
  }
  return { success: true, id };
}

export async function mockSetDefaultAddress(id: string, userId = 'user-devotee-1'): Promise<Address> {
  await delay(300);
  let updated: Address | null = null;
  for (const addr of mockAddresses) {
    if (addr.userId === userId) {
      if (addr.id === id) {
        addr.isDefault = true;
        updated = addr;
      } else {
        addr.isDefault = false;
      }
    }
  }
  if (!updated) throw new Error('Address not found');
  return { ...updated };
}

// ==========================================
// 6. BOOKINGS MOCK API
// ==========================================

export async function mockCreateBooking(data: CreateBookingRequest, userId = 'user-devotee-1'): Promise<Booking> {
  await delay(400);

  const priest = mockPriests.find((p) => p.id === data.priestId);
  const ritual = mockRituals.find((r) => r.id === data.ritualId);
  const address = mockAddresses.find((a) => a.id === data.addressId);
  const slot = mockSlots.find((s) => s.id === data.slotId);

  if (slot) {
    slot.status = 'BOOKED';
  }

  const newBooking: Booking = {
    id: `booking-${Date.now()}`,
    bookingReference: `PC-${Math.floor(1000 + Math.random() * 9000)}`,
    userId,
    priestId: data.priestId,
    ritualId: data.ritualId,
    addressId: data.addressId,
    slotId: data.slotId,
    bookingDate: data.bookingDate,
    startTime: slot?.startTime || '08:00',
    endTime: slot?.endTime || '11:00',
    status: 'CONFIRMED',
    paymentMethod: 'OFFLINE_CASH',
    paymentStatus: 'PENDING',
    dakshinaAmount: data.dakshinaAmount || priest?.dakshinaSuggested || 2100,
    specialInstructions: data.specialInstructions,
    createdAt: new Date().toISOString(),
    priest,
    ritual,
    address,
    slot,
  };

  mockBookings.push(newBooking);
  return { ...newBooking };
}

export async function mockGetBookings(userId = 'user-devotee-1'): Promise<Booking[]> {
  await delay(300);
  return mockBookings
    .filter((b) => b.userId === userId)
    .map((b) => ({
      ...b,
      priest: mockPriests.find((p) => p.id === b.priestId),
      ritual: mockRituals.find((r) => r.id === b.ritualId),
      address: mockAddresses.find((a) => a.id === b.addressId),
      slot: mockSlots.find((s) => s.id === b.slotId),
    }));
}

export async function mockGetBookingById(id: string): Promise<Booking | null> {
  await delay(300);
  const booking = mockBookings.find((b) => b.id === id);
  if (!booking) return null;
  return {
    ...booking,
    priest: mockPriests.find((p) => p.id === booking.priestId),
    ritual: mockRituals.find((r) => r.id === booking.ritualId),
    address: mockAddresses.find((a) => a.id === booking.addressId),
    slot: mockSlots.find((s) => s.id === booking.slotId),
  };
}

export async function mockCancelBooking(bookingId: string, reason: string): Promise<Booking> {
  await delay(300);
  const booking = mockBookings.find((b) => b.id === bookingId);
  if (!booking) throw new Error('Booking not found');

  booking.status = 'CANCELLED';
  booking.cancellationReason = reason;
  booking.cancelledBy = 'USER';
  booking.cancelledAt = new Date().toISOString();

  const slot = mockSlots.find((s) => s.id === booking.slotId);
  if (slot) slot.status = 'AVAILABLE';

  return { ...booking };
}

// ==========================================
// 7. PRIEST ONBOARDING & ADMIN APPROVALS
// ==========================================

export async function mockRegisterPriest(data: PriestRegistrationRequest): Promise<Priest> {
  await delay(400);
  const newPriest: Priest = {
    id: `priest-${Date.now()}`,
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

  mockPriests.push(newPriest);
  return { ...newPriest };
}

export async function mockGetPendingPriests(): Promise<Priest[]> {
  await delay(300);
  return mockPriests.filter((p) => p.approvalStatus === 'PENDING');
}

export async function mockApprovePriest(priestId: string): Promise<Priest> {
  await delay(300);
  const priest = mockPriests.find((p) => p.id === priestId);
  if (!priest) throw new Error('Priest not found');
  priest.approvalStatus = 'APPROVED';
  priest.statusReason = undefined;
  return { ...priest };
}

export async function mockRejectPriest(priestId: string, reason?: string): Promise<Priest> {
  await delay(300);
  const priest = mockPriests.find((p) => p.id === priestId);
  if (!priest) throw new Error('Priest not found');
  priest.approvalStatus = 'REJECTED';
  priest.statusReason = reason || 'Application rejected by platform administration';
  return { ...priest };
}

export async function mockGetAllPriests(params?: PriestFilterParams): Promise<Priest[]> {
  await delay(300);
  let list = [...mockPriests];

  if (params?.status && params.status !== 'ALL') {
    list = list.filter((p) => p.approvalStatus === params.status);
  }
  if (params?.city) {
    list = list.filter((p) => p.city.toLowerCase() === params.city?.toLowerCase());
  }
  if (params?.searchQuery) {
    const q = params.searchQuery.toLowerCase();
    list = list.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.phoneNumber.includes(q) ||
        (p.email && p.email.toLowerCase().includes(q))
    );
  }

  return list;
}


export async function mockBanPriest(priestId: string, reason?: string): Promise<Priest> {
  await delay(300);
  const priest = mockPriests.find((p) => p.id === priestId);
  if (!priest) throw new Error('Priest not found');
  priest.approvalStatus = 'BANNED';
  priest.statusReason = reason || 'Account banned due to platform policy violation';
  return { ...priest };
}

export async function mockReactivatePriest(priestId: string): Promise<Priest> {
  await delay(300);
  const priest = mockPriests.find((p) => p.id === priestId);
  if (!priest) throw new Error('Priest not found');
  priest.approvalStatus = 'APPROVED';
  priest.statusReason = undefined;
  return { ...priest };
}

export async function mockDeletePriest(priestId: string): Promise<{ success: boolean; message: string }> {
  await delay(300);
  const index = mockPriests.findIndex((p) => p.id === priestId);
  if (index === -1) throw new Error('Priest not found');
  mockPriests.splice(index, 1);
  return { success: true, message: 'Priest permanently removed from platform.' };
}

// ==========================================
// 8. ADMIN USER MANAGEMENT MOCK API
// ==========================================

export async function mockGetAllUsers() {
  await delay(300);
  // Return all devotees (excluding internal admin accounts from the customer list)
  return mockUsers
    .filter((u) => u.role === 'USER')
    .map((u) => ({
      id: u.id,
      name: u.name,
      phoneNumber: u.phoneNumber,
      email: u.email,
      role: u.role,
      status: u.status || 'ACTIVE',
      primaryCity: u.primaryCity || 'Mumbai',
      bookingCount: u.bookingCount || 0,
      createdAt: u.createdAt || '2026-01-01T00:00:00.000Z',
    }));
}

export async function mockUpdateUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED') {
  await delay(300);
  const user = mockUsers.find((u) => u.id === userId);
  if (!user) throw new Error('User not found');
  user.status = status;
  return { ...user };
}

export async function mockGetAllBookings(): Promise<Booking[]> {
  await delay(300);
  return [...mockBookings];
}

