import React from 'react';
import { CheckCircle2, Ban, Clock, CalendarDays, Edit2 } from 'lucide-react';

interface AvailabilityStatsDeckProps {
  workingHoursDisplay: string;
  durationHours: number;
  totalLeavesCount: number;
  totalBlackoutsCount: number;
  upcomingBookingsCount: number;
  onEditWorkingHours: () => void;
}

/**
 * ============================================================================
 * [COMPONENT: AVAILABILITY STATS DECK]
 * Overview cards displaying current operational metrics for the priest:
 * - Default Daily Working Hours
 * - Total Full-Day Leaves Marked
 * - Partial Hour Blackouts
 * - Confirmed Upcoming Pujas
 * Pure Flexbox, Haldi gold trims, zero CSS Grid.
 * ============================================================================
 */
export const AvailabilityStatsDeck: React.FC<AvailabilityStatsDeckProps> = ({
  workingHoursDisplay,
  durationHours,
  totalLeavesCount,
  totalBlackoutsCount,
  upcomingBookingsCount,
  onEditWorkingHours,
}) => {
  return (
    <div className="flex flex-wrap gap-4 w-full">
      {/* 1. Default Working Hours */}
      <div className="w-full sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)] p-5 rounded-lg border-2 border-amber-300 border-t-4 border-t-emerald-600 bg-white shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider whitespace-nowrap">
              Default Working Hours
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-serif text-emerald-700 mt-2">
            {workingHoursDisplay}
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 pt-2 mt-2 border-t border-amber-100">
          <span className="text-[11px] text-stone-500 font-medium">
            Auto {durationHours}-hr daily window
          </span>
          <button
            type="button"
            onClick={onEditWorkingHours}
            className="text-xs text-[#780016] hover:text-[#5C0011] font-bold bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-md cursor-pointer transition-colors inline-flex items-center gap-1 shrink-0 shadow-2xs"
            title="Configure daily standard hours"
          >
            <Edit2 className="h-3 w-3 text-red-700" />
            <span>Edit Hours</span>
          </button>
        </div>
      </div>

      {/* 2. Marked Days Off */}
      <div className="w-full sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)] p-5 rounded-lg border-2 border-amber-300 border-t-4 border-t-red-600 bg-white shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-red-800 uppercase tracking-wider whitespace-nowrap">
              Marked Days Off
            </span>
            <Ban className="h-4 w-4 text-red-600 shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-serif text-red-700 mt-2">
            {totalLeavesCount} {totalLeavesCount === 1 ? 'day' : 'days'}
          </div>
        </div>
        <span className="text-[11px] text-stone-500 block pt-2 mt-2 border-t border-amber-100">
          Full-day leaves marked
        </span>
      </div>

      {/* 3. Partial Blackouts */}
      <div className="w-full sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)] p-5 rounded-lg border-2 border-amber-300 border-t-4 border-t-amber-600 bg-white shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider whitespace-nowrap">
              Partial Blackouts
            </span>
            <Clock className="h-4 w-4 text-amber-600 shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-serif text-amber-700 mt-2">
            {totalBlackoutsCount}
          </div>
        </div>
        <span className="text-[11px] text-stone-500 block pt-2 mt-2 border-t border-amber-100">
          Blocked hour windows
        </span>
      </div>

      {/* 4. Confirmed Pujas */}
      <div className="w-full sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)] p-5 rounded-lg border-2 border-amber-300 border-t-4 border-t-blue-600 bg-white shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider whitespace-nowrap">
              Confirmed Pujas
            </span>
            <CalendarDays className="h-4 w-4 text-blue-600 shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-serif text-blue-800 mt-2">
            {upcomingBookingsCount}
          </div>
        </div>
        <span className="text-[11px] text-stone-500 block pt-2 mt-2 border-t border-amber-100">
          Upcoming bookings
        </span>
      </div>
    </div>
  );
};
