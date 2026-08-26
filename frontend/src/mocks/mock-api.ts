import {
  mockUsers,
  mockPriests,
  mockPriestServices,
  mockRituals,
  mockAddresses,
  mockSlots,
  mockBookings,
  mockRatings,
  mockPincodeDirectory,
} from './db';
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
import {
  Priest,
  PriestFilterParams,
  PriestSlot,
  Ritual,
  PriestService,
} from '@/types/priest.types';
import {
  Address,
  CreateAddressRequest,
  UpdateAddressRequest,
  PincodeLookupResponse,
} from '@/types/address.types';
import {
  Booking,
  CreateBookingRequest,
  SubmitRatingRequest,
  Rating,
} from '@/types/booking.types';

// ==========================================
// 1. AUTHENTICATION MOCK API
// ==========================================

function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return input.trim();
}

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

  // Check banned state
  if (matchedUser.accountStatus === 'BANNED' || matchedUser.status === 'BANNED') {
    return {
      success: false,
      message: `Account is banned: ${matchedUser.banReason || 'Please contact platform administration.'}`,
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
  return { success: false, message: 'Invalid OTP. Please enter development mock OTP: 123456.' };
}

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
  return { success: false, message: 'Invalid OTP. Please enter development mock OTP: 123456.' };
}

// ==========================================
// 2. PIN CODE & ADDRESS MOCK API
// ==========================================

export async function mockLookupPincode(pincode: string): Promise<PincodeLookupResponse> {
  await delay(250);
  const cleanPin = pincode.trim();

  if (mockPincodeDirectory[cleanPin]) {
    return {
      pincode: cleanPin,
      locations: mockPincodeDirectory[cleanPin],
    };
  }

  // Fallback generation for any valid 6-digit Indian PIN
  return {
    pincode: cleanPin,
    locations: [
      {
        postOffice: `Postal Area (${cleanPin})`,
        locality: 'Central Locality',
        villageTown: 'Central Locality',
        city: 'Local City',
        district: 'Main District',
        state: 'Indian State',
        country: 'India',
      },
    ],
  };
}

export async function mockGetAddresses(userId: string): Promise<{ success: boolean; data: Address[] }> {
  await delay(300);
  const userAddresses = mockAddresses.filter((a) => a.userId === userId);
  return { success: true, data: userAddresses };
}

export async function mockCreateAddress(userId: string, data: CreateAddressRequest): Promise<{ success: boolean; data: Address; message: string }> {
  await delay(400);

  if (data.isDefault) {
    mockAddresses.forEach((a) => {
      if (a.userId === userId) a.isDefault = false;
    });
  }

  const newAddress: Address = {
    id: `address-${Date.now()}`,
    userId,
    label: data.label || 'HOME',
    recipientName: data.recipientName || 'Devotee',
    phoneNumber: data.phoneNumber || '+919876543210',
    houseNo: data.houseNo || data.houseBuilding || 'House 1',
    houseBuilding: data.houseBuilding || data.houseNo || 'House 1',
    street: data.street || '',
    locality: data.locality || data.villageTown || '',
    villageTown: data.villageTown || data.locality || '',
    landmark: data.landmark || '',
    pincode: data.pincode,
    pinCode: data.pincode,
    city: data.city,
    district: data.district,
    state: data.state,
    country: data.country || 'India',
    isDefault: data.isDefault ?? mockAddresses.filter((a) => a.userId === userId).length === 0,
    createdAt: new Date().toISOString(),
  };

  mockAddresses.unshift(newAddress);
  return { success: true, data: newAddress, message: 'Address saved successfully.' };
}

export async function mockUpdateAddress(userId: string, data: UpdateAddressRequest): Promise<{ success: boolean; data: Address; message: string }> {
  await delay(300);
  const idx = mockAddresses.findIndex((a) => a.id === data.id && a.userId === userId);
  if (idx === -1) {
    return { success: false, data: {} as Address, message: 'Address not found.' };
  }

  if (data.isDefault) {
    mockAddresses.forEach((a) => {
      if (a.userId === userId) a.isDefault = false;
    });
  }

  mockAddresses[idx] = {
    ...mockAddresses[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  return { success: true, data: mockAddresses[idx], message: 'Address updated successfully.' };
}

export async function mockDeleteAddress(userId: string, addressId: string): Promise<{ success: boolean; message: string }> {
  await delay(300);
  const idx = mockAddresses.findIndex((a) => a.id === addressId && a.userId === userId);
  if (idx === -1) {
    return { success: false, message: 'Address not found.' };
  }
  mockAddresses.splice(idx, 1);
  return { success: true, message: 'Address removed successfully.' };
}

// ==========================================
// 3. PRIEST SERVICES & DISCOVERY MOCK API
// ==========================================

export async function mockGetPriestServices(priestId: string): Promise<{ success: boolean; data: PriestService[] }> {
  await delay(250);
  const services = mockPriestServices.filter((s) => s.priestId === priestId);
  return { success: true, data: services };
}

export async function mockCreatePriestService(
  priestId: string,
  data: { serviceName: string; price: number }
): Promise<{ success: boolean; data?: PriestService; message: string }> {
  await delay(350);

  // Check duplicate service name for this priest
  const existing = mockPriestServices.find(
    (s) => s.priestId === priestId && s.serviceName.toLowerCase() === data.serviceName.trim().toLowerCase()
  );
  if (existing) {
    return { success: false, message: `You already offer a service named "${data.serviceName.trim()}".` };
  }

  const newService: PriestService = {
    id: `service-${Date.now()}`,
    priestId,
    serviceName: data.serviceName.trim(),
    price: Math.round(data.price),
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  mockPriestServices.unshift(newService);

  // Update priest object
  const priest = mockPriests.find((p) => p.id === priestId);
  if (priest) {
    priest.services = mockPriestServices.filter((s) => s.priestId === priestId);
  }

  return { success: true, data: newService, message: 'Service added successfully!' };
}

export async function mockUpdatePriestService(
  serviceId: string,
  priestId: string,
  data: { serviceName?: string; price?: number }
): Promise<{ success: boolean; data?: PriestService; message: string }> {
  await delay(300);
  const service = mockPriestServices.find((s) => s.id === serviceId);
  if (!service) {
    return { success: false, message: 'Service not found.' };
  }
  if (service.priestId !== priestId) {
    return { success: false, message: 'Unauthorized: You can only edit your own services.' };
  }

  if (data.serviceName) service.serviceName = data.serviceName.trim();
  if (typeof data.price === 'number') service.price = Math.round(data.price);
  service.updatedAt = new Date().toISOString();

  return { success: true, data: service, message: 'Service updated successfully.' };
}

export async function mockTogglePriestService(
  serviceId: string,
  priestId: string
): Promise<{ success: boolean; data?: PriestService; message: string }> {
  await delay(250);
  const service = mockPriestServices.find((s) => s.id === serviceId);
  if (!service) return { success: false, message: 'Service not found.' };
  if (service.priestId !== priestId) return { success: false, message: 'Unauthorized.' };

  service.isActive = !service.isActive;
  service.updatedAt = new Date().toISOString();

  return {
    success: true,
    data: service,
    message: `Service ${service.isActive ? 'activated' : 'deactivated'} successfully.`,
  };
}

export async function mockGetPriests(params?: PriestFilterParams): Promise<{ success: boolean; data: Priest[] }> {
  await delay(350);

  let list = mockPriests.map((p) => ({
    ...p,
    services: mockPriestServices.filter((s) => s.priestId === p.id && s.isActive),
  }));

  // Only approved priests appear in public discovery unless admin filter
  if (!params?.status || params.status !== 'ALL') {
    list = list.filter((p) => p.approvalStatus === 'APPROVED');
  }

  if (params?.city) {
    const cityQuery = params.city.toLowerCase();
    list = list.filter((p) => p.city.toLowerCase().includes(cityQuery));
  }

  if (params?.searchQuery) {
    const q = params.searchQuery.toLowerCase();
    list = list.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.displayName.toLowerCase().includes(q) ||
        p.specializations.some((s) => s.toLowerCase().includes(q)) ||
        (p.services && p.services.some((srv) => srv.serviceName.toLowerCase().includes(q)))
    );
  }

  if (params?.serviceName) {
    const sQuery = params.serviceName.toLowerCase();
    list = list.filter((p) => p.services && p.services.some((srv) => srv.serviceName.toLowerCase().includes(sQuery)));
  }

  if (params?.language) {
    const lang = params.language.toLowerCase();
    list = list.filter((p) => p.languages.some((l) => l.toLowerCase() === lang));
  }

  if (typeof params?.minRating === 'number') {
    list = list.filter((p) => (p.rating || 0) >= params.minRating!);
  }

  if (typeof params?.minExperience === 'number') {
    list = list.filter((p) => p.experienceYears >= params.minExperience!);
  }

  return { success: true, data: list };
}

export async function mockGetPriestById(priestId: string): Promise<{ success: boolean; data?: Priest; message?: string }> {
  await delay(300);
  const priest = mockPriests.find((p) => p.id === priestId);
  if (!priest) {
    return { success: false, message: 'Priest not found.' };
  }

  const populatedPriest: Priest = {
    ...priest,
    services: mockPriestServices.filter((s) => s.priestId === priest.id && s.isActive),
  };

  return { success: true, data: populatedPriest };
}

export async function mockGetRituals(): Promise<{ success: boolean; data: Ritual[] }> {
  await delay(250);
  return { success: true, data: mockRituals };
}

// ==========================================
// 4. SLOTS & AVAILABILITY MOCK API
// ==========================================

export async function mockGetPriestSlots(priestId: string, date?: string): Promise<{ success: boolean; data: PriestSlot[] }> {
  await delay(250);
  let slots = mockSlots.filter((s) => s.priestId === priestId);
  if (date) {
    slots = slots.filter((s) => s.date === date);
  }
  return { success: true, data: slots };
}

export async function mockCreatePriestSlot(
  priestId: string,
  data: { date: string; startTime: string; endTime: string }
): Promise<{ success: boolean; data?: PriestSlot; message: string }> {
  await delay(300);

  // Check overlap with existing active slots for this priest on that date
  const [newStartH, newStartM] = data.startTime.split(':').map(Number);
  const [newEndH, newEndM] = data.endTime.split(':').map(Number);
  const newStartMin = newStartH * 60 + newStartM;
  const newEndMin = newEndH * 60 + newEndM;

  const existingSlots = mockSlots.filter((s) => s.priestId === priestId && s.date === data.date && s.status !== 'BLOCKED');

  for (const s of existingSlots) {
    const [sH, sM] = s.startTime.split(':').map(Number);
    const [eH, eM] = s.endTime.split(':').map(Number);
    const sMin = sH * 60 + sM;
    const eMin = eH * 60 + eM;

    const hasOverlap = newStartMin < eMin && newEndMin > sMin;
    if (hasOverlap) {
      return {
        success: false,
        message: `Slot overlaps with existing slot (${s.startTime} - ${s.endTime}). Please choose another time.`,
      };
    }
  }

  const newSlot: PriestSlot = {
    id: `slot-${Date.now()}`,
    priestId,
    date: data.date,
    startTime: data.startTime,
    endTime: data.endTime,
    status: 'AVAILABLE',
  };

  mockSlots.unshift(newSlot);
  return { success: true, data: newSlot, message: 'Time slot created successfully!' };
}

export async function mockDeleteSlot(slotId: string, priestId: string): Promise<{ success: boolean; message: string }> {
  await delay(250);
  const idx = mockSlots.findIndex((s) => s.id === slotId && s.priestId === priestId);
  if (idx === -1) return { success: false, message: 'Slot not found or unauthorized.' };

  if (mockSlots[idx].status === 'BOOKED') {
    return { success: false, message: 'Cannot delete a booked slot.' };
  }

  mockSlots.splice(idx, 1);
  return { success: true, message: 'Slot deleted successfully.' };
}

export async function mockToggleSlotStatus(
  slotId: string,
  priestId: string,
  newStatus: 'AVAILABLE' | 'BLOCKED'
): Promise<{ success: boolean; message: string }> {
  await delay(250);
  const slot = mockSlots.find((s) => s.id === slotId && s.priestId === priestId);
  if (!slot) return { success: false, message: 'Slot not found or unauthorized.' };
  if (slot.status === 'BOOKED') return { success: false, message: 'Cannot block a booked slot.' };

  slot.status = newStatus;
  return { success: true, message: `Slot marked as ${newStatus.toLowerCase()}.` };
}

// ==========================================
// 5. BOOKINGS & RATINGS MOCK API
// ==========================================

export async function mockGetBookings(userId?: string, priestId?: string): Promise<{ success: boolean; data: Booking[] }> {
  await delay(350);

  let list = mockBookings;
  if (userId) list = list.filter((b) => b.userId === userId);
  if (priestId) list = list.filter((b) => b.priestId === priestId);

  // Auto-expire any pending request past 5 hours
  const now = Date.now();
  list.forEach((b) => {
    if (b.status === 'PENDING' && b.responseDeadline && new Date(b.responseDeadline).getTime() < now) {
      b.status = 'EXPIRED';
      // Release slot if expired
      const slot = mockSlots.find((s) => s.id === b.slotId);
      if (slot && slot.status === 'BOOKED') slot.status = 'AVAILABLE';
    }
  });

  // Populate references
  const populated = list.map((b) => {
    const devotee = mockUsers.find((u) => u.id === b.userId);
    return {
      ...b,
      user: devotee ? { id: devotee.id, name: devotee.name, phoneNumber: devotee.phoneNumber, email: devotee.email } : undefined,
      userName: devotee?.name,
      userPhone: devotee?.phoneNumber,
      priest: mockPriests.find((p) => p.id === b.priestId),
      priestService: mockPriestServices.find((s) => s.id === b.priestServiceId),
      ritual: mockRituals.find((r) => r.id === b.ritualId),
      address: mockAddresses.find((a) => a.id === b.addressId),
      slot: mockSlots.find((s) => s.id === b.slotId),
    };
  });

  return { success: true, data: populated };
}

export async function mockGetBookingById(bookingId: string): Promise<{ success: boolean; data?: Booking; message?: string }> {
  await delay(300);
  const booking = mockBookings.find((b) => b.id === bookingId);
  if (!booking) return { success: false, message: 'Booking not found.' };

  const devotee = mockUsers.find((u) => u.id === booking.userId);

  return {
    success: true,
    data: {
      ...booking,
      user: devotee ? { id: devotee.id, name: devotee.name, phoneNumber: devotee.phoneNumber, email: devotee.email } : undefined,
      userName: devotee?.name,
      userPhone: devotee?.phoneNumber,
      priest: mockPriests.find((p) => p.id === booking.priestId),
      priestService: mockPriestServices.find((s) => s.id === booking.priestServiceId),
      ritual: mockRituals.find((r) => r.id === booking.ritualId),
      address: mockAddresses.find((a) => a.id === booking.addressId),
      slot: mockSlots.find((s) => s.id === booking.slotId),
    },
  };
}

export async function mockCreateBooking(
  userId: string,
  request: CreateBookingRequest
): Promise<{ success: boolean; data?: Booking; message: string }> {
  await delay(500);

  // 1. Check user account status
  const user = mockUsers.find((u) => u.id === userId);
  if (user && (user.accountStatus === 'BANNED' || user.status === 'BANNED')) {
    return { success: false, message: 'Your account is banned. Booking actions are disabled.' };
  }

  // 2. Check priest approval
  const priest = mockPriests.find((p) => p.id === request.priestId);
  if (!priest || priest.approvalStatus !== 'APPROVED') {
    return { success: false, message: 'Selected priest is not available or pending verification.' };
  }

  // 3. Check slot availability & prevent double-booking
  const targetSlotId = request.slotId || request.availabilitySlotId || '';
  const slot = mockSlots.find((s) => s.id === targetSlotId);
  if (!slot || slot.status !== 'AVAILABLE') {
    return { success: false, message: 'The selected time slot is no longer available. Please choose another slot.' };
  }

  // 4. Determine service and authoritative price snapshot from DB (prevent tampering)
  let serviceName = 'Vedic Ceremony';
  let authoritativePrice = 2100;

  if (request.priestServiceId) {
    const srv = mockPriestServices.find((s) => s.id === request.priestServiceId && s.priestId === request.priestId);
    if (srv) {
      serviceName = srv.serviceName;
      authoritativePrice = srv.price;
    }
  } else if (request.ritualId) {
    const rit = mockRituals.find((r) => r.id === request.ritualId);
    if (rit) {
      serviceName = rit.name;
      authoritativePrice = rit.suggestedDakshina || 2500;
    }
  }

  // 5. Lock the slot
  slot.status = 'BOOKED';

  // 6. 5-hour response deadline
  const now = new Date();
  const deadline = new Date(now.getTime() + 5 * 60 * 60 * 1000).toISOString();

  const newBooking: Booking = {
    id: `booking-${Date.now()}`,
    bookingReference: `PC-${Math.floor(1000 + Math.random() * 9000)}`,
    userId,
    priestId: request.priestId,
    priestServiceId: request.priestServiceId,
    ritualId: request.ritualId,
    addressId: request.addressId,
    slotId: targetSlotId,
    availabilitySlotId: targetSlotId,
    serviceName,
    servicePrice: authoritativePrice,
    bookingDate: request.bookingDate,
    startTime: slot.startTime,
    endTime: slot.endTime,
    status: 'PENDING',
    paymentMethod: 'OFFLINE_CASH',
    paymentStatus: 'PENDING',
    dakshinaAmount: authoritativePrice,
    specialInstructions: request.specialInstructions || request.userNotes || '',
    userNotes: request.userNotes || request.specialInstructions || '',
    responseDeadline: deadline,
    createdAt: now.toISOString(),
  };

  mockBookings.unshift(newBooking);

  return {
    success: true,
    data: newBooking,
    message: 'Booking request submitted successfully! Pandit Ji has 5 hours to accept.',
  };
}

export async function mockAcceptBooking(
  bookingId: string,
  priestId: string
): Promise<{ success: boolean; data?: Booking; message: string }> {
  await delay(350);

  const booking = mockBookings.find((b) => b.id === bookingId);
  if (!booking) return { success: false, message: 'Booking not found.' };
  if (booking.priestId !== priestId) return { success: false, message: 'Unauthorized: Not your booking.' };

  // Check 5-hour expiry
  if (booking.responseDeadline && new Date(booking.responseDeadline).getTime() < Date.now()) {
    booking.status = 'EXPIRED';
    const slot = mockSlots.find((s) => s.id === booking.slotId);
    if (slot) slot.status = 'AVAILABLE';
    return { success: false, message: 'Booking request has expired (5-hour response window elapsed).' };
  }

  if (booking.status !== 'PENDING') {
    return { success: false, message: `Cannot accept booking with current status "${booking.status}".` };
  }

  booking.status = 'CONFIRMED';
  booking.updatedAt = new Date().toISOString();

  return { success: true, data: booking, message: 'Booking confirmed! Devotee has been notified.' };
}

export async function mockRejectBooking(
  bookingId: string,
  priestId: string,
  reason: string
): Promise<{ success: boolean; data?: Booking; message: string }> {
  await delay(350);

  const booking = mockBookings.find((b) => b.id === bookingId);
  if (!booking) return { success: false, message: 'Booking not found.' };
  if (booking.priestId !== priestId) return { success: false, message: 'Unauthorized.' };

  if (booking.status !== 'PENDING') {
    return { success: false, message: 'Can only decline pending booking requests.' };
  }

  booking.status = 'REJECTED';
  booking.rejectionReason = reason;
  booking.updatedAt = new Date().toISOString();

  // Release slot
  const slot = mockSlots.find((s) => s.id === booking.slotId);
  if (slot) slot.status = 'AVAILABLE';

  return { success: true, data: booking, message: 'Booking request declined. Slot has been freed.' };
}

export async function mockCancelBooking(
  bookingId: string,
  userId: string,
  reason: string
): Promise<{ success: boolean; data?: Booking; message: string }> {
  await delay(350);

  const booking = mockBookings.find((b) => b.id === bookingId);
  if (!booking) return { success: false, message: 'Booking not found.' };
  if (booking.userId !== userId) return { success: false, message: 'Unauthorized.' };

  if (booking.status !== 'PENDING' && booking.status !== 'CONFIRMED') {
    return { success: false, message: 'Only pending or confirmed bookings can be cancelled.' };
  }

  booking.status = 'CANCELLED';
  booking.cancellationReason = reason;
  booking.cancelledBy = 'USER';
  booking.cancelledAt = new Date().toISOString();

  // Release slot
  const slot = mockSlots.find((s) => s.id === booking.slotId);
  if (slot) slot.status = 'AVAILABLE';

  return { success: true, data: booking, message: 'Booking cancelled successfully.' };
}

export async function mockCompleteBooking(
  bookingId: string,
  priestId: string
): Promise<{ success: boolean; data?: Booking; message: string }> {
  await delay(350);

  const booking = mockBookings.find((b) => b.id === bookingId);
  if (!booking) return { success: false, message: 'Booking not found.' };
  if (booking.priestId !== priestId) return { success: false, message: 'Unauthorized.' };

  if (booking.status !== 'CONFIRMED') {
    return { success: false, message: 'Only confirmed bookings can be marked as completed.' };
  }

  booking.status = 'COMPLETED';
  booking.paymentStatus = 'PAID_OFFLINE';
  booking.completedAt = new Date().toISOString();

  return { success: true, data: booking, message: 'Ceremony marked as completed! Cash dakshina recorded.' };
}

export async function mockSubmitRating(
  userId: string,
  data: SubmitRatingRequest
): Promise<{ success: boolean; data?: Rating; message: string }> {
  await delay(400);

  const booking = mockBookings.find((b) => b.id === data.bookingId);
  if (!booking) return { success: false, message: 'Booking not found.' };

  // Strict ownership & status check
  if (booking.userId !== userId) {
    return { success: false, message: 'Unauthorized: You can only rate your own completed bookings.' };
  }
  if (booking.status !== 'COMPLETED') {
    return { success: false, message: 'Rating is only permitted after ceremony completion.' };
  }
  if (booking.ratingSubmitted) {
    return { success: false, message: 'Rating has already been submitted for this ceremony.' };
  }

  const newRating: Rating = {
    id: `rating-${Date.now()}`,
    bookingId: data.bookingId,
    userId,
    priestId: booking.priestId,
    rating: data.rating,
    review: data.review,
    createdAt: new Date().toISOString(),
  };

  mockRatings.unshift(newRating);
  booking.ratingSubmitted = true;

  // Update priest rating average
  const priest = mockPriests.find((p) => p.id === booking.priestId);
  if (priest) {
    const allPriestRatings = mockRatings.filter((r) => r.priestId === priest.id);
    const sum = allPriestRatings.reduce((acc, r) => acc + r.rating, 0);
    priest.rating = Number((sum / allPriestRatings.length).toFixed(2));
    priest.reviewCount = allPriestRatings.length;
  }

  return { success: true, data: newRating, message: 'Thank you! Your rating has been submitted.' };
}

export async function mockGetPriestRatings(priestId: string): Promise<{ success: boolean; data: Rating[] }> {
  await delay(250);
  return { success: true, data: mockRatings.filter((r) => r.priestId === priestId) };
}

// ==========================================
// 6. ADMIN MOCK API
// ==========================================

export async function mockAdminGetPriests(): Promise<{ success: boolean; data: Priest[] }> {
  await delay(300);
  return { success: true, data: mockPriests };
}

export async function mockAdminApprovePriest(priestId: string): Promise<{ success: boolean; message: string }> {
  await delay(300);
  const priest = mockPriests.find((p) => p.id === priestId);
  if (!priest) return { success: false, message: 'Priest not found.' };

  priest.approvalStatus = 'APPROVED';
  delete priest.rejectionReason;
  return { success: true, message: `Priest ${priest.fullName} has been approved.` };
}

export async function mockAdminRejectPriest(priestId: string, reason: string): Promise<{ success: boolean; message: string }> {
  await delay(300);
  const priest = mockPriests.find((p) => p.id === priestId);
  if (!priest) return { success: false, message: 'Priest not found.' };

  priest.approvalStatus = 'REJECTED';
  priest.rejectionReason = reason;
  return { success: true, message: `Priest application rejected.` };
}

export async function mockAdminBanPriest(priestId: string, reason: string): Promise<{ success: boolean; message: string }> {
  await delay(300);
  const priest = mockPriests.find((p) => p.id === priestId);
  if (!priest) return { success: false, message: 'Priest not found.' };

  priest.approvalStatus = 'BANNED';
  priest.banReason = reason;
  return { success: true, message: `Priest has been banned.` };
}

export async function mockAdminUnbanPriest(priestId: string): Promise<{ success: boolean; message: string }> {
  await delay(300);
  const priest = mockPriests.find((p) => p.id === priestId);
  if (!priest) return { success: false, message: 'Priest not found.' };

  priest.approvalStatus = 'APPROVED';
  delete priest.banReason;
  return { success: true, message: `Priest has been reinstated.` };
}

export async function mockAdminGetUsers(): Promise<{ success: boolean; data: any[] }> {
  await delay(300);
  return { success: true, data: mockUsers.filter((u) => u.role === 'USER') };
}

export async function mockAdminBanUser(userId: string, reason: string): Promise<{ success: boolean; message: string }> {
  await delay(300);
  const user = mockUsers.find((u) => u.id === userId);
  if (!user) return { success: false, message: 'User not found.' };

  user.accountStatus = 'BANNED';
  user.status = 'BANNED';
  user.banReason = reason;
  return { success: true, message: `User account suspended.` };
}

export async function mockAdminUnbanUser(userId: string): Promise<{ success: boolean; message: string }> {
  await delay(300);
  const user = mockUsers.find((u) => u.id === userId);
  if (!user) return { success: false, message: 'User not found.' };

  user.accountStatus = 'ACTIVE';
  user.status = 'ACTIVE';
  delete user.banReason;
  return { success: true, message: `User account reactivated.` };
}

export async function mockAdminGetDashboardStats() {
  await delay(300);

  const totalUsers = mockUsers.filter((u) => u.role === 'USER').length;
  const activeUsers = mockUsers.filter((u) => u.role === 'USER' && u.accountStatus !== 'BANNED').length;
  const totalPriests = mockPriests.length;
  const approvedPriests = mockPriests.filter((p) => p.approvalStatus === 'APPROVED').length;
  const pendingPriests = mockPriests.filter((p) => p.approvalStatus === 'PENDING').length;
  const totalBookings = mockBookings.length;
  const confirmedBookings = mockBookings.filter((b) => b.status === 'CONFIRMED').length;
  const completedBookings = mockBookings.filter((b) => b.status === 'COMPLETED').length;
  const cancelledBookings = mockBookings.filter((b) => b.status === 'CANCELLED').length;
  const rejectedBookings = mockBookings.filter((b) => b.status === 'REJECTED').length;
  const expiredBookings = mockBookings.filter((b) => b.status === 'EXPIRED').length;

  const completedAmount = mockBookings
    .filter((b) => b.status === 'COMPLETED')
    .reduce((acc, b) => acc + (b.dakshinaAmount || b.servicePrice || 0), 0);

  return {
    totalUsers,
    activeUsers,
    totalPriests,
    approvedPriests,
    pendingPriests,
    totalBookings,
    confirmedBookings,
    completedBookings,
    cancelledBookings,
    rejectedBookings,
    expiredBookings,
    completedDakshinaAmountRecorded: completedAmount,
  };
}
