import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, XCircle, AlertTriangle, ShieldCheck, Ban } from 'lucide-react';

export type GeneralStatus =
  | 'ACTIVE'
  | 'PENDING'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'BANNED'
  | 'APPROVED';

interface StatusBadgeProps {
  status: GeneralStatus | string;
  label?: string;
  className?: string;
}

/**
 * Standard StatusBadge for account, verification, and booking states
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  className = '',
}) => {
  const normalized = status.toUpperCase();

  switch (normalized) {
    case 'ACTIVE':
    case 'APPROVED':
      return (
        <Badge variant="outline" className={`bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1 text-xs ${className}`}>
          <ShieldCheck className="h-3 w-3" /> {label || (normalized === 'ACTIVE' ? 'Active' : 'Approved')}
        </Badge>
      );

    case 'CONFIRMED':
      return (
        <Badge variant="outline" className={`bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1 text-xs ${className}`}>
          <CheckCircle2 className="h-3 w-3" /> {label || 'Confirmed'}
        </Badge>
      );

    case 'COMPLETED':
      return (
        <Badge variant="outline" className={`bg-blue-500/10 text-blue-600 border-blue-500/20 gap-1 text-xs ${className}`}>
          <CheckCircle2 className="h-3 w-3" /> {label || 'Completed'}
        </Badge>
      );

    case 'PENDING':
      return (
        <Badge variant="outline" className={`bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1 text-xs ${className}`}>
          <Clock className="h-3 w-3" /> {label || 'Pending'}
        </Badge>
      );

    case 'CANCELLED':
      return (
        <Badge variant="outline" className={`bg-destructive/10 text-destructive border-destructive/20 gap-1 text-xs ${className}`}>
          <XCircle className="h-3 w-3" /> {label || 'Cancelled'}
        </Badge>
      );

    case 'REJECTED':
      return (
        <Badge variant="outline" className={`bg-destructive/10 text-destructive border-destructive/20 gap-1 text-xs ${className}`}>
          <AlertTriangle className="h-3 w-3" /> {label || 'Declined'}
        </Badge>
      );

    case 'BANNED':
      return (
        <Badge variant="destructive" className={`gap-1 text-xs ${className}`}>
          <Ban className="h-3 w-3" /> {label || 'Banned'}
        </Badge>
      );

    default:
      return (
        <Badge variant="outline" className={`text-muted-foreground text-xs ${className}`}>
          {label || status}
        </Badge>
      );
  }
};
