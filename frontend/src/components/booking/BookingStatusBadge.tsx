import React from 'react';
import { BookingStatus } from '@/types/booking.types';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

export const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'CONFIRMED':
      return (
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1 text-[11px] font-medium">
          <CheckCircle2 className="h-3 w-3" /> Confirmed
        </Badge>
      );
    case 'COMPLETED':
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 gap-1 text-[11px] font-medium">
          <CheckCircle2 className="h-3 w-3" /> Completed
        </Badge>
      );
    case 'PENDING':
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1 text-[11px] font-medium">
          <Clock className="h-3 w-3" /> Awaiting Confirmation
        </Badge>
      );
    case 'CANCELLED':
      return (
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 gap-1 text-[11px] font-medium">
          <XCircle className="h-3 w-3" /> Cancelled
        </Badge>
      );
    case 'REJECTED':
      return (
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 gap-1 text-[11px] font-medium">
          <AlertTriangle className="h-3 w-3" /> Declined
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-muted-foreground text-[11px]">
          {status}
        </Badge>
      );
  }
};
