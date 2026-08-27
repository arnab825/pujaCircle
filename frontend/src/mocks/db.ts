import { AuthUser, AccountStatus } from '@/types/auth.types';
import {
  Priest,
  Ritual,
  PriestSlot,
  PriestService,
  WeeklyAvailabilityRule,
  AvailabilityException,
} from '@/types/priest.types';
import { Address, PincodeLocation } from '@/types/address.types';
import { Booking, Rating } from '@/types/booking.types';

export interface MockUserRecord extends AuthUser {
  status?: AccountStatus;
  accountStatus: AccountStatus;
  banReason?: string;
  primaryCity?: string;
  bookingCount?: number;
  createdAt: string;
}

export interface MockDbState {
  users: MockUserRecord[];
  priests: Priest[];
  priestServices: PriestService[];
  rituals: Ritual[];
  addresses: Address[];
  weeklyAvailabilityRules: WeeklyAvailabilityRule[];
  availabilityExceptions: AvailabilityException[];
  availabilitySlots: PriestSlot[]; // Derived/calculated or compatibility cache
  bookings: Booking[];
  ratings: Rating[];
  pincodeDirectory: Record<string, PincodeLocation[]>;
  otpRecords: Array<{
    identifier: string;
    otp: string;
    expiresAt: number;
    attempts: number;
  }>;
}

/**
 * Deterministic Initial Seed Data for PujaCircle Mock Database
 */
const SEED_USERS: MockUserRecord[] = [
  {
    id: 'user-devotee-1',
    name: 'Demo User',
    phoneNumber: '+919876543210',
    email: 'user@example.demo',
    password: 'User@123',
    role: 'USER',
    hasAddress: true,
    accountStatus: 'ACTIVE',
    status: 'ACTIVE',
    primaryCity: 'Mumbai',
    bookingCount: 2,
    createdAt: '2026-01-15T00:00:00.000Z',
  },
  {
    id: 'user-devotee-2',
    name: 'Aditi Sharma',
    phoneNumber: '+919811223344',
    email: 'aditi.sharma@example.com',
    password: 'User@123',
    role: 'USER',
    hasAddress: true,
    accountStatus: 'ACTIVE',
    status: 'ACTIVE',
    primaryCity: 'Bengaluru',
    bookingCount: 3,
    createdAt: '2026-02-01T00:00:00.000Z',
  },
  {
    id: 'user-devotee-3',
    name: 'Vikram Singhania',
    phoneNumber: '+919822334455',
    email: 'vikram.s@example.com',
    password: 'User@123',
    role: 'USER',
    hasAddress: true,
    accountStatus: 'ACTIVE',
    status: 'ACTIVE',
    primaryCity: 'Kolkata',
    bookingCount: 1,
    createdAt: '2026-02-10T00:00:00.000Z',
  },
  {
    id: 'user-devotee-4',
    name: 'Meera Iyer',
    phoneNumber: '+919833445566',
    email: 'meera.iyer@example.com',
    password: 'User@123',
    role: 'USER',
    hasAddress: false,
    accountStatus: 'BANNED',
    status: 'BANNED',
    banReason: 'Violation of user safety & harassment policy',
    primaryCity: 'Chennai',
    bookingCount: 0,
    createdAt: '2026-02-15T00:00:00.000Z',
  },
  {
    id: 'user-priest-1',
    name: 'Demo Priest',
    phoneNumber: '+919876543211',
    email: 'priest@example.demo',
    password: 'Priest@123',
    role: 'PRIEST',
    accountStatus: 'ACTIVE',
    status: 'ACTIVE',
    hasAddress: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'user-admin-1',
    name: 'PujaCircle Admin',
    email: 'admin@pujacircle.demo',
    phoneNumber: '+919900011223',
    password: 'Admin@123',
    role: 'ADMIN',
    accountStatus: 'ACTIVE',
    status: 'ACTIVE',
    hasAddress: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

const SEED_PRIEST_SERVICES: PriestService[] = [
  {
    id: 'service-1',
    priestId: 'priest-1',
    serviceName: 'Griha Pravesh & Vastu Puja',
    price: 3100,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'service-2',
    priestId: 'priest-1',
    serviceName: 'Shri Satyanarayan Vrat Katha',
    price: 2100,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'service-3',
    priestId: 'priest-1',
    serviceName: 'Maha Rudrabhishek',
    price: 3500,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'service-4',
    priestId: 'priest-2',
    serviceName: 'Maha Rudrabhishek',
    price: 4100,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'service-5',
    priestId: 'priest-2',
    serviceName: 'Ganapati Havan',
    price: 2800,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'service-6',
    priestId: 'priest-3',
    serviceName: 'Griha Pravesh & Vastu Puja',
    price: 2700,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'service-7',
    priestId: 'priest-4',
    serviceName: 'Navagraha Shanti Havan',
    price: 3800,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'service-8',
    priestId: 'priest-5',
    serviceName: 'Durga & Kali Puja',
    price: 3200,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

const SEED_PRIESTS: Priest[] = [
  {
    id: 'priest-1',
    fullName: 'Pandit Ramesh Shastri',
    displayName: 'Pt. Ramesh Shastri',
    phoneNumber: '+919876543211',
    email: 'priest@example.demo',
    isPhoneVerified: true,
    isEmailVerified: true,
    approvalStatus: 'APPROVED',
    accountStatus: 'ACTIVE',
    experienceYears: 18,
    bio: 'Vedic scholar trained in Varanasi Gurukul. Specializes in Griha Pravesh, Vastu Shanti, and Satyanarayan Katha with over 18 years of ritual expertise.',
    languages: ['Hindi', 'Sanskrit', 'Marathi'],
    specializations: ['Griha Pravesh', 'Satyanarayan Katha', 'Vastu Shanti'],
    serviceAreas: ['Bandra', 'Andheri', 'Powai'],
    city: 'Mumbai',
    state: 'Maharashtra',
    profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    rating: 4.9,
    reviewCount: 84,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'priest-2',
    fullName: 'Acharya Vidyadhar Bhatt',
    displayName: 'Acharya Vidyadhar Bhatt',
    phoneNumber: '+919845098765',
    email: 'vidyadhar@example.com',
    isPhoneVerified: true,
    isEmailVerified: true,
    approvalStatus: 'APPROVED',
    accountStatus: 'ACTIVE',
    experienceYears: 24,
    bio: 'Rigveda Acharya with expertise in Ganapati Havan and Rudrabhishek. Serving devotees across South India for 24 years.',
    languages: ['Hindi', 'Sanskrit', 'Kannada'],
    specializations: ['Ganapati Havan', 'Rudrabhishek', 'Vivah Sanskar'],
    serviceAreas: ['Indiranagar', 'Koramangala', 'Whitefield'],
    city: 'Bengaluru',
    state: 'Karnataka',
    profileImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    rating: 4.95,
    reviewCount: 120,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'priest-3',
    fullName: 'Pandit Krishnakant Upadhyay',
    displayName: 'Pt. Krishnakant Upadhyay',
    phoneNumber: '+919811122334',
    email: 'krishna@example.com',
    isPhoneVerified: true,
    isEmailVerified: true,
    approvalStatus: 'PENDING',
    accountStatus: 'ACTIVE',
    experienceYears: 9,
    bio: 'Practicing purohit in Shukla Yajurveda. Experienced in family homams, namkaran, and mundan ceremonies.',
    languages: ['Hindi', 'Sanskrit'],
    specializations: ['Griha Pravesh', 'Sundarkand Path'],
    serviceAreas: ['Sector 56', 'DLF Phase 4'],
    city: 'Gurugram',
    state: 'Haryana',
    profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    rating: 4.8,
    reviewCount: 42,
    createdAt: '2026-02-15T00:00:00.000Z',
  },
  {
    id: 'priest-4',
    fullName: 'Pandit Ananda Tirtha',
    displayName: 'Pt. Ananda Tirtha',
    phoneNumber: '+919822334499',
    email: 'ananda.tirtha@example.com',
    isPhoneVerified: true,
    isEmailVerified: true,
    approvalStatus: 'PENDING',
    accountStatus: 'ACTIVE',
    experienceYears: 12,
    bio: 'Specialist in Vastu Shastra and Navagraha Shanti Havan with rigorous Gurukul credentials.',
    languages: ['Hindi', 'Sanskrit', 'Bengali'],
    specializations: ['Navagraha Shanti', 'Vastu Shastra'],
    serviceAreas: ['Salt Lake', 'New Town'],
    city: 'Kolkata',
    state: 'West Bengal',
    profileImageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200',
    rating: 4.7,
    reviewCount: 15,
    createdAt: '2026-02-18T00:00:00.000Z',
  },
  {
    id: 'priest-5',
    fullName: 'Pandit Somnath Mukherjee',
    displayName: 'Pt. Somnath Mukherjee',
    phoneNumber: '+919833441122',
    email: 'somnath@example.com',
    isPhoneVerified: true,
    isEmailVerified: true,
    approvalStatus: 'REJECTED',
    accountStatus: 'ACTIVE',
    rejectionReason: 'Invalid lineage documentation provided during verification.',
    experienceYears: 4,
    bio: 'Practicing priest for family ceremonies and local festivals.',
    languages: ['Bengali', 'Hindi'],
    specializations: ['Kali Puja', 'Durga Puja'],
    serviceAreas: ['Howrah', 'Bally'],
    city: 'Kolkata',
    state: 'West Bengal',
    profileImageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
    rating: 4.2,
    reviewCount: 6,
    createdAt: '2026-01-20T00:00:00.000Z',
  },
  {
    id: 'priest-6',
    fullName: 'Pandit Harishankar Dixit',
    displayName: 'Pt. Harishankar Dixit',
    phoneNumber: '+919899001122',
    email: 'harishankar@example.com',
    isPhoneVerified: true,
    isEmailVerified: true,
    approvalStatus: 'APPROVED',
    accountStatus: 'BANNED',
    banReason: 'Multiple no-show incidents reported by devotees.',
    experienceYears: 15,
    bio: 'Traditional priest specializing in festive havans and wedding rituals.',
    languages: ['Hindi', 'Sanskrit'],
    specializations: ['Vivah Sanskar', 'Havan'],
    serviceAreas: ['Civil Lines', 'Karol Bagh'],
    city: 'Delhi',
    state: 'Delhi',
    profileImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    rating: 3.8,
    reviewCount: 12,
    createdAt: '2026-01-10T00:00:00.000Z',
  },
  {
    id: 'priest-7',
    fullName: 'Pandit Dinanath Sharma',
    displayName: 'Pt. Dinanath Sharma',
    phoneNumber: '+919877665544',
    email: 'dinanath@example.com',
    isPhoneVerified: true,
    isEmailVerified: true,
    approvalStatus: 'APPROVED',
    accountStatus: 'ACTIVE',
    experienceYears: 7,
    bio: 'Newly onboarded Sanskrit scholar preparing custom ritual services.',
    languages: ['Hindi', 'Sanskrit'],
    specializations: ['Sundarkand Path'],
    serviceAreas: ['Har Ki Pauri', 'Kankhal'],
    city: 'Haridwar',
    state: 'Uttarakhand',
    profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    rating: 5.0,
    reviewCount: 2,
    createdAt: '2026-02-20T00:00:00.000Z',
  },
];

const SEED_RITUALS: Ritual[] = [
  {
    id: 'ritual-1',
    name: 'Griha Pravesh & Vastu Puja',
    slug: 'griha-pravesh',
    description: 'A sacred house-warming ritual performed before entering a new home to invite positive energy.',
    approximateDurationMinutes: 180,
    category: 'Grah Pravesh & Vastu',
    requirements: ['Copper Kalash', 'Coconuts', 'Mango leaves', 'Havan Samagri'],
    suggestedDakshina: 3100,
  },
  {
    id: 'ritual-2',
    name: 'Shri Satyanarayan Vrat Katha',
    slug: 'satyanarayan-katha',
    description: 'An auspicious ritual performed for health, prosperity, and family harmony.',
    approximateDurationMinutes: 120,
    category: 'Festivals & Vrats',
    requirements: ['Panchamrit', 'Banana plants', 'Tulsi leaves', 'Sheera Prasad'],
    suggestedDakshina: 2100,
  },
  {
    id: 'ritual-3',
    name: 'Maha Rudrabhishek',
    slug: 'rudrabhishek',
    description: 'Vedic chanting and abhishek offering to Lord Shiva for peace, health, and removal of obstacles.',
    approximateDurationMinutes: 150,
    category: 'Havan & Yagya',
    requirements: ['Milk', 'Curd', 'Honey', 'Ghee', 'Bael leaves', 'Gangajal'],
    suggestedDakshina: 3500,
  },
];

const SEED_ADDRESSES: Address[] = [
  {
    id: 'address-1',
    userId: 'user-devotee-1',
    label: 'HOME',
    recipientName: 'Demo User',
    phoneNumber: '+919876543210',
    houseNo: 'Flat 802',
    houseBuilding: 'Flat 802, Orchid Heights',
    street: 'Linking Road',
    locality: 'Bandra West',
    villageTown: 'Bandra West',
    landmark: 'Near National College',
    pincode: '400050',
    pinCode: '400050',
    city: 'Mumbai',
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    country: 'India',
    isDefault: true,
    createdAt: '2026-01-15T00:00:00.000Z',
  },
  {
    id: 'address-2',
    userId: 'user-devotee-1',
    label: 'OFFICE',
    recipientName: 'Demo User',
    phoneNumber: '+919876543210',
    houseNo: 'Unit 401',
    houseBuilding: 'Unit 401, Horizon Business Park',
    street: 'BKC Main Road',
    locality: 'Bandra Kurla Complex',
    villageTown: 'Bandra Kurla Complex',
    landmark: 'Opposite Diamond Market',
    pincode: '400051',
    pinCode: '400051',
    city: 'Mumbai',
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    country: 'India',
    isDefault: false,
    createdAt: '2026-02-01T00:00:00.000Z',
  },
  {
    id: 'address-3',
    userId: 'user-devotee-2',
    label: 'HOME',
    recipientName: 'Aditi Sharma',
    phoneNumber: '+919811223344',
    houseNo: 'Villa 14',
    houseBuilding: 'Villa 14, Palm Meadows',
    street: 'Pali Hill Road',
    locality: 'Bandra West',
    villageTown: 'Bandra West',
    landmark: 'Behind St. Anne High School',
    pincode: '400050',
    pinCode: '400050',
    city: 'Mumbai',
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    country: 'India',
    isDefault: true,
    createdAt: '2026-02-01T00:00:00.000Z',
  },
  {
    id: 'address-4',
    userId: 'user-devotee-3',
    label: 'HOME',
    recipientName: 'Vikram Singhania',
    phoneNumber: '+919822334455',
    houseNo: 'Apt 12B',
    houseBuilding: 'Apt 12B, Sea Crest Towers',
    street: 'Carter Road',
    locality: 'Bandra West',
    villageTown: 'Bandra West',
    landmark: 'Opposite Carter Road Promenade',
    pincode: '400050',
    pinCode: '400050',
    city: 'Mumbai',
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    country: 'India',
    isDefault: true,
    createdAt: '2026-02-10T00:00:00.000Z',
  },
];

/**
 * Weekly Recurring Availability Rules
 * Defines working schedule templates for priests.
 */
const SEED_WEEKLY_RULES: WeeklyAvailabilityRule[] = [
  // Priest-1: Pt. Ramesh Shastri (Full weekly schedule)
  // Monday: 08:00 - 12:00 (60m slots, 0 buffer) & 15:00 - 18:00 (60m slots)
  {
    id: 'rule-p1-mon-1',
    priestId: 'priest-1',
    dayOfWeek: 1, // Monday
    startTime: '08:00',
    endTime: '12:00',
    slotDurationMinutes: 60,
    bufferMinutes: 0,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'rule-p1-mon-2',
    priestId: 'priest-1',
    dayOfWeek: 1, // Monday
    startTime: '15:00',
    endTime: '18:00',
    slotDurationMinutes: 60,
    bufferMinutes: 0,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  // Tuesday: 08:00 - 12:00
  {
    id: 'rule-p1-tue',
    priestId: 'priest-1',
    dayOfWeek: 2, // Tuesday
    startTime: '08:00',
    endTime: '12:00',
    slotDurationMinutes: 60,
    bufferMinutes: 0,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  // Wednesday: 09:00 - 14:00 (60m slots, 30m buffer)
  {
    id: 'rule-p1-wed',
    priestId: 'priest-1',
    dayOfWeek: 3, // Wednesday
    startTime: '09:00',
    endTime: '14:00',
    slotDurationMinutes: 60,
    bufferMinutes: 30,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  // Thursday: 08:00 - 12:00
  {
    id: 'rule-p1-thu',
    priestId: 'priest-1',
    dayOfWeek: 4, // Thursday
    startTime: '08:00',
    endTime: '12:00',
    slotDurationMinutes: 60,
    bufferMinutes: 0,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  // Friday: 08:00 - 12:00 & 16:00 - 19:00
  {
    id: 'rule-p1-fri-1',
    priestId: 'priest-1',
    dayOfWeek: 5, // Friday
    startTime: '08:00',
    endTime: '12:00',
    slotDurationMinutes: 60,
    bufferMinutes: 0,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'rule-p1-fri-2',
    priestId: 'priest-1',
    dayOfWeek: 5, // Friday
    startTime: '16:00',
    endTime: '19:00',
    slotDurationMinutes: 60,
    bufferMinutes: 0,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  // Saturday: 07:00 - 13:00 (90m slots, 15m buffer)
  {
    id: 'rule-p1-sat',
    priestId: 'priest-1',
    dayOfWeek: 6, // Saturday
    startTime: '07:00',
    endTime: '13:00',
    slotDurationMinutes: 90,
    bufferMinutes: 15,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  // Sunday: 08:00 - 14:00 (90m slots, 15m buffer)
  {
    id: 'rule-p1-sun',
    priestId: 'priest-1',
    dayOfWeek: 0, // Sunday
    startTime: '08:00',
    endTime: '14:00',
    slotDurationMinutes: 90,
    bufferMinutes: 15,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },

  // Priest-2: Acharya Vidyadhar Bhatt
  {
    id: 'rule-p2-daily-morning',
    priestId: 'priest-2',
    dayOfWeek: 1, // Mon
    startTime: '06:00',
    endTime: '11:00',
    slotDurationMinutes: 60,
    bufferMinutes: 0,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'rule-p2-tue',
    priestId: 'priest-2',
    dayOfWeek: 2,
    startTime: '06:00',
    endTime: '11:00',
    slotDurationMinutes: 60,
    bufferMinutes: 0,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'rule-p2-sat',
    priestId: 'priest-2',
    dayOfWeek: 6,
    startTime: '07:00',
    endTime: '12:00',
    slotDurationMinutes: 60,
    bufferMinutes: 0,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

/**
 * Date-Specific Availability Exceptions
 */
const SEED_EXCEPTIONS: AvailabilityException[] = [
  {
    id: 'exc-1',
    priestId: 'priest-1',
    date: '2026-09-10',
    type: 'BLOCKED',
    reason: 'Varanasi Gurukul Temple Annual Mahasammelan',
    createdAt: '2026-02-01T00:00:00.000Z',
  },
];

/**
 * Direct Date-Based Availability Slots (AVAILABILITY_SLOTS)
 */
const SEED_SLOTS: PriestSlot[] = [
  // Past slots (Priest 1)
  {
    id: 'slot-1',
    priestId: 'priest-1',
    slotDate: '2026-08-10',
    date: '2026-08-10',
    startTime: '10:00',
    endTime: '12:00',
    status: 'BOOKED',
    bookingId: 'booking-completed-1',
  },
  {
    id: 'slot-2',
    priestId: 'priest-1',
    slotDate: '2026-08-18',
    date: '2026-08-18',
    startTime: '11:00',
    endTime: '14:00',
    status: 'AVAILABLE',
  },
  {
    id: 'slot-past-1',
    priestId: 'priest-1',
    slotDate: '2026-08-20',
    date: '2026-08-20',
    startTime: '08:00',
    endTime: '10:30',
    status: 'AVAILABLE',
  },

  // Upcoming slots (Priest 1)
  {
    id: 'slot-3',
    priestId: 'priest-1',
    slotDate: '2026-09-02',
    date: '2026-09-02',
    startTime: '08:00',
    endTime: '11:00',
    status: 'BOOKED',
  },
  {
    id: 'slot-pending-1',
    priestId: 'priest-1',
    slotDate: '2026-09-05',
    date: '2026-09-05',
    startTime: '09:00',
    endTime: '12:00',
    status: 'BOOKED',
    bookingId: 'booking-pending-1',
  },
  {
    id: 'slot-p1-sep5-afternoon',
    priestId: 'priest-1',
    slotDate: '2026-09-05',
    date: '2026-09-05',
    startTime: '14:00',
    endTime: '16:30',
    status: 'AVAILABLE',
  },
  {
    id: 'slot-pending-2',
    priestId: 'priest-1',
    slotDate: '2026-09-06',
    date: '2026-09-06',
    startTime: '07:00',
    endTime: '10:00',
    status: 'BOOKED',
    bookingId: 'booking-pending-2',
  },
  {
    id: 'slot-p1-sep6-midday',
    priestId: 'priest-1',
    slotDate: '2026-09-06',
    date: '2026-09-06',
    startTime: '11:00',
    endTime: '13:00',
    status: 'AVAILABLE',
  },
  {
    id: 'slot-pending-3',
    priestId: 'priest-1',
    slotDate: '2026-09-08',
    date: '2026-09-08',
    startTime: '10:30',
    endTime: '13:30',
    status: 'BOOKED',
    bookingId: 'booking-pending-3',
  },
  {
    id: 'slot-p1-sep10-morning',
    priestId: 'priest-1',
    slotDate: '2026-09-10',
    date: '2026-09-10',
    startTime: '10:00',
    endTime: '12:00',
    status: 'AVAILABLE',
  },
  {
    id: 'slot-p1-sep10-afternoon',
    priestId: 'priest-1',
    slotDate: '2026-09-10',
    date: '2026-09-10',
    startTime: '14:00',
    endTime: '16:00',
    status: 'AVAILABLE',
  },
  {
    id: 'slot-p1-sep11-afternoon',
    priestId: 'priest-1',
    slotDate: '2026-09-11',
    date: '2026-09-11',
    startTime: '14:00',
    endTime: '16:00',
    status: 'AVAILABLE',
  },
  {
    id: 'slot-p1-sep12-morning',
    priestId: 'priest-1',
    slotDate: '2026-09-12',
    date: '2026-09-12',
    startTime: '09:00',
    endTime: '11:00',
    status: 'AVAILABLE',
  },

  // Priest 2 (Acharya Vidyadhar Bhatt)
  {
    id: 'slot-pending-p2',
    priestId: 'priest-2',
    slotDate: '2026-09-04',
    date: '2026-09-04',
    startTime: '08:30',
    endTime: '11:30',
    status: 'BOOKED',
    bookingId: 'booking-pending-p2',
  },
  {
    id: 'slot-p2-sep4-afternoon',
    priestId: 'priest-2',
    slotDate: '2026-09-04',
    date: '2026-09-04',
    startTime: '14:00',
    endTime: '17:00',
    status: 'AVAILABLE',
  },
  {
    id: 'slot-p2-sep10-morning',
    priestId: 'priest-2',
    slotDate: '2026-09-10',
    date: '2026-09-10',
    startTime: '08:00',
    endTime: '11:00',
    status: 'AVAILABLE',
  },
  {
    id: 'slot-p2-sep12-morning',
    priestId: 'priest-2',
    slotDate: '2026-09-12',
    date: '2026-09-12',
    startTime: '10:00',
    endTime: '13:00',
    status: 'AVAILABLE',
  },
];

const SEED_RATINGS: Rating[] = [
  {
    id: 'rating-1',
    bookingId: 'booking-completed-1',
    userId: 'user-devotee-1',
    priestId: 'priest-1',
    rating: 5,
    review: 'Pandit ji conducted the Griha Pravesh puja with utmost Vedic authenticity. Highly recommended!',
    createdAt: '2026-08-10T14:30:00.000Z',
  },
];

const getPendingDeadline = () => new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString();

const SEED_BOOKINGS: Booking[] = [
  {
    id: 'booking-pending-1',
    bookingReference: 'PC-2026-0915',
    userId: 'user-devotee-2',
    priestId: 'priest-1',
    priestServiceId: 'service-2',
    ritualId: 'ritual-2',
    addressId: 'address-3',
    slotId: 'slot-pending-1',
    availabilitySlotId: 'slot-pending-1',
    serviceName: 'Shri Satyanarayan Vrat Katha',
    servicePrice: 2100,
    dakshinaAmount: 2100,
    bookingDate: '2026-09-05',
    startTime: '09:00',
    endTime: '12:00',
    status: 'PENDING',
    paymentMethod: 'OFFLINE_CASH',
    paymentStatus: 'PENDING',
    specialInstructions: 'Please bring Ganga jal and pure cow ghee. We will arrange fresh flowers, fruits, and panchamrit.',
    userNotes: 'Auspicious ceremony for our new home inauguration and family blessing.',
    responseDeadline: getPendingDeadline(),
    createdAt: '2026-08-26T09:00:00.000Z',
  },
  {
    id: 'booking-pending-2',
    bookingReference: 'PC-2026-0922',
    userId: 'user-devotee-3',
    priestId: 'priest-1',
    priestServiceId: 'service-3',
    ritualId: 'ritual-3',
    addressId: 'address-4',
    slotId: 'slot-pending-2',
    availabilitySlotId: 'slot-pending-2',
    serviceName: 'Maha Rudrabhishek',
    servicePrice: 3500,
    dakshinaAmount: 3500,
    bookingDate: '2026-09-06',
    startTime: '07:00',
    endTime: '10:00',
    status: 'PENDING',
    paymentMethod: 'OFFLINE_CASH',
    paymentStatus: 'PENDING',
    specialInstructions: 'Strict Vedic chanting requested for morning muhurat. Bel leaves and raw milk ready.',
    userNotes: 'Ceremony for family health and peace. 4th floor apartment.',
    responseDeadline: getPendingDeadline(),
    createdAt: '2026-08-26T08:30:00.000Z',
  },
  {
    id: 'booking-pending-3',
    bookingReference: 'PC-2026-0935',
    userId: 'user-devotee-1',
    priestId: 'priest-1',
    priestServiceId: 'service-1',
    ritualId: 'ritual-1',
    addressId: 'address-1',
    slotId: 'slot-pending-3',
    availabilitySlotId: 'slot-pending-3',
    serviceName: 'Griha Pravesh & Vastu Puja',
    servicePrice: 3100,
    dakshinaAmount: 3100,
    bookingDate: '2026-09-08',
    startTime: '10:30',
    endTime: '13:30',
    status: 'PENDING',
    paymentMethod: 'OFFLINE_CASH',
    paymentStatus: 'PENDING',
    specialInstructions: 'Havan kund setup required. Please bring yagya samagri checklist.',
    userNotes: '15 family members will be present at the ceremony.',
    responseDeadline: getPendingDeadline(),
    createdAt: '2026-08-26T07:45:00.000Z',
  },
  {
    id: 'booking-1',
    bookingReference: 'PC-2026-0801',
    userId: 'user-devotee-1',
    priestId: 'priest-1',
    priestServiceId: 'service-1',
    ritualId: 'ritual-1',
    addressId: 'address-1',
    slotId: 'slot-3',
    availabilitySlotId: 'slot-3',
    serviceName: 'Griha Pravesh & Vastu Puja',
    servicePrice: 3100,
    dakshinaAmount: 3100,
    bookingDate: '2026-09-02',
    startTime: '08:00',
    endTime: '11:00',
    status: 'CONFIRMED',
    paymentMethod: 'OFFLINE_CASH',
    paymentStatus: 'PENDING',
    specialInstructions: 'Please arrive 15 minutes early for altar setup.',
    userNotes: 'Please bring samagri list checklist.',
    createdAt: '2026-08-20T10:00:00.000Z',
  },
  {
    id: 'booking-completed-1',
    bookingReference: 'PC-2026-0701',
    userId: 'user-devotee-1',
    priestId: 'priest-1',
    priestServiceId: 'service-2',
    ritualId: 'ritual-2',
    addressId: 'address-1',
    slotId: 'slot-1',
    availabilitySlotId: 'slot-1',
    serviceName: 'Shri Satyanarayan Vrat Katha',
    servicePrice: 2100,
    dakshinaAmount: 2100,
    bookingDate: '2026-08-10',
    startTime: '10:00',
    endTime: '12:00',
    status: 'COMPLETED',
    paymentMethod: 'OFFLINE_CASH',
    paymentStatus: 'PAID_OFFLINE',
    completedAt: '2026-08-10T12:15:00.000Z',
    ratingSubmitted: true,
    createdAt: '2026-08-05T09:00:00.000Z',
  },
  {
    id: 'booking-rejected-1',
    bookingReference: 'PC-2026-0819',
    userId: 'user-devotee-3',
    priestId: 'priest-1',
    priestServiceId: 'service-1',
    ritualId: 'ritual-1',
    addressId: 'address-4',
    slotId: 'slot-1',
    serviceName: 'Griha Pravesh & Vastu Puja',
    servicePrice: 3100,
    dakshinaAmount: 3100,
    bookingDate: '2026-08-15',
    startTime: '07:30',
    endTime: '10:30',
    status: 'REJECTED',
    paymentMethod: 'OFFLINE_CASH',
    paymentStatus: 'PENDING',
    rejectionReason: 'Already committed to another temple ceremony during this auspicious muhurat.',
    createdAt: '2026-08-14T08:00:00.000Z',
    updatedAt: '2026-08-14T09:30:00.000Z',
  },
  {
    id: 'booking-cancelled-1',
    bookingReference: 'PC-2026-0825',
    userId: 'user-devotee-2',
    priestId: 'priest-1',
    priestServiceId: 'service-3',
    ritualId: 'ritual-3',
    addressId: 'address-3',
    slotId: 'slot-2',
    serviceName: 'Maha Rudrabhishek',
    servicePrice: 3500,
    dakshinaAmount: 3500,
    bookingDate: '2026-08-18',
    startTime: '11:00',
    endTime: '14:00',
    status: 'CANCELLED',
    cancelledBy: 'USER',
    cancellationReason: 'Devotee family event rescheduled due to urgent travel.',
    paymentMethod: 'OFFLINE_CASH',
    paymentStatus: 'PENDING',
    createdAt: '2026-08-16T10:00:00.000Z',
    cancelledAt: '2026-08-16T14:00:00.000Z',
  },
  {
    id: 'booking-pending-p2',
    bookingReference: 'PC-2026-0940',
    userId: 'user-devotee-2',
    priestId: 'priest-2',
    priestServiceId: 'service-5',
    ritualId: 'ritual-3',
    addressId: 'address-3',
    slotId: 'slot-pending-p2',
    serviceName: 'Ganapati Havan',
    servicePrice: 2800,
    dakshinaAmount: 2800,
    bookingDate: '2026-09-04',
    startTime: '08:30',
    endTime: '11:30',
    status: 'PENDING',
    paymentMethod: 'OFFLINE_CASH',
    paymentStatus: 'PENDING',
    specialInstructions: 'Modak offering and Ganapati Atharvashirsha path.',
    responseDeadline: getPendingDeadline(),
    createdAt: '2026-08-26T08:00:00.000Z',
  },
];

const SEED_PINCODE_DIRECTORY: Record<string, PincodeLocation[]> = {
  '400050': [
    { postOffice: 'Bandra West Head Post Office', locality: 'Bandra West', villageTown: 'Bandra West', city: 'Mumbai', district: 'Mumbai Suburban', state: 'Maharashtra', country: 'India' },
    { postOffice: 'Bandra Hill Road Post Office', locality: 'Hill Road', villageTown: 'Hill Road', city: 'Mumbai', district: 'Mumbai Suburban', state: 'Maharashtra', country: 'India' },
    { postOffice: 'Pali Hill Post Office', locality: 'Pali Hill', villageTown: 'Pali Hill', city: 'Mumbai', district: 'Mumbai Suburban', state: 'Maharashtra', country: 'India' },
  ],
  '400051': [
    { postOffice: 'BKC Sub Post Office', locality: 'Bandra Kurla Complex', villageTown: 'Bandra Kurla Complex', city: 'Mumbai', district: 'Mumbai Suburban', state: 'Maharashtra', country: 'India' },
  ],
  '560038': [
    { postOffice: 'Indiranagar Post Office', locality: 'Indiranagar', villageTown: 'Indiranagar', city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', country: 'India' },
    { postOffice: 'HAL 2nd Stage Post Office', locality: 'HAL 2nd Stage', villageTown: 'HAL 2nd Stage', city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', country: 'India' },
  ],
  '700019': [
    { postOffice: 'Ballygunge Post Office', locality: 'Ballygunge', villageTown: 'Ballygunge', city: 'Kolkata', district: 'Kolkata', state: 'West Bengal', country: 'India' },
    { postOffice: 'Gariahat Market Post Office', locality: 'Gariahat', villageTown: 'Gariahat', city: 'Kolkata', district: 'Kolkata', state: 'West Bengal', country: 'India' },
    { postOffice: 'Golpark Post Office', locality: 'Golpark', villageTown: 'Golpark', city: 'Kolkata', district: 'Kolkata', state: 'West Bengal', country: 'India' },
  ],
  '122002': [
    { postOffice: 'DLF Phase 2 Post Office', locality: 'DLF Phase 2', villageTown: 'DLF Phase 2', city: 'Gurugram', district: 'Gurugram', state: 'Haryana', country: 'India' },
  ],
};

function deepClone<T>(val: T): T {
  return JSON.parse(JSON.stringify(val));
}

/**
 * ============================================================
 * SINGLE MUTABLE IN-MEMORY DATABASE INSTANCE
 * ============================================================
 */
export const mockDb: MockDbState = {
  users: deepClone(SEED_USERS),
  priests: deepClone(SEED_PRIESTS),
  priestServices: deepClone(SEED_PRIEST_SERVICES),
  rituals: deepClone(SEED_RITUALS),
  addresses: deepClone(SEED_ADDRESSES),
  weeklyAvailabilityRules: deepClone(SEED_WEEKLY_RULES),
  availabilityExceptions: deepClone(SEED_EXCEPTIONS),
  availabilitySlots: deepClone(SEED_SLOTS),
  bookings: deepClone(SEED_BOOKINGS),
  ratings: deepClone(SEED_RATINGS),
  pincodeDirectory: deepClone(SEED_PINCODE_DIRECTORY),
  otpRecords: [],
};

/**
 * Reset mockDb to pristine deterministic seed data
 */
export function resetMockDb(): void {
  mockDb.users = deepClone(SEED_USERS);
  mockDb.priests = deepClone(SEED_PRIESTS);
  mockDb.priestServices = deepClone(SEED_PRIEST_SERVICES);
  mockDb.rituals = deepClone(SEED_RITUALS);
  mockDb.addresses = deepClone(SEED_ADDRESSES);
  mockDb.weeklyAvailabilityRules = deepClone(SEED_WEEKLY_RULES);
  mockDb.availabilityExceptions = deepClone(SEED_EXCEPTIONS);
  mockDb.availabilitySlots = deepClone(SEED_SLOTS);
  mockDb.bookings = deepClone(SEED_BOOKINGS);
  mockDb.ratings = deepClone(SEED_RATINGS);
  mockDb.pincodeDirectory = deepClone(SEED_PINCODE_DIRECTORY);
  mockDb.otpRecords = [];
}

/**
 * Seed helper (alias for reset)
 */
export function seedMockDb(): void {
  resetMockDb();
}

/**
 * Integrity Validation Suite
 * Verifies foreign keys, relationships, and invariants in mockDb
 */
export function validateMockDbIntegrity(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  const userIds = new Set(mockDb.users.map((u) => u.id));
  const priestIds = new Set(mockDb.priests.map((p) => p.id));
  const serviceIds = new Set(mockDb.priestServices.map((s) => s.id));
  const addressIds = new Set(mockDb.addresses.map((a) => a.id));
  const bookingIds = new Set(mockDb.bookings.map((b) => b.id));

  // 1. Verify Priest Services
  for (const srv of mockDb.priestServices) {
    if (!priestIds.has(srv.priestId)) {
      errors.push(`Service ${srv.id} references non-existent priestId ${srv.priestId}`);
    }
    if (srv.price <= 0) {
      errors.push(`Service ${srv.id} has non-positive price ${srv.price}`);
    }
  }

  // 2. Verify Addresses
  for (const addr of mockDb.addresses) {
    if (!userIds.has(addr.userId)) {
      errors.push(`Address ${addr.id} references non-existent userId ${addr.userId}`);
    }
    if (!addr.pincode || !/^[1-9][0-9]{5}$/.test(addr.pincode)) {
      errors.push(`Address ${addr.id} has invalid PIN code ${addr.pincode}`);
    }
  }

  // 3. Verify Weekly Availability Rules
  for (const rule of mockDb.weeklyAvailabilityRules) {
    if (!priestIds.has(rule.priestId)) {
      errors.push(`Weekly rule ${rule.id} references non-existent priestId ${rule.priestId}`);
    }
    if (rule.dayOfWeek < 0 || rule.dayOfWeek > 6) {
      errors.push(`Weekly rule ${rule.id} has invalid dayOfWeek ${rule.dayOfWeek}`);
    }
  }

  // 4. Verify Bookings
  for (const booking of mockDb.bookings) {
    if (!userIds.has(booking.userId)) {
      errors.push(`Booking ${booking.id} references non-existent userId ${booking.userId}`);
    }
    if (!priestIds.has(booking.priestId)) {
      errors.push(`Booking ${booking.id} references non-existent priestId ${booking.priestId}`);
    }
    if (booking.addressId && !addressIds.has(booking.addressId)) {
      errors.push(`Booking ${booking.id} references non-existent addressId ${booking.addressId}`);
    }
    if (booking.priestServiceId && !serviceIds.has(booking.priestServiceId)) {
      errors.push(`Booking ${booking.id} references non-existent serviceId ${booking.priestServiceId}`);
    }
    if (booking.servicePrice <= 0) {
      errors.push(`Booking ${booking.id} has non-positive price ${booking.servicePrice}`);
    }
  }

  // 5. Verify Availability Slots
  for (const slot of mockDb.availabilitySlots) {
    if (!priestIds.has(slot.priestId)) {
      errors.push(`Slot ${slot.id} references non-existent priestId ${slot.priestId}`);
    }
    const slotDate = slot.slotDate || slot.date;
    if (!slotDate || !/^\d{4}-\d{2}-\d{2}$/.test(slotDate)) {
      errors.push(`Slot ${slot.id} has invalid slotDate ${slotDate}`);
    }
  }

  // 6. Verify Ratings
  for (const rating of mockDb.ratings) {
    if (!bookingIds.has(rating.bookingId)) {
      errors.push(`Rating ${rating.id} references non-existent bookingId ${rating.bookingId}`);
    }
    if (!userIds.has(rating.userId)) {
      errors.push(`Rating ${rating.id} references non-existent userId ${rating.userId}`);
    }
    if (!priestIds.has(rating.priestId)) {
      errors.push(`Rating ${rating.id} references non-existent priestId ${rating.priestId}`);
    }
    if (rating.rating < 1 || rating.rating > 5) {
      errors.push(`Rating ${rating.id} has invalid star rating ${rating.rating}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Backward-compatibility direct getters for modules still importing individual tables
export const mockUsers = mockDb.users;
export const mockPriests = mockDb.priests;
export const mockPriestServices = mockDb.priestServices;
export const mockRituals = mockDb.rituals;
export const mockAddresses = mockDb.addresses;
export const mockSlots = mockDb.availabilitySlots;
export const mockBookings = mockDb.bookings;
export const mockRatings = mockDb.ratings;
export const mockPincodeDirectory = mockDb.pincodeDirectory;
