import React from 'react';
import { BookingStatus } from '@/types/booking.types';
import { Badge } from '@/components/ui/badge';
import { BOOKING_STATUS_CONFIG } from '@/lib/constants';
import { CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingStatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

const getStatusIcon = (status: BookingStatus) => {
  switch (status) {
    case 'CONFIRMED':
    case 'COMPLETED':
      return <CheckCircle2 className="h-3 w-3" />;
    case 'PENDING':
      return <Clock className="h-3 w-3" />;
    case 'CANCELLED':
      return <XCircle className="h-3 w-3" />;
    case 'REJECTED':
      return <AlertTriangle className="h-3 w-3" />;
    default:
      return null;
  }
};

export const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({ status, className }) => {
  const config = BOOKING_STATUS_CONFIG[status];
  const icon = getStatusIcon(status);

  if (!config) {
    return (
      <Badge variant="outline" className={cn("text-muted-foreground text-[11px]", className)}>
        {status}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 text-[11px] font-medium shadow-2xs",
        config.badgeClass,
        className
      )}
    >
      {icon}
      <span>{config.label}</span>
    </Badge>
  );
};

