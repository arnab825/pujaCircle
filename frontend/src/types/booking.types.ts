import { Address } from './address.types';
import { Priest, Ritual, PriestService } from './priest.types';

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'COMPLETED';

export type PaymentMethod = 'OFFLINE_CASH';
export type PaymentStatus = 'PENDING' | 'PAID_OFFLINE';

export interface Booking {
  id: string;
  bookingReference: string; // e.g. PC-2026-0812
  userId: string;
  priestId: string;
  priestServiceId?: string;
  pujaCatalogId?: string;
  ritualId?: string;
  addressId?: string;
  venueAddressSnapshot?: Address;
  serviceName: string;
  servicePrice: number;
  totalPrice: number;
  dakshinaAmount?: number;
  samagriList?: string[];
  bookingDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  specialInstructions?: string | null;
  notes?: string | null;
  userNotes?: string | null;
  completionCode?: string | null; // 4-digit verification code provided to devotee upon confirmation
  responseDeadline?: string | null;
  rejectionReason?: string | null;
  cancellationReason?: string | null;
  cancelledBy?: 'USER' | 'PRIEST' | 'ADMIN' | null;
  cancelledAt?: string | null;
  completedAt?: string | null;
  rating?: number | null;
  review?: string | null;
  createdAt: string;
  updatedAt?: string;

  // Joined/Populated Details for views
  priest?: Priest;
  ritual?: Ritual;
  priestService?: PriestService;
  address?: Address;
  slot?: { id?: string; startTime: string; endTime: string };
  user?: { id: string; name: string; phoneNumber: string; email?: string };
  userName?: string;
  userPhone?: string;
}

export interface CreateBookingRequest {
  priestId: string;
  priestServiceId?: string;
  pujaCatalogId?: string;
  ritualId?: string;
  addressId: string;
  slotId?: string;
  availabilitySlotId?: string;
  bookingDate: string;
  startTime?: string;
  endTime?: string;
  serviceName?: string;
  servicePrice?: number;
  totalPrice?: number;
  specialInstructions?: string;
  notes?: string;
  userNotes?: string;
}

export interface CancelBookingRequest {
  bookingId: string;
  reason: string;
}

export interface RejectBookingRequest {
  bookingId: string;
  reason: string;
}

export interface Rating {
  id: string;
  bookingId: string;
  userId: string;
  priestId: string;
  rating: number; // 1 to 5
  review?: string;
  createdAt: string;
}

export interface SubmitRatingRequest {
  bookingId: string;
  rating?: number;
  review?: string;
}
