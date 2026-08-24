import { Address } from './address.types';
import { Priest, Ritual, PriestSlot } from './priest.types';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
export type PaymentMethod = 'OFFLINE_CASH';
export type PaymentStatus = 'PENDING' | 'PAID_OFFLINE';

export interface Booking {
  id: string;
  bookingReference: string; // e.g. PC-2026-0812
  userId: string;
  priestId: string;
  ritualId: string;
  addressId: string;
  slotId: string;
  bookingDate: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  dakshinaAmount: number;
  specialInstructions?: string;
  cancellationReason?: string;
  cancelledBy?: 'USER' | 'PRIEST' | 'ADMIN';
  cancelledAt?: string;
  createdAt: string;
  updatedAt?: string;

  // Joined/Populated Details for views
  priest?: Priest;
  ritual?: Ritual;
  address?: Address;
  slot?: PriestSlot;
}

export interface CreateBookingRequest {
  priestId: string;
  ritualId: string;
  addressId: string;
  slotId: string;
  bookingDate: string;
  specialInstructions?: string;
  dakshinaAmount?: number;
}

export interface CancelBookingRequest {
  bookingId: string;
  reason: string;
}
