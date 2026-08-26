import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { mockGetBookingById, mockCancelBooking, mockSubmitRating } from '@/mocks/mock-api';
import { Booking } from '@/types/booking.types';
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge';
import { BookingTimelineCard } from '@/components/booking/BookingTimelineCard';
import { CancelBookingDialog } from '@/components/booking/CancelBookingDialog';
import { RatingModal } from '@/components/booking/RatingModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatINR, formatDate } from '@/lib/utils';
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  Phone,
  User,
  Star,
  Ban,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

export const BookingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  const fetchBooking = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await mockGetBookingById(id);
      if (res.success && res.data) {
        setBooking(res.data);
      } else {
        toast.error('Booking not found.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const handleCancelConfirm = async (reason: string) => {
    if (!booking || !user) return;
    const res = await mockCancelBooking(booking.id, user.id, reason);
    if (res.success) {
      toast.success('Puja appointment cancelled successfully.');
      fetchBooking();
    } else {
      toast.error(res.message || 'Failed to cancel booking.');
    }
  };

  const handleRatingSubmit = async (ratingData: any) => {
    if (!user) return;
    const res = await mockSubmitRating(user.id, ratingData);
    if (res.success) {
      toast.success('Thank you for rating the ceremony!');
      setIsRatingModalOpen(false);
      fetchBooking();
    } else {
      toast.error(res.message || 'Failed to submit rating.');
    }
  };

  if (isLoading) {
    return (
      <div className="container py-12 text-center text-xs text-muted-foreground">
        Loading ceremony details...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container py-12 text-center space-y-4">
        <p className="text-sm font-semibold">Booking not found.</p>
        <Link to="/user/bookings">
          <Button size="sm" variant="outline" className="gap-1.5 text-xs">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Bookings
          </Button>
        </Link>
      </div>
    );
  }

  const isDevoteeOwner = user?.id === booking.userId;
  const canCancel = (booking.status === 'PENDING' || booking.status === 'CONFIRMED') && isDevoteeOwner;
  const canRate = booking.status === 'COMPLETED' && isDevoteeOwner;

  return (
    <div className="container py-8 space-y-6 max-w-4xl">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link to="/user/bookings" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Bookings
        </Link>

        <div className="flex items-center gap-2">
          {canRate && (
            <Button
              size="sm"
              onClick={() => setIsRatingModalOpen(true)}
              className="gap-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Star className="w-3.5 h-3.5 fill-white" /> Rate Ceremony
            </Button>
          )}

          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCancelModalOpen(true)}
              className="gap-1.5 text-xs text-destructive hover:text-destructive border-destructive/30"
            >
              <Ban className="w-3.5 h-3.5" /> Cancel Appointment
            </Button>
          )}
        </div>
      </div>

      {/* Main Booking Summary Card */}
      <Card className="border shadow-xs overflow-hidden bg-card">
        <div className="p-6 bg-linear-to-r from-primary/15 via-primary/5 to-transparent border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-background border rounded-md">
                {booking.bookingReference || booking.id}
              </span>
              <span className="text-xs text-muted-foreground">
                Booked on {formatDate(booking.createdAt)}
              </span>
            </div>
            <h1 className="text-2xl font-bold font-serif text-foreground">
              {booking.serviceName || 'Puja Ceremony'}
            </h1>
          </div>
          <BookingStatusBadge status={booking.status} />
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Progress Stepper */}
          <BookingTimelineCard status={booking.status} />

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Schedule & Location */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Schedule & Venue
              </h3>
              <div className="space-y-3 p-4 rounded-xl bg-muted/40 border text-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-medium text-foreground">{formatDate(booking.bookingDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-medium text-foreground">
                    {booking.slot ? `${booking.slot.startTime} - ${booking.slot.endTime}` : 'Morning Muhurat'}
                  </span>
                </div>
                {booking.address && (
                  <div className="flex items-start gap-2 text-muted-foreground pt-1 border-t border-border/50">
                    <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>
                      {booking.address.houseNo && `${booking.address.houseNo}, `}
                      {booking.address.villageTown && `${booking.address.villageTown}, `}
                      {booking.address.city}, {booking.address.state} - {booking.address.pincode}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Purohit & Dakshina */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Purohit & Dakshina
              </h3>
              <div className="space-y-3 p-4 rounded-xl bg-muted/40 border text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    <span className="font-bold text-foreground">
                      {booking.priest?.displayName || booking.priest?.fullName || 'Assigned Purohit'}
                    </span>
                  </div>
                  {booking.status === 'CONFIRMED' && booking.priest?.phoneNumber && (
                    <div className="flex items-center gap-1 font-mono text-primary">
                      <Phone className="w-3 h-3" />
                      <span>{booking.priest.phoneNumber}</span>
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-background border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                      Offline Cash Dakshina
                    </span>
                    <span className="text-[11px] text-muted-foreground">Pay direct on completion</span>
                  </div>
                  <span className="text-xl font-bold font-serif text-primary">
                    {formatINR(booking.servicePrice || booking.dakshinaAmount || 2100)}
                  </span>
                </div>

                <div className="space-y-1 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>No advance online payment required.</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Hand over Dakshina to Purohit upon completion.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cancellation / Rejection Alerts */}
          {booking.rejectionReason && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs space-y-1">
              <strong>Decline Reason:</strong>
              <p>{booking.rejectionReason}</p>
            </div>
          )}
          {booking.cancellationReason && (
            <div className="p-4 rounded-xl bg-muted border text-muted-foreground text-xs space-y-1">
              <strong>Cancellation Reason:</strong>
              <p>{booking.cancellationReason}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <CancelBookingDialog
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelConfirm}
        bookingReference={booking.bookingReference || booking.id}
      />

      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        bookingId={booking.id}
        priestName={booking.priest?.displayName || booking.priest?.fullName}
        serviceName={booking.serviceName}
        onSubmit={handleRatingSubmit}
      />
    </div>
  );
};

export default BookingDetailsPage;
