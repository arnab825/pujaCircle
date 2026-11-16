import React from 'react';
import { Calendar, Clock, AlertCircle, Sunrise, Sun, Moon, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { CalculatedSlot, PriestException, formatTimeAmPm } from '@/lib/availabilityUtils';
import { formatTime, formatFullDate } from '@/lib/utils';

interface MuhuratSlotPickerProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  istDate: string;
  tomorrowStr: string;
  dayAfterTomorrowStr: string;
  isTodayConcluded: boolean;
  timeFilter: 'ALL' | 'MORNING' | 'AFTERNOON' | 'EVENING';
  onSetTimeFilter: (filter: 'ALL' | 'MORNING' | 'AFTERNOON' | 'EVENING') => void;
  availableSlots: CalculatedSlot[];
  selectedSlot: CalculatedSlot | null;
  onSelectSlot: (slot: CalculatedSlot) => void;
  isSlotsLoading: boolean;
  blackoutForSelectedDate?: PriestException;
  onNotice: (msg: string) => void;
}

/**
 * ============================================================================
 * [COMPONENT: MUHURAT SLOT PICKER]
 * Date picker and dynamic Shubh Muhurat slot calculation with IST time conversion.
 * ============================================================================
 */
export const MuhuratSlotPicker: React.FC<MuhuratSlotPickerProps> = ({
  selectedDate,
  onSelectDate,
  istDate,
  tomorrowStr,
  dayAfterTomorrowStr,
  isTodayConcluded,
  timeFilter,
  onSetTimeFilter,
  availableSlots,
  selectedSlot,
  onSelectSlot,
  isSlotsLoading,
  blackoutForSelectedDate,
  onNotice,
}) => {
  const morningCount = availableSlots.filter(
    (s) => parseInt(s.startTime.split(':')[0], 10) < 12
  ).length;

  const afternoonCount = availableSlots.filter((s) => {
    const h = parseInt(s.startTime.split(':')[0], 10);
    return h >= 12 && h < 17;
  }).length;

  const eveningCount = availableSlots.filter(
    (s) => parseInt(s.startTime.split(':')[0], 10) >= 17
  ).length;

  const filteredSlots = availableSlots.filter((slot) => {
    if (timeFilter === 'ALL') return true;
    const h = parseInt(slot.startTime.split(':')[0], 10);
    if (timeFilter === 'MORNING') return h < 12;
    if (timeFilter === 'AFTERNOON') return h >= 12 && h < 17;
    if (timeFilter === 'EVENING') return h >= 17;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* STEP 2: Choose Date */}
      <div className="space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-1.5 pb-2 border-b border-amber-100">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-[#780016] text-white font-bold text-xs shrink-0">
              2
            </span>
            <h2 className="text-sm sm:text-base font-bold font-serif text-stone-900">
              Select Auspicious Ceremony Date
            </h2>
          </div>
          <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded-sm shrink-0">
            Verified Calendar
          </span>
        </div>

        {/* Quick Date Pills & Date Input */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (!isTodayConcluded) {
                onSelectDate(istDate);
              } else {
                onNotice(
                  "Purohits require 12 hours advance booking notice. Today's slots are within this window; please book for tomorrow."
                );
              }
            }}
            disabled={isTodayConcluded}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
              selectedDate === istDate
                ? 'bg-[#780016] text-white border-[#780016] shadow-2xs'
                : isTodayConcluded
                ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed opacity-60'
                : 'bg-white text-stone-800 border-amber-300 hover:bg-amber-50'
            }`}
          >
            <span>Today</span>
            {isTodayConcluded && (
              <span className="text-[10px] text-amber-700 font-semibold">(12h Notice)</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onSelectDate(tomorrowStr)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
              selectedDate === tomorrowStr
                ? 'bg-[#780016] text-white border-[#780016] shadow-2xs'
                : 'bg-white text-stone-800 border-amber-300 hover:bg-amber-50'
            }`}
          >
            <span>Tomorrow ({tomorrowStr.slice(5)})</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectDate(dayAfterTomorrowStr)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
              selectedDate === dayAfterTomorrowStr
                ? 'bg-[#780016] text-white border-[#780016] shadow-2xs'
                : 'bg-white text-stone-800 border-amber-300 hover:bg-amber-50'
            }`}
          >
            <span>In 2 Days ({dayAfterTomorrowStr.slice(5)})</span>
          </button>

          <div className="flex items-center gap-1.5 w-full sm:w-auto sm:ml-auto pt-1 sm:pt-0">
            <Calendar className="h-4 w-4 text-[#780016] shrink-0" />
            <Input
              type="date"
              value={selectedDate}
              min={istDate}
              onChange={(e) => onSelectDate(e.target.value)}
              className="text-xs h-9 flex-1 sm:w-38 rounded-lg border-amber-300 focus-visible:ring-red-700 font-mono"
            />
          </div>
        </div>

        {/* 12-Hour Notice Warning Banner */}
        {selectedDate === istDate && isTodayConcluded && (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-950 flex items-start gap-2 shadow-2xs">
            <AlertCircle className="w-4 h-4 text-[#780016] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#780016]">12-Hour Advance Notice Required:</strong>
              <p className="text-[11px] text-stone-700 mt-0.5">
                Purohits require at least 12 hours advance booking notice to prepare samagri. Please pick tomorrow ({formatFullDate(tomorrowStr)}) or an upcoming auspicious date.
              </p>
            </div>
          </div>
        )}

        {/* Blocked Window Alert */}
        {blackoutForSelectedDate && (
          <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-300 text-xs text-amber-950 flex items-start gap-2 shadow-2xs">
            <Clock className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#780016]">Purohit Blocked / Break Window:</strong>
              <p className="text-[11px] text-stone-700 mt-0.5">
                {formatTimeAmPm(blackoutForSelectedDate.startTime || '')} –{' '}
                {formatTimeAmPm(blackoutForSelectedDate.endTime || '')} ({blackoutForSelectedDate.reason || 'Blocked Break'}). All other open slots shown below are fully bookable.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="h-px bg-amber-100" />

      {/* STEP 3: Choose Slot */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 pb-2 border-b border-amber-100">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-[#780016] text-white font-bold text-xs shrink-0">
              3
            </span>
            <h2 className="text-sm sm:text-base font-bold font-serif text-stone-900">
              Choose Auspicious Muhurat Slot
            </h2>
          </div>
          <span className="text-xs text-stone-500 font-medium pl-8 sm:pl-0">
            {formatFullDate(selectedDate)}
          </span>
        </div>

        {/* Time of Day Tabs */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => onSetTimeFilter('ALL')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all border cursor-pointer ${
              timeFilter === 'ALL'
                ? 'bg-[#780016] text-white border-[#780016]'
                : 'bg-white text-stone-700 border-amber-200 hover:bg-amber-50'
            }`}
          >
            All Slots ({availableSlots.length})
          </button>

          <button
            type="button"
            onClick={() => onSetTimeFilter('MORNING')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all border flex items-center gap-1 cursor-pointer ${
              timeFilter === 'MORNING'
                ? 'bg-[#780016] text-white border-[#780016]'
                : 'bg-white text-stone-700 border-amber-200 hover:bg-amber-50'
            }`}
          >
            <Sunrise className="w-3.5 h-3.5 text-amber-600" />
            <span>Morning ({morningCount})</span>
          </button>

          <button
            type="button"
            onClick={() => onSetTimeFilter('AFTERNOON')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all border flex items-center gap-1 cursor-pointer ${
              timeFilter === 'AFTERNOON'
                ? 'bg-[#780016] text-white border-[#780016]'
                : 'bg-white text-stone-700 border-amber-200 hover:bg-amber-50'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Afternoon ({afternoonCount})</span>
          </button>

          <button
            type="button"
            onClick={() => onSetTimeFilter('EVENING')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all border flex items-center gap-1 cursor-pointer ${
              timeFilter === 'EVENING'
                ? 'bg-[#780016] text-white border-[#780016]'
                : 'bg-white text-stone-700 border-amber-200 hover:bg-amber-50'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-indigo-500" />
            <span>Evening ({eveningCount})</span>
          </button>
        </div>

        {/* Slots Grid */}
        {isSlotsLoading ? (
          <div className="text-center py-10 text-xs text-stone-500 font-medium">
            Calculating auspicious Muhurat slots...
          </div>
        ) : filteredSlots.length === 0 ? (
          <div className="p-8 text-center space-y-2 border border-dashed border-amber-300 rounded-lg bg-amber-50/30">
            <Clock className="w-8 h-8 text-amber-600/50 mx-auto" />
            <p className="text-xs font-bold text-stone-800">
              No slots available for this filter.
            </p>
            <p className="text-[11px] text-stone-500">
              Try switching to 'All Slots' or pick another auspicious date.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-2.5">
            {filteredSlots.map((slot) => {
              if (slot.isBlocked) {
                return (
                  <div
                    key={`${slot.startTime}-${slot.endTime}`}
                    className="p-3 rounded-lg border border-stone-200 bg-stone-50 text-stone-400 cursor-not-allowed text-xs flex flex-col justify-between"
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span>{formatTime(slot.startTime)}</span>
                      <span className="text-[10px] text-stone-500 font-medium">Booked</span>
                    </div>
                    <span className="text-[10px] mt-1">Slot Unavailable</span>
                  </div>
                );
              }

              const isSelected =
                selectedSlot?.startTime === slot.startTime &&
                selectedSlot?.endTime === slot.endTime;

              return (
                <button
                  key={`${slot.startTime}-${slot.endTime}`}
                  type="button"
                  onClick={() => onSelectSlot(slot)}
                  className={`p-3 rounded-lg border-2 text-xs text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#780016] bg-amber-100/50 shadow-2xs font-bold'
                      : 'border-amber-200 bg-white hover:border-amber-400 hover:bg-amber-50/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-stone-900">
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </span>
                    {isSelected && (
                      <span className="h-4 w-4 rounded-full bg-[#780016] text-white flex items-center justify-center">
                        <Check className="h-2.5 w-2.5 stroke-3" />
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-emerald-800 font-semibold mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
                    Available Shubh Muhurat
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
