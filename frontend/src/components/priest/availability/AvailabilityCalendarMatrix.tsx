import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PriestException } from '@/lib/availabilityUtils';
import { Booking } from '@/types/booking.types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface AvailabilityCalendarMatrixProps {
  monthTitle: string;
  monthOffset: number;
  setMonthOffset: React.Dispatch<React.SetStateAction<number>>;
  isLoading: boolean;
  firstDayOfWeek: number;
  daysInMonth: number;
  currentYear: number;
  currentMonth: number;
  todayStr: string;
  maxDateStr: string;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  exceptions: PriestException[];
  bookings: Booking[];
  workingHoursDisplay: string;
}

/**
 * ============================================================================
 * [COMPONENT: AVAILABILITY CALENDAR MATRIX]
 * 3-Month Rolling Calendar View with Day Cells and Live Status Badges:
 * - Available working windows
 * - Days off / leaves
 * - Blocked hours
 * - Confirmed devotee appointments
 * ============================================================================
 */
export const AvailabilityCalendarMatrix: React.FC<AvailabilityCalendarMatrixProps> = ({
  monthTitle,
  monthOffset,
  setMonthOffset,
  isLoading,
  firstDayOfWeek,
  daysInMonth,
  currentYear,
  currentMonth,
  todayStr,
  maxDateStr,
  selectedDate,
  onSelectDate,
  exceptions,
  bookings,
  workingHoursDisplay,
}) => {
  return (
    <div className="flex-1 w-full bg-white p-3.5 sm:p-5 md:p-6 rounded-xl border-2 border-amber-300 shadow-xs space-y-4">
      {/* Month Switcher Header */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 pb-3 border-b border-amber-200">
        <div className="flex items-center gap-2 min-w-0">
          <CalendarIcon className="h-5 w-5 text-red-700 shrink-0" />
          <h2 className="font-serif font-extrabold text-base sm:text-lg text-stone-900 truncate">
            {monthTitle}
          </h2>
          {isLoading && (
            <span className="text-[11px] sm:text-xs text-amber-700 animate-pulse font-medium shrink-0">
              Syncing...
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            disabled={monthOffset === 0}
            onClick={() => setMonthOffset((prev) => Math.max(0, prev - 1))}
            className="h-8 px-2 sm:px-2.5 border-amber-300 hover:bg-amber-50 text-stone-700"
            aria-label="Previous Month"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline text-xs ml-1">Prev</span>
          </Button>

          <span className="text-[11px] sm:text-xs font-bold text-amber-900 bg-amber-100/80 px-2 sm:px-2.5 py-1 rounded whitespace-nowrap">
            Month {monthOffset + 1} of 3
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={monthOffset >= 2}
            onClick={() => setMonthOffset((prev) => Math.min(2, prev + 1))}
            className="h-8 px-2 sm:px-2.5 border-amber-300 hover:bg-amber-50 text-stone-700"
            aria-label="Next Month"
          >
            <span className="hidden sm:inline text-xs mr-1">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[11px] sm:text-xs font-bold text-stone-500 uppercase tracking-wider py-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="truncate">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid Days */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {/* Blank leading days */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div
            key={`blank-${i}`}
            className="min-h-13 sm:h-24 bg-stone-50/40 rounded-md sm:rounded-lg border border-transparent"
          />
        ))}

        {/* Actual Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          const isPast = dateStr < todayStr;
          const isBeyond90 = dateStr > maxDateStr;
          const isDisabled = isPast || isBeyond90;
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === todayStr;

          // Day states
          const dayExceptions = exceptions.filter((e) => e.date === dateStr);
          const isLeave = dayExceptions.some((e) => e.type === 'FULL_DAY_LEAVE');
          const partialCount = dayExceptions.filter(
            (e) => (e.type === 'PARTIAL_BLACKOUT' || e.exceptionType === 'BLOCK') && e.type !== 'FULL_DAY_LEAVE'
          ).length;
          const dayBookings = bookings.filter((b) => {
            const bDate = (b.bookingDate || (b as any).scheduledDate || '').split('T')[0];
            return bDate === dateStr && (b.status === 'CONFIRMED' || b.status === 'PENDING');
          });
          const dayConfirmedBookings = dayBookings.filter((b) => b.status === 'CONFIRMED');
          const dayPendingBookings = dayBookings.filter((b) => b.status === 'PENDING');

          return (
            <div
              key={dateStr}
              onClick={() => !isBeyond90 && onSelectDate(dateStr)}
              className={`min-h-13 sm:h-24 p-1 sm:p-2 rounded-md sm:rounded-lg border sm:border-2 transition-all flex flex-col justify-between select-none ${
                isBeyond90
                  ? 'bg-stone-50/50 border-stone-200/40 opacity-30 cursor-not-allowed'
                  : isPast
                  ? isSelected
                    ? 'border-stone-500 bg-stone-100 shadow-sm cursor-pointer ring-2 ring-stone-300'
                    : 'bg-stone-50/80 border-stone-200/70 opacity-50 hover:opacity-80 cursor-pointer'
                  : isSelected
                  ? 'border-[#780016] bg-amber-50/60 shadow-sm cursor-pointer ring-2 ring-amber-300/40'
                  : 'border-amber-200/80 hover:border-amber-400 bg-white cursor-pointer'
              }`}
            >
              {/* Top row: day number + badges */}
              <div className="flex items-center justify-between gap-0.5">
                <span
                  className={`text-xs sm:text-sm font-bold ${
                    isSelected ? 'text-[#780016] font-extrabold' : 'text-stone-800'
                  }`}
                >
                  {dayNum}
                </span>
                {isToday && (
                  <>
                    <span className="hidden sm:inline-flex">
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1 py-0 bg-red-50 text-red-700 border-red-300 font-bold"
                      >
                        Today
                      </Badge>
                    </span>
                    <span
                      className="sm:hidden text-[8px] font-bold text-red-700 bg-red-100 px-1 py-0.2 rounded"
                      title="Today"
                    >
                      ●
                    </span>
                  </>
                )}
              </div>

              {/* Day Status Indicators */}
              {!isDisabled && (
                <div className="space-y-0.5 sm:space-y-1 w-full">
                  {isLeave ? (
                    <div className="text-[9px] sm:text-[10px] font-bold text-red-700 bg-red-100/90 rounded px-0.5 sm:px-1 py-0.5 text-center truncate">
                      <span className="hidden sm:inline">Day Off</span>
                      <span className="sm:hidden">Off</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-[10px] font-medium text-emerald-700 flex items-center justify-center sm:justify-start gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="hidden sm:inline truncate">{workingHoursDisplay}</span>
                      </div>

                      {partialCount > 0 && (
                        <div className="text-[9px] font-bold text-amber-800 bg-amber-100 rounded px-0.5 sm:px-1 py-0.2 text-center sm:text-left truncate">
                          <span className="hidden sm:inline">⚠️ {partialCount} blocked</span>
                          <span className="sm:hidden text-[8px]">⚠️ {partialCount}</span>
                        </div>
                      )}

                      {dayBookings.length > 0 && (
                        <div
                          className={`text-[9px] font-bold rounded px-1 py-0.5 truncate flex items-center justify-center sm:justify-start gap-0.5 sm:gap-1 shadow-2xs ${
                            dayPendingBookings.length > 0 && dayConfirmedBookings.length === 0
                              ? 'text-amber-950 bg-amber-200 border border-amber-400'
                              : 'text-blue-900 bg-blue-100 border border-blue-300'
                          }`}
                          title={`${dayBookings.length} Bookings on this date`}
                        >
                          <span className="text-[10px]">🪔</span>
                          <span className="hidden sm:inline truncate">
                            {dayBookings[0]?.serviceName?.split(' ')[0] || 'Puja'}
                            {(dayBookings[0]?.userName || dayBookings[0]?.user?.name || (dayBookings[0] as any)?.devoteeName)
                              ? ` (${(dayBookings[0]?.userName || dayBookings[0]?.user?.name || (dayBookings[0] as any)?.devoteeName || '').split(' ')[0]})`
                              : dayBookings.length > 1
                              ? ` (${dayBookings.length})`
                              : ''}
                          </span>
                          <span className="sm:hidden text-[9px] font-black">
                            {dayBookings.length}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Calendar Legend */}
      <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-stone-600">
        <span className="font-bold text-stone-800">Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
          <span>Available ({workingHoursDisplay})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500 shrink-0" />
          <span>Day Off (Full Leave)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />
          <span>Blocked Hours</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shrink-0" />
          <span>Pending Booking</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600 shrink-0" />
          <span>Confirmed Booking</span>
        </div>
      </div>
    </div>
  );
};
