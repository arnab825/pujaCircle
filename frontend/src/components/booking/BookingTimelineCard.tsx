import React from 'react';
import { BookingStatus } from '@/types/booking.types';
import { Check, Clock, CalendarCheck, Ban, Sparkles } from 'lucide-react';

interface BookingTimelineCardProps {
  status: BookingStatus;
  cancelledBy?: 'USER' | 'PRIEST' | 'ADMIN' | null;
  cancellationReason?: string | null;
  rejectionReason?: string | null;
  createdAt?: string;
  confirmedAt?: string;
  completedAt?: string;
}

/**
 * BookingTimelineCard
 * Pure Flexbox sacred progress pipeline with vermilion, haldi gold, and emerald states.
 */
export const BookingTimelineCard: React.FC<BookingTimelineCardProps> = ({
  status,
  cancelledBy,
  cancellationReason,
  rejectionReason,
}) => {
  const isCancelled = status === 'CANCELLED';
  const isRejected = status === 'REJECTED';
  const isExpired = status === 'EXPIRED';

  const isCancelledByDevotee = isCancelled && cancelledBy === 'USER';
  const isCancelledByPriest = isCancelled && cancelledBy === 'PRIEST';

  const isStep2Completed = status === 'CONFIRMED' || status === 'COMPLETED';
  const isStep3Completed = status === 'COMPLETED';

  const steps = [
    {
      num: 1,
      label: 'Sankalp Request',
      desc: isCancelledByDevotee ? 'Devotee cancelled/withdrew request' : 'Ceremony requested & scheduled',
      isCompleted: !isCancelledByDevotee,
      isCurrent: false,
      isFailed: isCancelledByDevotee,
      icon: isCancelledByDevotee ? Ban : Check,
    },
    {
      num: 2,
      label: 'Purohit Confirmation',
      desc: isRejected
        ? (rejectionReason ? `Declined: "${rejectionReason}"` : 'Declined by Priest')
        : isExpired
        ? 'Request Expired'
        : isCancelledByDevotee
        ? 'Not required (Devotee Cancelled)'
        : isCancelledByPriest
        ? (cancellationReason ? `Cancelled: "${cancellationReason}"` : 'Cancelled by Priest')
        : isStep2Completed
        ? 'Purohit accepted & confirmed slot'
        : 'Awaiting Purohit confirmation',
      isCompleted: isStep2Completed,
      isCurrent: status === 'PENDING',
      isFailed: isRejected || isExpired || isCancelledByPriest,
      icon: isRejected || isCancelledByPriest ? Ban : isStep2Completed ? Check : Clock,
    },
    {
      num: 3,
      label: 'Sacred Vidhi & Dakshina',
      desc: isCancelled
        ? (isCancelledByDevotee
            ? 'Appointment Cancelled'
            : (cancellationReason ? `Cancelled: "${cancellationReason}"` : 'Appointment Cancelled'))
        : isStep3Completed
        ? 'Ceremony completed & Dakshina handed over'
        : 'In-home ritual & cash dakshina',
      isCompleted: isStep3Completed,
      isCurrent: status === 'CONFIRMED',
      isFailed: isCancelled && !isCancelledByDevotee,
      icon: isStep3Completed ? Sparkles : CalendarCheck,
    },
  ];

  return (
    <div className="w-full bg-linear-to-b from-amber-50/40 via-white to-amber-50/20 border border-amber-300 rounded-xl p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#780016] animate-pulse" />
          <span>Ceremony Appointment Progress</span>
        </h3>
        <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-200">
          3-Step Sacred Pipeline
        </span>
      </div>

      {/* Sequential Flexbox Stepper */}
      <div className="flex flex-col sm:flex-row items-stretch justify-between gap-3 sm:gap-3.5">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          let badgeBg = 'bg-stone-100 text-stone-400 border-stone-200';
          let cardBg = 'border border-stone-200 bg-white/80 text-stone-600';
          let titleColor = 'text-stone-700';

          if (step.isCompleted) {
            badgeBg = 'bg-[#780016] text-white border-amber-400 shadow-xs';
            cardBg = 'border border-amber-300 bg-linear-to-br from-amber-50/60 to-white shadow-2xs';
            titleColor = 'text-stone-900 font-bold';
          } else if (step.isCurrent) {
            badgeBg = 'bg-amber-400 text-stone-950 border-amber-500 shadow-xs ring-2 ring-amber-300/60';
            cardBg = 'border-2 border-amber-400 bg-amber-50/70 shadow-xs ring-2 ring-amber-400/20';
            titleColor = 'text-[#780016] font-extrabold';
          } else if (step.isFailed) {
            badgeBg = 'bg-red-700 text-white border-red-800';
            cardBg = 'border border-red-300 bg-red-50/50';
            titleColor = 'text-red-900 font-bold';
          }

          return (
            <div
              key={idx}
              className={`flex-1 flex items-start gap-3 p-3.5 rounded-lg ${cardBg} transition-all relative overflow-hidden`}
            >
              {step.isCurrent && (
                <div className="absolute top-0 right-0 bg-amber-400 text-stone-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-bl tracking-wider shadow-2xs">
                  Active
                </div>
              )}
              {step.isCompleted && (
                <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-bl">
                  ✓ Done
                </div>
              )}

              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${badgeBg}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="space-y-0.5 pr-2">
                <p className={`text-xs font-serif ${titleColor}`}>
                  {step.num}. {step.label}
                </p>
                <p className="text-[11px] text-stone-600 leading-tight">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookingTimelineCard;
