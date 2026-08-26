import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge';
import { Booking } from '@/types/booking.types';
import { formatINR, formatDate } from '@/lib/utils';
import { Calendar, Clock, MapPin, Phone, User, Sparkles } from 'lucide-react';

interface PriestBookingDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

export const PriestBookingDetailsDialog: React.FC<PriestBookingDetailsDialogProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2 pr-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <DialogTitle className="text-lg font-serif">Ceremony Appointment</DialogTitle>
            </div>
            <BookingStatusBadge status={booking.status} />
          </div>
          <DialogDescription className="text-xs font-mono">
            Ref: {booking.bookingReference || booking.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Ceremony & Dakshina Banner */}
          <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
            <div>
              <p className="font-bold text-sm text-foreground">{booking.serviceName || 'Puja Ceremony'}</p>
              <p className="text-muted-foreground text-[11px]">Direct offline Dakshina</p>
            </div>
            <span className="text-xl font-bold font-serif text-primary">
              {formatINR(booking.servicePrice || booking.dakshinaAmount || 2100)}
            </span>
          </div>

          {/* Schedule Grid */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/40 border">
            <div className="space-y-1">
              <span className="text-muted-foreground text-[11px] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                Date
              </span>
              <p className="font-medium text-foreground">{formatDate(booking.bookingDate)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground text-[11px] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                Muhurat Time
              </span>
              <p className="font-medium text-foreground">
                {booking.slot ? `${booking.slot.startTime} - ${booking.slot.endTime}` : 'Morning Slot'}
              </p>
            </div>
          </div>

          {/* Devotee Info & Address */}
          <div className="space-y-2 p-3 rounded-lg bg-muted/40 border">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary" />
                {booking.user?.name || 'Devotee'}
              </span>
              {booking.user?.phoneNumber && (
                <span className="font-mono text-muted-foreground flex items-center gap-1">
                  <Phone className="w-3 h-3 text-primary" />
                  {booking.user.phoneNumber}
                </span>
              )}
            </div>

            {booking.address && (
              <div className="flex items-start gap-1.5 text-muted-foreground pt-1 border-t border-border/50">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <span>
                  {booking.address.houseNo && `${booking.address.houseNo}, `}
                  {booking.address.villageTown && `${booking.address.villageTown}, `}
                  {booking.address.city}, {booking.address.state} - {booking.address.pincode}
                </span>
              </div>
            )}
          </div>

          {/* Rejection / Cancellation Notes if applicable */}
          {booking.rejectionReason && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              <strong>Decline Reason:</strong> {booking.rejectionReason}
            </div>
          )}
          {booking.cancellationReason && (
            <div className="p-3 rounded-lg bg-muted border text-muted-foreground text-xs">
              <strong>Cancellation Reason:</strong> {booking.cancellationReason}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
