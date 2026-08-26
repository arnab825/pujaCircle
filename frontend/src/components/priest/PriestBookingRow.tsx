import React from 'react';
import { Booking } from '@/types/booking.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge';
import { formatINR, formatDate } from '@/lib/utils';
import { Calendar, Clock, MapPin, Check, Ban, Eye, CheckCircle2 } from 'lucide-react';

interface PriestBookingRowProps {
  booking: Booking;
  onViewDetails: (booking: Booking) => void;
  onAccept: (bookingId: string) => void;
  onOpenReject: (booking: Booking) => void;
  onComplete: (bookingId: string) => void;
  isProcessing?: boolean;
}

export const PriestBookingRow: React.FC<PriestBookingRowProps> = ({
  booking,
  onViewDetails,
  onAccept,
  onOpenReject,
  onComplete,
  isProcessing = false,
}) => {
  return (
    <div className="p-4 sm:p-5 rounded-xl border bg-card hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Left Details */}
      <div className="space-y-2 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-base text-foreground font-serif">
            {booking.serviceName || 'Puja Ceremony'}
          </span>
          <BookingStatusBadge status={booking.status} />
          <Badge variant="outline" className="font-mono text-[10px]">
            {booking.bookingReference || booking.id.slice(0, 8)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{formatDate(booking.bookingDate)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{booking.slot ? `${booking.slot.startTime} - ${booking.slot.endTime}` : 'Morning Muhurat'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">
              {booking.address ? `${booking.address.villageTown || booking.address.city}, ${booking.address.city}` : 'Devotee Address'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1 text-xs">
          <span className="text-muted-foreground">
            Dakshina: <strong className="text-foreground">{formatINR(booking.servicePrice || booking.dakshinaAmount || 2100)}</strong> (Cash on Completion)
          </span>
          {booking.user?.phoneNumber && (
            <span className="text-muted-foreground">
              Contact: <strong className="text-foreground font-mono">{booking.user.phoneNumber}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(booking)}
          className="gap-1.5 text-xs"
        >
          <Eye className="w-3.5 h-3.5" />
          Details
        </Button>

        {booking.status === 'PENDING' && (
          <>
            <Button
              size="sm"
              onClick={() => onAccept(booking.id)}
              disabled={isProcessing}
              className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Check className="w-3.5 h-3.5" />
              Accept
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenReject(booking)}
              disabled={isProcessing}
              className="gap-1.5 text-xs text-destructive hover:text-destructive border-destructive/30"
            >
              <Ban className="w-3.5 h-3.5" />
              Decline
            </Button>
          </>
        )}

        {booking.status === 'CONFIRMED' && (
          <Button
            size="sm"
            onClick={() => onComplete(booking.id)}
            disabled={isProcessing}
            className="gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Mark Completed
          </Button>
        )}
      </div>
    </div>
  );
};
