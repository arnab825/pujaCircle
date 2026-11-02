import React from 'react';
import { BookingStatus } from '@/types/booking.types';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, XCircle, AlertTriangle, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingStatusBadgeProps {
  status: BookingStatus;
  cancelledBy?: 'USER' | 'PRIEST' | 'ADMIN' | null;
  isDevoteeView?: boolean;
  className?: string;
  withPulse?: boolean;
}

export const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({
  status,
  cancelledBy,
  isDevoteeView = false,
  className,
  withPulse = true,
}) => {
  switch (status) {
    case 'CONFIRMED':
      return (
        <Badge
          variant="outline"
          className={cn(
            'gap-1.5 px-2.5 py-0.5 rounded-sm bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-bold shadow-2xs',
            className
          )}
        >
          {withPulse && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
            </span>
          )}
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
          <span>Confirmed</span>
        </Badge>
      );

    case 'PENDING':
      return (
        <Badge
          variant="outline"
          className={cn(
            'gap-1.5 px-2.5 py-0.5 rounded-sm bg-amber-50 text-amber-900 border border-amber-400 text-xs font-bold shadow-2xs',
            className
          )}
        >
          {withPulse && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600" />
            </span>
          )}
          <Clock className="h-3.5 w-3.5 text-amber-700 animate-pulse" />
          <span>Awaiting Priest</span>
        </Badge>
      );

    case 'COMPLETED':
      return (
        <Badge
          variant="outline"
          className={cn(
            'gap-1.5 px-2.5 py-0.5 rounded-sm bg-stone-100 text-stone-900 border border-stone-300 text-xs font-bold shadow-2xs',
            className
          )}
        >
          <Flame className="h-3.5 w-3.5 text-amber-600" />
          <span>Puja Completed</span>
        </Badge>
      );

    case 'CANCELLED': {
      let label = 'Cancelled';
      if (cancelledBy === 'USER') {
        label = isDevoteeView ? 'Cancelled by You' : 'Cancelled by Devotee';
      } else if (cancelledBy === 'PRIEST') {
        label = isDevoteeView ? 'Cancelled by Priest' : 'Cancelled by You';
      } else if (cancelledBy === 'ADMIN') {
        label = 'Cancelled by Admin';
      }

      return (
        <Badge
          variant="outline"
          className={cn(
            'gap-1.5 px-2.5 py-0.5 rounded-sm bg-stone-100 text-stone-800 border border-stone-300 text-xs font-bold shadow-2xs',
            className
          )}
        >
          <XCircle className="h-3.5 w-3.5 text-stone-600" />
          <span>{label}</span>
        </Badge>
      );
    }

    case 'REJECTED':
      return (
        <Badge
          variant="outline"
          className={cn(
            'gap-1 px-2.5 py-0.5 rounded-sm bg-red-50 text-red-800 border border-red-200 text-xs font-bold',
            className
          )}
        >
          <AlertTriangle className="h-3.5 w-3.5 text-red-700" />
          <span>Declined</span>
        </Badge>
      );

    default:
      return (
        <Badge variant="outline" className={cn('text-stone-600 text-xs font-medium', className)}>
          {status}
        </Badge>
      );
  }
};

export default BookingStatusBadge;
