import { Address } from './address.types';
import { Priest, Ritual, PriestSlot, PriestService } from './priest.types';

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'EXPIRED';

export type PaymentMethod = 'OFFLINE_CASH';
export type PaymentStatus = 'PENDING' | 'PAID_OFFLINE';

export interface Booking {
  id: string;
  bookingReference: string; // e.g. PC-2026-0812
  userId: string;
  priestId: string;
  priestServiceId?: string;
  ritualId?: string;
  addressId: string;
  slotId: string;
  availabilitySlotId?: string;
  serviceName: string;
  servicePrice: number;
  bookingDate: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  dakshinaAmount: number; // Snapshot of servicePrice
  specialInstructions?: string;
  userNotes?: string;
  responseDeadline?: string; // 5 hours after creation
  rejectionReason?: string;
  cancellationReason?: string;
  cancelledBy?: 'USER' | 'PRIEST' | 'ADMIN';
  cancelledAt?: string;
  completedAt?: string;
  ratingSubmitted?: boolean;
  createdAt: string;
  updatedAt?: string;

  // Joined/Populated Details for views
  priest?: Priest;
  ritual?: Ritual;
  priestService?: PriestService;
  address?: Address;
  slot?: PriestSlot;
}

export interface CreateBookingRequest {
  priestId: string;
  priestServiceId?: string;
  ritualId?: string;
  addressId: string;
  slotId: string;
  availabilitySlotId?: string;
  bookingDate: string;
  specialInstructions?: string;
  userNotes?: string;
  dakshinaAmount?: number;
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
  rating: number;
  review?: string;
}
