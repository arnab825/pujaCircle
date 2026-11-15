import React from 'react';
import { Calendar, Clock, Star } from 'lucide-react';
import { Booking } from '@/types/booking.types';
import { formatDate } from '@/lib/utils';

interface PriestBookingsTableProps {
  bookings: Booking[];
}

/**
 * ============================================================================
 * [COMPONENT: PRIEST BOOKINGS TABLE]
 * Administrative view of all ceremony appointments assigned to a purohit.
 * ============================================================================
 */
export const PriestBookingsTable: React.FC<PriestBookingsTableProps> = ({ bookings }) => {
  return (
    <div className="border-2 border-amber-300 bg-white shadow-sm rounded-xl p-4 sm:p-7 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-amber-200">
        <div>
          <h3 className="text-base font-serif font-bold text-stone-950">
            Assigned Ceremony Appointments ({bookings.length})
          </h3>
          <p className="text-xs text-stone-600">
            Full platform reservation history and completed ritual audit trail.
          </p>
        </div>
      </div>

      {bookings.length > 0 ? (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="p-3.5 sm:p-4 rounded-lg border border-amber-200 bg-amber-50/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-stone-950 text-sm font-serif">
                    {b.serviceName}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      b.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : b.status === 'CONFIRMED'
                        ? 'bg-blue-100 text-blue-800'
                        : b.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-stone-600 text-[11px]">
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3 h-3 text-amber-700" />
                    {formatDate(b.bookingDate)}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3 text-amber-700" />
                    {b.startTime} - {b.endTime}
                  </span>
                  {b.rating && Number(b.rating) > 0 && (
                    <span className="flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{Number(b.rating).toFixed(1)}</span>
                    </span>
                  )}
                  <span className="truncate">
                    Devotee: <strong className="text-stone-800">{b.userName || 'Devotee'}</strong>
                  </span>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-200/80 shrink-0">
                <div className="text-base sm:text-sm font-bold text-[#780016] font-serif">
                  ₹{Number(b.totalPrice || 0).toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-stone-500 font-mono">
                  Ref: {b.bookingReference}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-xs text-stone-500 bg-stone-50 rounded-lg border border-stone-200">
          No booking appointments recorded for this scholar yet.
        </div>
      )}
    </div>
  );
};
