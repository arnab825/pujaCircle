// Presentation ViewModel for ceremony bookings
export interface BookingViewModel {
  id: string;
  bookingReference: string;
  userId: string;
  priestId: string;
  serviceName: string;
  servicePrice: number;
  totalPrice: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED' | 'COMPLETED';
  paymentStatus: 'PENDING' | 'PAID_OFFLINE';
  specialInstructions?: string | null;
  completionCode?: string | null;
  rejectionReason?: string | null;
  cancellationReason?: string | null;
  rating?: number | null;
  review?: string | null;
  createdAt: string;
  updatedAt?: string;
  scheduledDate?: Date | string;
  cancelledAt?: Date | string | null;
  completedAt?: Date | string | null;
  priest?: {
    id?: string;
    displayName: string;
    fullName?: string;
    phoneNumber?: string;
    email?: string;
    profileImageUrl?: string;
  };
  slot: { startTime: string; endTime: string };
  ritual?: any;
  venueAddressSnapshot?: any;
  userName?: string;
  userPhone?: string;
}
