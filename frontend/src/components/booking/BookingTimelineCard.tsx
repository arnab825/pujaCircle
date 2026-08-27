import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BookingStatus } from '@/types/booking.types';
import { Check, Clock, CalendarCheck, Ban } from 'lucide-react';

interface BookingTimelineCardProps {
  status: BookingStatus;
  createdAt?: string;
  confirmedAt?: string;
  completedAt?: string;
}

// Timeline progress visualization for a booking status
export const BookingTimelineCard: React.FC<BookingTimelineCardProps> = ({
  status,
}) => {
  const isCancelled = status === 'CANCELLED';
  const isRejected = status === 'REJECTED';
  const isExpired = status === 'EXPIRED';

  const steps = [
    {
      label: 'Requested',
      desc: 'User submitted request',
      isCompleted: true,
      icon: Check,
    },
    {
      label: 'Confirmation',
      desc: isRejected ? 'Declined by Priest' : isExpired ? 'Request Expired' : 'Priest confirmation',
      isCompleted: status === 'CONFIRMED' || status === 'COMPLETED',
      isCurrent: status === 'PENDING',
      isFailed: isRejected || isExpired,
      icon: isRejected ? Ban : Clock,
    },
    {
      label: 'Puja',
      desc: isCancelled ? 'Appointment Cancelled' : 'Puja & cash on completion',
      isCompleted: status === 'COMPLETED',
      isCurrent: status === 'CONFIRMED',
      isFailed: isCancelled,
      icon: CalendarCheck,
    },
  ];

  return (
    <Card className="border bg-card">
      <CardContent className="p-4 sm:p-5">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Appointment Progress
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            let badgeBg = 'bg-muted text-muted-foreground border-border';
            if (step.isCompleted) {
              badgeBg = 'bg-primary text-primary-foreground border-primary';
            } else if (step.isCurrent) {
              badgeBg = 'bg-amber-500 text-white border-amber-500 animate-pulse';
            } else if (step.isFailed) {
              badgeBg = 'bg-destructive text-destructive-foreground border-destructive';
            }

            return (
              <div key={idx} className="flex items-start gap-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${badgeBg}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">{step.label}</p>
                  <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
