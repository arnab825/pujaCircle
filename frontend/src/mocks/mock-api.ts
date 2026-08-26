import { mockDb } from './db';
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
  WeeklyAvailabilityRule,
  AvailabilityException,
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
import { slotsOverlap, calculateSlotDuration } from '@/lib/utils';
import {
  phoneLoginSchema,
  adminLoginSchema,
  sendPhoneOtpSchema,
  sendEmailOtpSchema,
  verifyPhoneOtpSchema,
  verifyEmailOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  registerUserPersonalSchema,
  registerPriestPersonalSchema,
} from '@/schemas/auth.schema';
import { addressSchema, pincodeLookupSchema } from '@/schemas/address.schema';
import {
  createBookingSchema,
  cancelBookingSchema,
  rejectBookingSchema,
  ratingSchema,
} from '@/schemas/booking.schema';
import {
  priestServiceSchema,
  baseWeeklyAvailabilityRuleSchema,
  weeklyAvailabilityRuleSchema,
  availabilityExceptionSchema,
  availabilitySlotSchema,
  updatePriestProfileSchema,
} from '@/schemas/priest.schema';
import { updateUserProfileSchema } from '@/schemas/user.schema';
import {
  adminRejectPriestSchema,
  adminBanPriestSchema,
  adminBanUserSchema,
} from '@/schemas/admin.schema';

function deepClone<T>(item: T): T {
  return JSON.parse(JSON.stringify(item));
}

function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return input.trim();
}

// ============================================================================
// 1. AUTHENTICATION & IDENTITY MOCK API
// ============================================================================

export async function mockLogin(credentials: LoginCredentials): Promise<AuthResponse> {
  await delay(350);

  const identifier = (credentials.identifier || credentials.phoneNumber || credentials.email || '').trim();
  const password = (credentials.password || '').trim();

  // Validate format
  if (identifier.includes('@')) {
    const parseResult = adminLoginSchema.safeParse({ email: identifier, password });
    if (!parseResult.success) {
      return {
        success: false,
        message: parseResult.error.errors[0]?.message || 'Invalid email address or password format.',
      };
    }
  } else {
    const parseResult = phoneLoginSchema.safeParse({ phoneNumber: identifier, password });
    if (!parseResult.success) {
      return {
        success: false,
        message: parseResult.error.errors[0]?.message || 'Invalid mobile number or password format.',
      };
    }
  }

  const normalizedPhone = normalizePhone(identifier);

  const matchedUser = mockDb.users.find((u) => {
    const phoneMatches = u.phoneNumber && normalizePhone(u.phoneNumber) === normalizedPhone;
    const emailMatches = u.email && u.email.toLowerCase() === identifier.toLowerCase();
    return (phoneMatches || emailMatches) && u.password === credentials.password;
  });

  if (!matchedUser) {
    return {
      success: false,
      message: 'Invalid credentials. Please check your mobile number or password.',
    };
  }

  // Account status check
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
    accountStatus: matchedUser.accountStatus,
    hasAddress: matchedUser.hasAddress ?? true,
  };

  return {
    success: true,
    message: `Welcome back, ${user.name}!`,
    data: { user: deepClone(user) },
  };
}

export async function mockLogout(): Promise<{ success: boolean; message: string }> {
  await delay(150);
  return {
    success: true,
    message: 'Logged out successfully.',
  };
}

export async function mockSendPhoneOtp(data: PhoneOtpRequest): Promise<{ success: boolean; message: string }> {
  await delay(250);
  const parseResult = sendPhoneOtpSchema.safeParse(data);
  if (!parseResult.success) {
    return { success: false, message: parseResult.error.errors[0]?.message || 'Invalid mobile number.' };
  }

  const otp = '123456';
  mockDb.otpRecords.push({
    identifier: data.phoneNumber,
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000,
    attempts: 0,
  });

  return {
    success: true,
    message: `One-time validation OTP sent to ${data.phoneNumber}. Use development OTP: 123456`,
  };
}

export async function mockVerifyPhoneOtp(data: VerifyPhoneOtpRequest): Promise<{ success: boolean; message: string }> {
  await delay(250);
  const parseResult = verifyPhoneOtpSchema.safeParse(data);
  if (!parseResult.success) {
    return { success: false, message: parseResult.error.errors[0]?.message || 'Invalid phone or OTP format.' };
  }

  if (data.otp === '123456') {
    return { success: true, message: 'Mobile number verified successfully.' };
  }
  return { success: false, message: 'Invalid OTP. Please enter development mock OTP: 123456.' };
}

export async function mockSendEmailOtp(data: EmailOtpRequest): Promise<{ success: boolean; message: string }> {
  await delay(250);
  const parseResult = sendEmailOtpSchema.safeParse(data);
  if (!parseResult.success) {
    return { success: false, message: parseResult.error.errors[0]?.message || 'Invalid email address.' };
  }

  return {
    success: true,
    message: `Password reset OTP sent to ${data.email}. Use development OTP: 123456`,
  };
}

export async function mockVerifyEmailOtp(data: VerifyEmailOtpRequest): Promise<{ success: boolean; message: string }> {
  await delay(250);
  const parseResult = verifyEmailOtpSchema.safeParse(data);
  if (!parseResult.success) {
    return { success: false, message: parseResult.error.errors[0]?.message || 'Invalid email or OTP format.' };
  }

  if (data.otp === '123456') {
    return { success: true, message: 'Email OTP verified successfully.' };
  }
  return { success: false, message: 'Invalid OTP. Please enter development mock OTP: 123456.' };
}

export async function mockForgotPassword(payload: { email: string }): Promise<{ success: boolean; message: string }> {
  await delay(250);
  const parseResult = forgotPasswordSchema.safeParse(payload);
  if (!parseResult.success) {
    return { success: false, message: parseResult.error.errors[0]?.message || 'Invalid email address.' };
  }
  return { success: true, message: `Password reset instructions sent to ${payload.email}.` };
}

export async function mockResetPassword(payload: {
  otp: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<{ success: boolean; message: string }> {
  await delay(300);
  const parseResult = resetPasswordSchema.safeParse(payload);
  if (!parseResult.success) {
    return { success: false, message: parseResult.error.errors[0]?.message || 'Validation failed.' };
  }
  return { success: true, message: 'Password has been successfully updated.' };
}

export async function mockRegisterUser(payload: {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
}): Promise<{ success: boolean; message: string; data?: { user: AuthUser } }> {
  await delay(350);
  const parseResult = registerUserPersonalSchema.safeParse(payload);
  if (!parseResult.success) {
    return { success: false, message: parseResult.error.errors[0]?.message || 'Registration data is invalid.' };
  }

  const existing = mockDb.users.find(
    (u) => normalizePhone(u.phoneNumber) === normalizePhone(payload.phoneNumber) || u.email === payload.email
  );
  if (existing) {
    return { success: false, message: 'A user with this mobile number or email already exists.' };
  }

  const newUser: AuthUser = {
    id: `user-devotee-${Date.now()}`,
    name: payload.fullName.trim(),
    phoneNumber: payload.phoneNumber.trim(),
    email: payload.email.trim(),
    role: 'USER',
    accountStatus: 'ACTIVE',
    hasAddress: false,
  };

  mockDb.users.push({
    id: newUser.id,
    name: newUser.name,
    phoneNumber: newUser.phoneNumber,
    email: newUser.email,
    role: 'USER',
    accountStatus: 'ACTIVE',
    hasAddress: false,
    password: payload.password,
    createdAt: new Date().toISOString(),
  });

  return {
    success: true,
    message: 'Devotee registration successful! Welcome to PujaCircle.',
    data: { user: deepClone(newUser) },
  };
}

export async function mockRegisterPriest(payload: {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
}): Promise<{ success: boolean; message: string; data?: { user: AuthUser } }> {
  await delay(350);
  const parseResult = registerPriestPersonalSchema.safeParse(payload);
  if (!parseResult.success) {
    return { success: false, message: parseResult.error.errors[0]?.message || 'Registration data is invalid.' };
  }

  const existing = mockDb.users.find(
    (u) => normalizePhone(u.phoneNumber) === normalizePhone(payload.phoneNumber) || u.email === payload.email
  );
  if (existing) {
    return { success: false, message: 'A priest with this mobile number or email already exists.' };
  }

  const priestId = `priest-${Date.now()}`;
  const newUser: AuthUser = {
    id: `user-${priestId}`,
    name: payload.fullName.trim(),
    phoneNumber: payload.phoneNumber.trim(),
    email: payload.email.trim(),
    role: 'PRIEST',
    accountStatus: 'ACTIVE',
    hasAddress: false,
  };

  mockDb.users.push({
    id: newUser.id,
    name: newUser.name,
    phoneNumber: newUser.phoneNumber,
    email: newUser.email,
    role: 'PRIEST',
    accountStatus: 'ACTIVE',
    hasAddress: false,
    password: payload.password,
    createdAt: new Date().toISOString(),
  });

  const newPriestRecord: Priest = {
    id: priestId,
    fullName: payload.fullName.trim(),
    displayName: payload.fullName.trim(),
    phoneNumber: payload.phoneNumber.trim(),
    email: payload.email.trim(),
    experienceYears: 5,
    bio: 'Vedic priest specializing in traditional rituals and home ceremonies.',
    languages: ['Hindi', 'Sanskrit'],
    specializations: ['Satyanarayan Puja', 'Griha Pravesh'],
    serviceAreas: ['Mumbai'],
    city: 'Mumbai',
    state: 'Maharashtra',
    approvalStatus: 'PENDING',
    accountStatus: 'ACTIVE',
    isPhoneVerified: true,
    profileImageUrl: '',
    createdAt: new Date().toISOString(),
  };

  mockDb.priests.push(newPriestRecord);

  return {
    success: true,
    message: 'Priest application submitted! Awaiting administrator verification.',
    data: { user: deepClone(newUser) },
  };
}

// ============================================================================
// 2. PIN CODE & ADDRESS MOCK API
// ============================================================================

export async function mockLookupPincode(pincode: string): Promise<PincodeLookupResponse> {
  await delay(200);
  const parseResult = pincodeLookupSchema.safeParse({ pincode });
  if (!parseResult.success) {
    return { pincode: pincode.trim(), locations: [] };
  }

  const cleanPin = pincode.trim();

  if (mockDb.pincodeDirectory[cleanPin]) {
    return {
      pincode: cleanPin,
      locations: deepClone(mockDb.pincodeDirectory[cleanPin]),
    };
  }

  // Generic fallback for any valid 6-digit Indian PIN code
  if (/^[1-9][0-9]{5}$/.test(cleanPin)) {
    return {
      pincode: cleanPin,
      locations: [
        {
          postOffice: `${cleanPin} Main Post Office`,
          locality: 'Urban Locality',
          villageTown: 'Town Center',
          city: 'Regional Center',
          district: 'Central District',
          state: 'State',
          country: 'India',
        },
      ],
    };
  }

  return { pincode: cleanPin, locations: [] };
}

export async function mockGetAddresses(userId: string): Promise<{ success: boolean; data: Address[] }> {
  await delay(250);
  const addresses = mockDb.addresses.filter((a) => a.userId === userId);
  return { success: true, data: deepClone(addresses) };
}

export async function mockCreateAddress(
  userId: string,
  data: CreateAddressRequest
): Promise<{ success: boolean; data?: Address; message: string }> {
  await delay(300);

  const parseResult = addressSchema.safeParse(data);
  if (!parseResult.success) {
    return {
      success: false,
      message: parseResult.error.errors[0]?.message || 'Invalid address data.',
    };
  }

  const validated = parseResult.data;

  // Enforce maximum 2 addresses rule
  const userAddresses = mockDb.addresses.filter((a) => a.userId === userId);
  if (userAddresses.length >= 2) {
    return {
      success: false,
      message: 'You cannot add more than 2 addresses. Please edit or delete an existing address.',
    };
  }

  if (validated.isDefault || userAddresses.length === 0) {
    mockDb.addresses.forEach((a) => {
      if (a.userId === userId) a.isDefault = false;
    });
  }

  const newAddress: Address = {
    id: `address-${Date.now()}`,
    userId,
    label: validated.label || 'HOME',
    recipientName: validated.recipientName || 'Devotee',
    phoneNumber: validated.phoneNumber || '',
    houseNo: validated.houseNo,
    houseBuilding: validated.houseBuilding || validated.houseNo,
    street: validated.street || '',
    locality: validated.locality || validated.villageTown,
    villageTown: validated.villageTown,
    landmark: validated.landmark || '',
    pincode: validated.pincode,
    pinCode: validated.pincode,
    city: validated.city,
    district: validated.district,
    state: validated.state,
    country: validated.country || 'India',
    isDefault: validated.isDefault !== undefined ? validated.isDefault : userAddresses.length === 0,
    createdAt: new Date().toISOString(),
  };

  mockDb.addresses.unshift(newAddress);

  const user = mockDb.users.find((u) => u.id === userId);
  if (user) user.hasAddress = true;

  return {
    success: true,
    data: deepClone(newAddress),
    message: 'Address saved successfully!',
  };
}

export async function mockSetDefaultAddress(
  userId: string,
  addressId: string
): Promise<{ success: boolean; data?: Address; message: string }> {
  await delay(250);
  const target = mockDb.addresses.find((a) => a.id === addressId && a.userId === userId);
  if (!target) {
    return { success: false, message: 'Address not found or unauthorized.' };
  }

  mockDb.addresses.forEach((a) => {
    if (a.userId === userId) {
      a.isDefault = a.id === addressId;
    }
  });

  return {
    success: true,
    data: deepClone(target),
    message: 'Default address updated successfully.',
  };
}

export async function mockUpdateAddress(
  userId: string,
  data: UpdateAddressRequest
): Promise<{ success: boolean; data?: Address; message: string }> {
  await delay(300);
  const addr = mockDb.addresses.find((a) => a.id === data.id);
  if (!addr) return { success: false, message: 'Address not found.' };
  if (addr.userId !== userId) return { success: false, message: 'Unauthorized.' };

  const parseResult = addressSchema.partial().safeParse(data);
  if (!parseResult.success) {
    return {
      success: false,
      message: parseResult.error.errors[0]?.message || 'Invalid address update payload.',
    };
  }

  const validated = parseResult.data;

  if (validated.isDefault) {
    mockDb.addresses.forEach((a) => {
      if (a.userId === userId) a.isDefault = false;
    });
  }

  if (validated.label !== undefined) addr.label = validated.label;
  if (validated.recipientName !== undefined) addr.recipientName = validated.recipientName;
  if (validated.phoneNumber !== undefined) addr.phoneNumber = validated.phoneNumber;
  if (validated.houseNo !== undefined) addr.houseNo = validated.houseNo;
  if (validated.houseBuilding !== undefined) addr.houseBuilding = validated.houseBuilding;
  if (validated.street !== undefined) addr.street = validated.street;
  if (validated.locality !== undefined) addr.locality = validated.locality;
  if (validated.villageTown !== undefined) addr.villageTown = validated.villageTown;
  if (validated.landmark !== undefined) addr.landmark = validated.landmark;
  if (validated.pincode !== undefined) {
    addr.pincode = validated.pincode;
    addr.pinCode = validated.pincode;
  }
  if (validated.city !== undefined) addr.city = validated.city;
  if (validated.district !== undefined) addr.district = validated.district;
  if (validated.state !== undefined) addr.state = validated.state;
  if (validated.isDefault !== undefined) addr.isDefault = validated.isDefault;
  addr.updatedAt = new Date().toISOString();

  return { success: true, data: deepClone(addr), message: 'Address updated successfully.' };
}

export async function mockDeleteAddress(
  addressId: string,
  userId: string
): Promise<{ success: boolean; message: string }> {
  await delay(250);
  const idx = mockDb.addresses.findIndex((a) => a.id === addressId && a.userId === userId);
  if (idx === -1) return { success: false, message: 'Address not found or unauthorized.' };

  const wasDefault = mockDb.addresses[idx].isDefault;
  mockDb.addresses.splice(idx, 1);

  // If deleted was default, make the remaining one default
  if (wasDefault) {
    const remaining = mockDb.addresses.find((a) => a.userId === userId);
    if (remaining) remaining.isDefault = true;
  }

  return { success: true, message: 'Address deleted successfully.' };
}

// ============================================================================
// 3. PRIEST PROFILE & SERVICES CATALOG MOCK API
// ============================================================================

export async function mockGetPriestServices(
  priestId: string
): Promise<{ success: boolean; data: PriestService[] }> {
  await delay(200);
  const services = mockDb.priestServices.filter((s) => s.priestId === priestId);
  return { success: true, data: deepClone(services) };
}

export async function mockCreatePriestService(
  priestId: string,
  data: { serviceName: string; price: number }
): Promise<{ success: boolean; data?: PriestService; message: string }> {
  await delay(300);

  const parseResult = priestServiceSchema.safeParse(data);
  if (!parseResult.success) {
    return {
      success: false,
      message: parseResult.error.errors[0]?.message || 'Invalid service details.',
    };
  }

  const { serviceName, price } = parseResult.data;

  // Duplicate name prevention for same priest
  const exists = mockDb.priestServices.some(
    (s) => s.priestId === priestId && s.serviceName.toLowerCase() === serviceName.toLowerCase()
  );
  if (exists) {
    return { success: false, message: `You already have a service named "${serviceName}".` };
  }

  const newService: PriestService = {
    id: `service-${Date.now()}`,
    priestId,
    serviceName,
    price,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  mockDb.priestServices.push(newService);
  return { success: true, data: deepClone(newService), message: 'Service created successfully!' };
}

export async function mockUpdatePriestService(
  serviceId: string,
  priestId: string,
  data: { serviceName?: string; price?: number; isActive?: boolean }
): Promise<{ success: boolean; data?: PriestService; message: string }> {
  await delay(300);
  const service = mockDb.priestServices.find((s) => s.id === serviceId);
  if (!service) return { success: false, message: 'Service not found.' };
  if (service.priestId !== priestId) return { success: false, message: 'Unauthorized: Not your service.' };

  const parseResult = priestServiceSchema.partial().safeParse(data);
  if (!parseResult.success) {
    return {
      success: false,
      message: parseResult.error.errors[0]?.message || 'Invalid service update payload.',
    };
  }

  const validated = parseResult.data;

  if (validated.serviceName !== undefined) service.serviceName = validated.serviceName.trim();
  if (validated.price !== undefined) service.price = validated.price;
  if (validated.isActive !== undefined) service.isActive = validated.isActive;
  service.updatedAt = new Date().toISOString();

  return { success: true, data: deepClone(service), message: 'Service updated successfully.' };
}

export async function mockDeletePriestService(
  serviceId: string,
  priestId: string
): Promise<{ success: boolean; message: string }> {
  await delay(250);
  const idx = mockDb.priestServices.findIndex((s) => s.id === serviceId && s.priestId === priestId);
  if (idx === -1) return { success: false, message: 'Service not found or unauthorized.' };

  mockDb.priestServices.splice(idx, 1);
  return { success: true, message: 'Service deleted successfully.' };
}

export async function mockTogglePriestService(
  serviceId: string,
  priestId: string
): Promise<{ success: boolean; data?: PriestService; message: string }> {
  await delay(250);
  const service = mockDb.priestServices.find((s) => s.id === serviceId);
  if (!service) return { success: false, message: 'Service not found.' };
  if (service.priestId !== priestId) return { success: false, message: 'Unauthorized.' };

  service.isActive = !service.isActive;
  service.updatedAt = new Date().toISOString();

  return {
    success: true,
    data: deepClone(service),
    message: `Service ${service.isActive ? 'activated' : 'paused'} successfully.`,
  };
}

export async function mockGetPriests(params?: PriestFilterParams): Promise<{ success: boolean; data: Priest[] }> {
  await delay(300);

  let list = mockDb.priests.map((p) => ({
    ...p,
    services: mockDb.priestServices.filter((s) => s.priestId === p.id && s.isActive),
  }));

  // Public discovery rule: Only APPROVED and ACTIVE priests appear
  if (!params?.status || params.status !== 'ALL') {
    list = list.filter((p) => p.approvalStatus === 'APPROVED' && p.accountStatus === 'ACTIVE');
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

  return { success: true, data: deepClone(list) };
}

export async function mockGetPriestById(
  priestId: string
): Promise<{ success: boolean; data?: Priest; message?: string }> {
  await delay(250);
  const priest = mockDb.priests.find((p) => p.id === priestId);
  if (!priest) {
    return { success: false, message: 'Priest not found.' };
  }

  const populatedPriest: Priest = {
    ...priest,
    services: mockDb.priestServices.filter((s) => s.priestId === priest.id && s.isActive),
  };

  return { success: true, data: deepClone(populatedPriest) };
}

export async function mockUpdatePriestProfile(
  priestId: string,
  updates: Partial<Priest>
): Promise<{ success: boolean; data?: Priest; message: string }> {
  await delay(300);

  const parseResult = updatePriestProfileSchema.safeParse(updates);
  if (!parseResult.success) {
    return {
      success: false,
      message: parseResult.error.errors[0]?.message || 'Invalid priest profile updates.',
    };
  }

  const priest = mockDb.priests.find((p) => p.id === priestId);
  if (!priest) return { success: false, message: 'Priest not found.' };

  const valid = parseResult.data;
  if (valid.fullName !== undefined) priest.fullName = valid.fullName.trim();
  if (valid.displayName !== undefined) priest.displayName = valid.displayName.trim();
  if (valid.experienceYears !== undefined) priest.experienceYears = Number(valid.experienceYears);
  if (valid.bio !== undefined) priest.bio = valid.bio.trim();
  if (valid.languages !== undefined) priest.languages = valid.languages;
  if (valid.specializations !== undefined) priest.specializations = valid.specializations;
  if (valid.serviceAreas !== undefined) priest.serviceAreas = valid.serviceAreas;
  if (valid.city !== undefined) priest.city = valid.city.trim();
  if (valid.state !== undefined) priest.state = valid.state.trim();
  if (valid.profileImageUrl !== undefined) priest.profileImageUrl = valid.profileImageUrl.trim();
  priest.updatedAt = new Date().toISOString();

  return {
    success: true,
    data: {
      ...deepClone(priest),
      services: deepClone(mockDb.priestServices.filter((s) => s.priestId === priest.id && s.isActive)),
    },
    message: 'Profile & credentials updated successfully!',
  };
}

export async function mockGetRituals(): Promise<{ success: boolean; data: Ritual[] }> {
  await delay(200);
  return { success: true, data: deepClone(mockDb.rituals) };
}

// ============================================================================
// 4. RECURRING PRIEST AVAILABILITY & EXCEPTION ENGINE
// ============================================================================

export async function mockGetWeeklyAvailability(
  priestId: string
): Promise<{ success: boolean; data: WeeklyAvailabilityRule[] }> {
  await delay(250);
  const rules = mockDb.weeklyAvailabilityRules.filter((r) => r.priestId === priestId);
  return { success: true, data: deepClone(rules) };
}

export async function mockCreateWeeklyAvailabilityRule(
  priestId: string,
  payload: Omit<WeeklyAvailabilityRule, 'id' | 'priestId' | 'createdAt'>
): Promise<{ success: boolean; data?: WeeklyAvailabilityRule; message: string }> {
  await delay(300);

  const parseResult = weeklyAvailabilityRuleSchema.safeParse(payload);
  if (!parseResult.success) {
    return {
      success: false,
      message: parseResult.error.errors[0]?.message || 'Invalid weekly schedule rule format.',
    };
  }

  const validated = parseResult.data;

  const priest = mockDb.priests.find((p) => p.id === priestId);
  if (!priest) return { success: false, message: 'Priest not found.' };
  if (priest.accountStatus === 'BANNED') {
    return { success: false, message: 'Banned priest accounts cannot manage availability.' };
  }

  // Validate time range
  const duration = calculateSlotDuration(validated.startTime, validated.endTime);
  if (duration < validated.slotDurationMinutes) {
    return {
      success: false,
      message: `Time range must fit at least one ${validated.slotDurationMinutes}-minute slot.`,
    };
  }

  // Check for overlap with existing rules on the same weekday
  const existingRules = mockDb.weeklyAvailabilityRules.filter(
    (r) => r.priestId === priestId && r.dayOfWeek === validated.dayOfWeek && r.isActive
  );

  for (const existing of existingRules) {
    if (slotsOverlap(existing, validated)) {
      return {
        success: false,
        message: `This time range overlaps with an existing schedule on this day (${existing.startTime} - ${existing.endTime}).`,
      };
    }
  }

  const newRule: WeeklyAvailabilityRule = {
    id: `rule-${Date.now()}`,
    priestId,
    dayOfWeek: validated.dayOfWeek,
    startTime: validated.startTime,
    endTime: validated.endTime,
    slotDurationMinutes: validated.slotDurationMinutes || 60,
    bufferMinutes: validated.bufferMinutes || 0,
    isActive: validated.isActive ?? true,
    createdAt: new Date().toISOString(),
  };

  mockDb.weeklyAvailabilityRules.push(newRule);
  return { success: true, data: deepClone(newRule), message: 'Weekly schedule rule created!' };
}

export async function mockUpdateWeeklyAvailabilityRule(
  ruleId: string,
  priestId: string,
  payload: Partial<WeeklyAvailabilityRule>
): Promise<{ success: boolean; data?: WeeklyAvailabilityRule; message: string }> {
  await delay(300);
  const rule = mockDb.weeklyAvailabilityRules.find((r) => r.id === ruleId);
  if (!rule) return { success: false, message: 'Schedule rule not found.' };
  if (rule.priestId !== priestId) return { success: false, message: 'Unauthorized.' };

  const parseResult = baseWeeklyAvailabilityRuleSchema.partial().safeParse(payload);
  if (!parseResult.success) {
    return {
      success: false,
      message: parseResult.error.errors[0]?.message || 'Invalid rule update format.',
    };
  }

  const validated = parseResult.data;

  const targetStart = validated.startTime || rule.startTime;
  const targetEnd = validated.endTime || rule.endTime;
  const targetDay = validated.dayOfWeek !== undefined ? validated.dayOfWeek : rule.dayOfWeek;
  const targetDuration = validated.slotDurationMinutes || rule.slotDurationMinutes;

  if (calculateSlotDuration(targetStart, targetEnd) < targetDuration) {
    return { success: false, message: 'Time range must fit at least one slot duration.' };
  }

  // Check overlap with OTHER rules on the same day
  const otherRules = mockDb.weeklyAvailabilityRules.filter(
    (r) => r.id !== ruleId && r.priestId === priestId && r.dayOfWeek === targetDay && r.isActive
  );

  for (const other of otherRules) {
    if (slotsOverlap(other, { startTime: targetStart, endTime: targetEnd })) {
      return {
        success: false,
        message: `Updated time overlaps with another schedule on this day (${other.startTime} - ${other.endTime}).`,
      };
    }
  }

  if (validated.dayOfWeek !== undefined) rule.dayOfWeek = validated.dayOfWeek;
  if (validated.startTime !== undefined) rule.startTime = validated.startTime;
  if (validated.endTime !== undefined) rule.endTime = validated.endTime;
  if (validated.slotDurationMinutes !== undefined) rule.slotDurationMinutes = validated.slotDurationMinutes;
  if (validated.bufferMinutes !== undefined) rule.bufferMinutes = validated.bufferMinutes;
  if (validated.isActive !== undefined) rule.isActive = validated.isActive;
  rule.updatedAt = new Date().toISOString();

  return { success: true, data: deepClone(rule), message: 'Schedule rule updated successfully.' };
}

export async function mockDeleteWeeklyAvailabilityRule(
  ruleId: string,
  priestId: string
): Promise<{ success: boolean; message: string }> {
  await delay(250);
  const idx = mockDb.weeklyAvailabilityRules.findIndex((r) => r.id === ruleId && r.priestId === priestId);
  if (idx === -1) return { success: false, message: 'Schedule rule not found or unauthorized.' };

  mockDb.weeklyAvailabilityRules.splice(idx, 1);
  return { success: true, message: 'Schedule rule removed successfully.' };
}

export async function mockGetAvailabilityExceptions(
  priestId: string
): Promise<{ success: boolean; data: AvailabilityException[] }> {
  await delay(200);
  const exceptions = mockDb.availabilityExceptions.filter((e) => e.priestId === priestId);
  return { success: true, data: deepClone(exceptions) };
}

export async function mockCreateAvailabilityException(
  priestId: string,
  payload: Omit<AvailabilityException, 'id' | 'priestId' | 'createdAt'>
): Promise<{ success: boolean; data?: AvailabilityException; message: string }> {
  await delay(300);

  const parseResult = availabilityExceptionSchema.safeParse(payload);
  if (!parseResult.success) {
    return {
      success: false,
      message: parseResult.error.errors[0]?.message || 'Invalid date exception format.',
    };
  }

  const validated = parseResult.data;

  // Replace any existing exception on that exact date
  const existingIdx = mockDb.availabilityExceptions.findIndex(
    (e) => e.priestId === priestId && e.date === validated.date
  );

  const newException: AvailabilityException = {
    id: `exc-${Date.now()}`,
    priestId,
    date: validated.date,
    type: validated.type,
    reason: validated.reason,
    customSlots: validated.customSlots,
    createdAt: new Date().toISOString(),
  };

  if (existingIdx !== -1) {
    mockDb.availabilityExceptions[existingIdx] = newException;
  } else {
    mockDb.availabilityExceptions.push(newException);
  }

  return {
    success: true,
    data: deepClone(newException),
    message: `Date exception saved for ${validated.date}.`,
  };
}

export async function mockDeleteAvailabilityException(
  exceptionId: string,
  priestId: string
): Promise<{ success: boolean; message: string }> {
  await delay(250);
  const idx = mockDb.availabilityExceptions.findIndex((e) => e.id === exceptionId && e.priestId === priestId);
  if (idx === -1) return { success: false, message: 'Date exception not found or unauthorized.' };

  mockDb.availabilityExceptions.splice(idx, 1);
  return { success: true, message: 'Date exception removed.' };
}

export async function mockGetAvailableSlotsForDate(
  priestId: string,
  dateString: string
): Promise<{ success: boolean; data: PriestSlot[]; message?: string }> {
  await delay(250);

  const targetDate = new Date(dateString);
  if (isNaN(targetDate.getTime())) {
    return { success: false, data: [], message: 'Invalid calendar date.' };
  }

  const dayOfWeek = targetDate.getDay(); // 0 = Sun, 1 = Mon...

  // Check for Date Exception
  const exception = mockDb.availabilityExceptions.find(
    (e) => e.priestId === priestId && e.date === dateString
  );

  if (exception && exception.type === 'BLOCKED') {
    return {
      success: true,
      data: [
        {
          id: `slot-blocked-${dateString}`,
          priestId,
          date: dateString,
          startTime: '00:00',
          endTime: '23:59',
          status: 'BLOCKED',
          isException: true,
        },
      ],
      message: exception.reason || 'Priest is unavailable on this date.',
    };
  }

  const generatedSlots: PriestSlot[] = [];

  if (exception && exception.type === 'CUSTOM' && exception.customSlots) {
    // Generate from custom slots
    exception.customSlots.forEach((cs, i) => {
      generatedSlots.push({
        id: `slot-custom-${dateString}-${i}`,
        priestId,
        date: dateString,
        startTime: cs.startTime,
        endTime: cs.endTime,
        status: 'AVAILABLE',
        isException: true,
      });
    });
  } else {
    // Generate from weekly rules
    const rules = mockDb.weeklyAvailabilityRules.filter(
      (r) => r.priestId === priestId && r.dayOfWeek === dayOfWeek && r.isActive
    );

    for (const rule of rules) {
      const [startH, startM] = rule.startTime.split(':').map(Number);
      const [endH, endM] = rule.endTime.split(':').map(Number);

      const startTotal = startH * 60 + startM;
      const endTotal = endH * 60 + endM;
      const step = rule.slotDurationMinutes + rule.bufferMinutes;

      let current = startTotal;
      let slotIdx = 0;

      while (current + rule.slotDurationMinutes <= endTotal) {
        const slotStartH = Math.floor(current / 60);
        const slotStartM = current % 60;
        const slotEndMinutes = current + rule.slotDurationMinutes;
        const slotEndH = Math.floor(slotEndMinutes / 60);
        const slotEndM = slotEndMinutes % 60;

        const startTime = `${String(slotStartH).padStart(2, '0')}:${String(slotStartM).padStart(2, '0')}`;
        const endTime = `${String(slotEndH).padStart(2, '0')}:${String(slotEndM).padStart(2, '0')}`;

        generatedSlots.push({
          id: `slot-gen-${rule.id}-${dateString}-${slotIdx}`,
          priestId,
          date: dateString,
          startTime,
          endTime,
          status: 'AVAILABLE',
          ruleId: rule.id,
        });

        current += step;
        slotIdx++;
      }
    }
  }

  // Check active bookings on that date (PENDING or CONFIRMED)
  const activeBookings = mockDb.bookings.filter(
    (b) => b.priestId === priestId && b.bookingDate === dateString && (b.status === 'PENDING' || b.status === 'CONFIRMED')
  );

  for (const slot of generatedSlots) {
    const isBooked = activeBookings.some((b) => slotsOverlap(slot, b));
    if (isBooked) {
      slot.status = 'BOOKED';
    }
  }

  // Also include any pre-seeded compatibility slots for that date
  const staticSlots = mockDb.availabilitySlots.filter((s) => s.priestId === priestId && s.date === dateString);
  for (const s of staticSlots) {
    if (!generatedSlots.some((g) => g.startTime === s.startTime && g.endTime === s.endTime)) {
      generatedSlots.push(deepClone(s));
    }
  }

  // Sort chronologically
  generatedSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

  return { success: true, data: generatedSlots };
}

// Backward compatibility slot methods for legacy callers
export async function mockGetPriestSlots(priestId: string, date?: string): Promise<{ success: boolean; data: PriestSlot[] }> {
  if (date) {
    return mockGetAvailableSlotsForDate(priestId, date);
  }
  await delay(200);
  const slots = mockDb.availabilitySlots.filter((s) => s.priestId === priestId);
  return { success: true, data: deepClone(slots) };
}

export async function mockCreatePriestSlot(
  priestId: string,
  data: { date: string; startTime: string; endTime: string }
): Promise<{ success: boolean; data?: PriestSlot; message: string }> {
  await delay(250);

  const parseResult = availabilitySlotSchema.safeParse(data);
  if (!parseResult.success) {
    return {
      success: false,
      message: parseResult.error.errors[0]?.message || 'Invalid slot timing format.',
    };
  }

  const valid = parseResult.data;
  const newSlot: PriestSlot = {
    id: `slot-${Date.now()}`,
    priestId,
    date: valid.date,
    startTime: valid.startTime,
    endTime: valid.endTime,
    status: 'AVAILABLE',
  };
  mockDb.availabilitySlots.unshift(newSlot);
  return { success: true, data: newSlot, message: 'Slot created successfully.' };
}

export async function mockDeleteSlot(slotId: string, priestId: string): Promise<{ success: boolean; message: string }> {
  await delay(200);
  const idx = mockDb.availabilitySlots.findIndex((s) => s.id === slotId && s.priestId === priestId);
  if (idx !== -1) mockDb.availabilitySlots.splice(idx, 1);
  return { success: true, message: 'Slot removed.' };
}

export async function mockToggleSlotStatus(
  slotId: string,
  priestId: string,
  newStatus: 'AVAILABLE' | 'BLOCKED'
): Promise<{ success: boolean; message: string }> {
  await delay(200);
  const slot = mockDb.availabilitySlots.find((s) => s.id === slotId && s.priestId === priestId);
  if (slot) slot.status = newStatus;
  return { success: true, message: `Slot status updated to ${newStatus}.` };
}

// ============================================================================
// 5. BOOKINGS & RATINGS MOCK API
// ============================================================================

export async function mockGetBookings(
  userId?: string,
  priestId?: string
): Promise<{ success: boolean; data: Booking[] }> {
  await delay(300);

  let list = mockDb.bookings;
  if (userId) list = list.filter((b) => b.userId === userId);
  if (priestId) list = list.filter((b) => b.priestId === priestId);

  // Auto-expire pending requests past 5 hours
  const now = Date.now();
  list.forEach((b) => {
    if (b.status === 'PENDING' && b.responseDeadline && new Date(b.responseDeadline).getTime() < now) {
      b.status = 'EXPIRED';
      const slot = mockDb.availabilitySlots.find((s) => s.id === b.slotId);
      if (slot && slot.status === 'BOOKED') slot.status = 'AVAILABLE';
    }
  });

  // Populate joined relations
  const populated = list.map((b) => {
    const devotee = mockDb.users.find((u) => u.id === b.userId);
    return {
      ...b,
      user: devotee
        ? { id: devotee.id, name: devotee.name, phoneNumber: devotee.phoneNumber, email: devotee.email }
        : undefined,
      userName: devotee?.name,
      userPhone: devotee?.phoneNumber,
      priest: mockDb.priests.find((p) => p.id === b.priestId),
      priestService: mockDb.priestServices.find((s) => s.id === b.priestServiceId),
      ritual: mockDb.rituals.find((r) => r.id === b.ritualId),
      address: mockDb.addresses.find((a) => a.id === b.addressId),
      slot: mockDb.availabilitySlots.find((s) => s.id === b.slotId),
    };
  });

  return { success: true, data: deepClone(populated) };
}

export async function mockGetBookingById(
  bookingId: string
): Promise<{ success: boolean; data?: Booking; message?: string }> {
  await delay(250);
  const booking = mockDb.bookings.find((b) => b.id === bookingId);
  if (!booking) return { success: false, message: 'Booking not found.' };

  const devotee = mockDb.users.find((u) => u.id === booking.userId);

  return {
    success: true,
    data: deepClone({
      ...booking,
      user: devotee
        ? { id: devotee.id, name: devotee.name, phoneNumber: devotee.phoneNumber, email: devotee.email }
        : undefined,
      userName: devotee?.name,
      userPhone: devotee?.phoneNumber,
      priest: mockDb.priests.find((p) => p.id === booking.priestId),
      priestService: mockDb.priestServices.find((s) => s.id === booking.priestServiceId),
      ritual: mockDb.rituals.find((r) => r.id === booking.ritualId),
      address: mockDb.addresses.find((a) => a.id === booking.addressId),
      slot: mockDb.availabilitySlots.find((s) => s.id === booking.slotId),
    }),
  };
}

export async function mockCreateBooking(
  userId: string,
  request: CreateBookingRequest
): Promise<{ success: boolean; data?: Booking; message: string }> {
  await delay(450);

  const parseResult = createBookingSchema.safeParse(request);
  if (!parseResult.success) {
    return {
      success: false,
      message: parseResult.error.errors[0]?.message || 'Invalid booking request parameters.',
    };
  }

  const validated = parseResult.data;

  // 1. Check user account status
  const user = mockDb.users.find((u) => u.id === userId);
  if (user && (user.accountStatus === 'BANNED' || user.status === 'BANNED')) {
    return { success: false, message: 'Your account is banned. Booking actions are disabled.' };
  }

  // 2. Check priest approval and account status
  const priest = mockDb.priests.find((p) => p.id === validated.priestId);
  if (!priest || priest.approvalStatus !== 'APPROVED') {
    return { success: false, message: 'Selected priest is not available or pending verification.' };
  }
  if (priest.accountStatus === 'BANNED') {
    return { success: false, message: 'Selected priest account is currently suspended.' };
  }

  // 3. Verify address ownership
  const address = mockDb.addresses.find((a) => a.id === validated.addressId && a.userId === userId);
  if (!address) {
    return { success: false, message: 'Please select a valid saved address.' };
  }

  // 4. Retrieve authoritative price from PriestService snapshot
  let serviceName = 'Vedic Ceremony';
  let authoritativePrice = 2100;

  if (validated.priestServiceId) {
    const srv = mockDb.priestServices.find(
      (s) => s.id === validated.priestServiceId && s.priestId === validated.priestId
    );
    if (!srv) {
      return { success: false, message: 'Selected service does not belong to this priest.' };
    }
    serviceName = srv.serviceName;
    authoritativePrice = srv.price;
  } else if (validated.ritualId) {
    const rit = mockDb.rituals.find((r) => r.id === validated.ritualId);
    if (rit) {
      serviceName = rit.name;
      authoritativePrice = rit.suggestedDakshina || 2500;
    }
  }

  // 5. Determine slot timing and check double booking
  const targetSlotId = validated.slotId || validated.availabilitySlotId || `slot-${Date.now()}`;
  let startTime = validated.startTime || '09:00';
  let endTime = validated.endTime || '12:00';

  const existingSlot = mockDb.availabilitySlots.find((s) => s.id === targetSlotId);
  if (existingSlot) {
    if (existingSlot.status !== 'AVAILABLE') {
      return { success: false, message: 'The selected time slot is no longer available.' };
    }
    startTime = existingSlot.startTime;
    endTime = existingSlot.endTime;
    existingSlot.status = 'BOOKED';
  }

  // Check active booking conflicts on same priest, date, and overlapping time
  const conflict = mockDb.bookings.some(
    (b) =>
      b.priestId === validated.priestId &&
      b.bookingDate === validated.bookingDate &&
      (b.status === 'PENDING' || b.status === 'CONFIRMED') &&
      slotsOverlap({ startTime, endTime }, { startTime: b.startTime, endTime: b.endTime })
  );

  if (conflict) {
    return { success: false, message: 'This priest already has a booking scheduled during this time.' };
  }

  // 6. Set 5-hour response deadline
  const now = new Date();
  const deadline = new Date(now.getTime() + 5 * 60 * 60 * 1000).toISOString();

  const newBooking: Booking = {
    id: `booking-${Date.now()}`,
    bookingReference: `PC-${Math.floor(1000 + Math.random() * 9000)}`,
    userId,
    priestId: validated.priestId,
    priestServiceId: validated.priestServiceId,
    ritualId: validated.ritualId,
    addressId: validated.addressId,
    slotId: targetSlotId,
    availabilitySlotId: targetSlotId,
    serviceName,
    servicePrice: authoritativePrice,
    dakshinaAmount: authoritativePrice,
    bookingDate: validated.bookingDate,
    startTime,
    endTime,
    status: 'PENDING',
    paymentMethod: 'OFFLINE_CASH',
    paymentStatus: 'PENDING',
    specialInstructions: validated.specialInstructions || validated.userNotes || '',
    userNotes: validated.userNotes || validated.specialInstructions || '',
    responseDeadline: deadline,
    createdAt: now.toISOString(),
  };

  mockDb.bookings.unshift(newBooking);

  return {
    success: true,
    data: deepClone(newBooking),
    message: 'Booking request submitted! Priest has 5 hours to accept.',
  };
}

export async function mockAcceptBooking(
  bookingId: string,
  priestId: string
): Promise<{ success: boolean; data?: Booking; message: string }> {
  await delay(300);

  const booking = mockDb.bookings.find((b) => b.id === bookingId);
  if (!booking) return { success: false, message: 'Booking not found.' };
  if (booking.priestId !== priestId) return { success: false, message: 'Unauthorized: Not your booking.' };

  // Check 5-hour SLA
  if (booking.responseDeadline && new Date(booking.responseDeadline).getTime() < Date.now()) {
    booking.status = 'EXPIRED';
    const slot = mockDb.availabilitySlots.find((s) => s.id === booking.slotId);
    if (slot) slot.status = 'AVAILABLE';
    return { success: false, message: 'Booking request has expired (5-hour response window elapsed).' };
  }

  if (booking.status !== 'PENDING') {
    return { success: false, message: `Cannot accept booking in "${booking.status}" status.` };
  }

  booking.status = 'CONFIRMED';
  booking.updatedAt = new Date().toISOString();

  return { success: true, data: deepClone(booking), message: 'Booking confirmed!' };
}

export async function mockRejectBooking(
  bookingId: string,
  priestId: string,
  reason: string = 'Unavailable'
): Promise<{ success: boolean; data?: Booking; message: string }> {
  await delay(300);

  const parseResult = rejectBookingSchema.safeParse({ bookingId, reason });
  if (!parseResult.success) {
    return {
      success: false,
      message: parseResult.error.errors[0]?.message || 'Invalid rejection reason.',
    };
  }

  const booking = mockDb.bookings.find((b) => b.id === bookingId);
  if (!booking) return { success: false, message: 'Booking not found.' };
  if (booking.priestId !== priestId) return { success: false, message: 'Unauthorized.' };

  if (booking.status !== 'PENDING') {
    return { success: false, message: 'Can only decline pending booking requests.' };
  }

  booking.status = 'REJECTED';
  booking.rejectionReason = parseResult.data.reason;
  booking.updatedAt = new Date().toISOString();

  // Release slot
  const slot = mockDb.availabilitySlots.find((s) => s.id === booking.slotId);
  if (slot) slot.status = 'AVAILABLE';

  return { success: true, data: deepClone(booking), message: 'Booking request declined. Slot released.' };
}

export async function mockCancelBooking(
  bookingId: string,
  userId: string,
  reason: string = 'Plans changed'
): Promise<{ success: boolean; data?: Booking; message: string }> {
  await delay(300);

  const parseResult = cancelBookingSchema.safeParse({ bookingId, reason });
  if (!parseResult.success) {
    return {
      success: false,
      message: parseResult.error.errors[0]?.message || 'Invalid cancellation reason.',
    };
  }

  const booking = mockDb.bookings.find((b) => b.id === bookingId);
  if (!booking) return { success: false, message: 'Booking not found.' };
  if (booking.userId !== userId) return { success: false, message: 'Unauthorized.' };

  if (booking.status !== 'PENDING' && booking.status !== 'CONFIRMED') {
    return { success: false, message: 'Only pending or confirmed bookings can be cancelled.' };
  }

  booking.status = 'CANCELLED';
  booking.cancellationReason = parseResult.data.reason;
  booking.cancelledBy = 'USER';
  booking.cancelledAt = new Date().toISOString();

  // Release slot
  const slot = mockDb.availabilitySlots.find((s) => s.id === booking.slotId);
  if (slot) slot.status = 'AVAILABLE';

  return { success: true, data: deepClone(booking), message: 'Booking cancelled successfully.' };
}

export async function mockCompleteBooking(
  bookingId: string,
  priestId: string
): Promise<{ success: boolean; data?: Booking; message: string }> {
  await delay(300);

  const booking = mockDb.bookings.find((b) => b.id === bookingId);
  if (!booking) return { success: false, message: 'Booking not found.' };
  if (booking.priestId !== priestId) return { success: false, message: 'Unauthorized.' };

  if (booking.status !== 'CONFIRMED') {
    return { success: false, message: 'Only confirmed bookings can be marked as completed.' };
  }

  booking.status = 'COMPLETED';
  booking.paymentStatus = 'PAID_OFFLINE';
  booking.completedAt = new Date().toISOString();

  return {
    success: true,
    data: deepClone(booking),
    message: 'Ceremony marked as completed! Cash payment recorded.',
  };
}

export async function mockSubmitRating(
  userId: string,
  data: SubmitRatingRequest
): Promise<{ success: boolean; data?: Rating; message: string }> {
  await delay(350);

  const parseResult = ratingSchema.safeParse(data);
  if (!parseResult.success) {
    return {
      success: false,
      message: parseResult.error.errors[0]?.message || 'Invalid rating or review format.',
    };
  }

  const validated = parseResult.data;

  const booking = mockDb.bookings.find((b) => b.id === validated.bookingId);
  if (!booking) return { success: false, message: 'Booking not found.' };

  if (booking.userId !== userId) {
    return { success: false, message: 'Unauthorized: You can only rate your own completed bookings.' };
  }
  if (booking.status !== 'COMPLETED') {
    return { success: false, message: 'Rating is permitted only after ceremony completion.' };
  }
  if (booking.ratingSubmitted) {
    return { success: false, message: 'Rating has already been submitted for this booking.' };
  }

  const newRating: Rating = {
    id: `rating-${Date.now()}`,
    bookingId: validated.bookingId,
    userId,
    priestId: booking.priestId,
    rating: validated.rating,
    review: validated.review,
    createdAt: new Date().toISOString(),
  };

  mockDb.ratings.unshift(newRating);
  booking.ratingSubmitted = true;

  // Update priest rating average
  const priest = mockDb.priests.find((p) => p.id === booking.priestId);
  if (priest) {
    const allRatings = mockDb.ratings.filter((r) => r.priestId === priest.id);
    const sum = allRatings.reduce((acc, r) => acc + r.rating, 0);
    priest.rating = Number((sum / allRatings.length).toFixed(2));
    priest.reviewCount = allRatings.length;
  }

  return { success: true, data: deepClone(newRating), message: 'Thank you! Your rating has been recorded.' };
}

export async function mockGetPriestRatings(priestId: string): Promise<{ success: boolean; data: Rating[] }> {
  await delay(200);
  const ratings = mockDb.ratings.filter((r) => r.priestId === priestId);
  return { success: true, data: deepClone(ratings) };
}

export async function mockUpdateUserProfile(
  userId: string,
  updates: { fullName?: string; email?: string; preferredLanguage?: string }
): Promise<{ success: boolean; data?: AuthUser; message: string }> {
  await delay(300);
  const user = mockDb.users.find((u) => u.id === userId);
  if (!user) return { success: false, message: 'User not found.' };

  const parseResult = updateUserProfileSchema.safeParse(updates);
  if (!parseResult.success) {
    return {
      success: false,
      message: parseResult.error.errors[0]?.message || 'Invalid user profile data.',
    };
  }

  const validated = parseResult.data;
  if (validated.fullName !== undefined) user.name = validated.fullName.trim();
  if (validated.email !== undefined) user.email = validated.email.trim();

  const authUser: AuthUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    accountStatus: user.accountStatus,
    hasAddress: user.hasAddress ?? true,
  };

  return { success: true, data: deepClone(authUser), message: 'Profile updated successfully.' };
}

// ============================================================================
// 6. ADMINISTRATOR CONSOLE MOCK API
// ============================================================================

export async function mockAdminGetPriests(): Promise<{ success: boolean; data: Priest[] }> {
  await delay(250);
  return { success: true, data: deepClone(mockDb.priests) };
}

export async function mockAdminApprovePriest(priestId: string): Promise<{ success: boolean; message: string }> {
  await delay(250);
  const priest = mockDb.priests.find((p) => p.id === priestId);
  if (!priest) return { success: false, message: 'Priest not found.' };

  priest.approvalStatus = 'APPROVED';
  delete priest.rejectionReason;
  return { success: true, message: `Priest ${priest.fullName} has been approved.` };
}

export async function mockAdminRejectPriest(
  priestId: string,
  reason: string
): Promise<{ success: boolean; message: string }> {
  await delay(250);

  const parseResult = adminRejectPriestSchema.safeParse({ priestId, reason });
  if (!parseResult.success) {
    return {
      success: false,
      message: parseResult.error.errors[0]?.message || 'Invalid rejection reason format.',
    };
  }

  const priest = mockDb.priests.find((p) => p.id === priestId);
  if (!priest) return { success: false, message: 'Priest not found.' };

  priest.approvalStatus = 'REJECTED';
  priest.rejectionReason = parseResult.data.reason;
  return { success: true, message: 'Priest application rejected.' };
}

export async function mockAdminBanPriest(
  priestId: string,
  reason: string
): Promise<{ success: boolean; message: string }> {
  await delay(250);

  const parseResult = adminBanPriestSchema.safeParse({ priestId, reason });
  if (!parseResult.success) {
    return {
      success: false,
      message: parseResult.error.errors[0]?.message || 'Invalid ban reason format.',
    };
  }

  const priest = mockDb.priests.find((p) => p.id === priestId);
  if (!priest) return { success: false, message: 'Priest not found.' };

  priest.accountStatus = 'BANNED';
  priest.banReason = parseResult.data.reason;
  return { success: true, message: `Priest account has been banned.` };
}

export async function mockAdminUnbanPriest(priestId: string): Promise<{ success: boolean; message: string }> {
  await delay(250);
  const priest = mockDb.priests.find((p) => p.id === priestId);
  if (!priest) return { success: false, message: 'Priest not found.' };

  priest.accountStatus = 'ACTIVE';
  delete priest.banReason;
  return { success: true, message: `Priest account has been reactivated.` };
}

export async function mockAdminGetUsers(): Promise<{ success: boolean; data: any[] }> {
  await delay(250);
  return { success: true, data: deepClone(mockDb.users.filter((u) => u.role === 'USER')) };
}

export async function mockAdminBanUser(
  userId: string,
  reason: string
): Promise<{ success: boolean; message: string }> {
  await delay(250);

  const parseResult = adminBanUserSchema.safeParse({ userId, reason });
  if (!parseResult.success) {
    return {
      success: false,
      message: parseResult.error.errors[0]?.message || 'Invalid suspension reason format.',
    };
  }

  const user = mockDb.users.find((u) => u.id === userId);
  if (!user) return { success: false, message: 'User not found.' };

  user.accountStatus = 'BANNED';
  user.status = 'BANNED';
  user.banReason = parseResult.data.reason;
  return { success: true, message: 'User account suspended.' };
}

export async function mockAdminUnbanUser(userId: string): Promise<{ success: boolean; message: string }> {
  await delay(250);
  const user = mockDb.users.find((u) => u.id === userId);
  if (!user) return { success: false, message: 'User not found.' };

  user.accountStatus = 'ACTIVE';
  user.status = 'ACTIVE';
  delete user.banReason;
  return { success: true, message: 'User account reactivated.' };
}

export async function mockAdminGetDashboardStats() {
  await delay(250);

  const totalUsers = mockDb.users.filter((u) => u.role === 'USER').length;
  const activeUsers = mockDb.users.filter((u) => u.role === 'USER' && u.accountStatus === 'ACTIVE').length;
  const totalPriests = mockDb.priests.length;
  const approvedPriests = mockDb.priests.filter((p) => p.approvalStatus === 'APPROVED').length;
  const pendingPriests = mockDb.priests.filter((p) => p.approvalStatus === 'PENDING').length;
  const bannedPriests = mockDb.priests.filter((p) => p.accountStatus === 'BANNED').length;

  const totalBookings = mockDb.bookings.length;
  const confirmedBookings = mockDb.bookings.filter((b) => b.status === 'CONFIRMED').length;
  const completedBookings = mockDb.bookings.filter((b) => b.status === 'COMPLETED').length;
  const cancelledBookings = mockDb.bookings.filter((b) => b.status === 'CANCELLED').length;
  const rejectedBookings = mockDb.bookings.filter((b) => b.status === 'REJECTED').length;
  const expiredBookings = mockDb.bookings.filter((b) => b.status === 'EXPIRED').length;

  const completedAmount = mockDb.bookings
    .filter((b) => b.status === 'COMPLETED')
    .reduce((acc, b) => acc + (b.servicePrice || b.dakshinaAmount || 0), 0);

  return {
    totalUsers,
    activeUsers,
    totalPriests,
    approvedPriests,
    pendingPriests,
    bannedPriests,
    totalBookings,
    confirmedBookings,
    completedBookings,
    cancelledBookings,
    rejectedBookings,
    expiredBookings,
    completedCashAmountRecorded: completedAmount,
    completedDakshinaAmountRecorded: completedAmount,
  };
}
