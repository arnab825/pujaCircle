import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge';
import { PriestException, formatTimeAmPm } from '@/lib/availabilityUtils';
import { Booking } from '@/types/booking.types';
import { formatFullDate } from '@/lib/utils';
import {
  Clock,
  Ban,
  CheckCircle2,
  AlertTriangle,
  Info,
  Trash2,
  User,
  MapPin,
} from 'lucide-react';

interface AvailabilitySelectedDayPanelProps {
  selectedDate: string;
  isSelectedPast: boolean;
  isSelectedFullLeave: boolean;
  isSelectedToday: boolean;
  isPastWorkingHours: boolean;
  isBeforeWorkingHours: boolean;
  workingHours: { defaultStartTime: string; defaultEndTime: string };
  durationHours: number;
  isSubmitting: boolean;
  isLoading: boolean;
  onToggleFullDayLeave: () => void;
  onOpenBlockHours: () => void;
  onOpenEditHours: () => void;
  selectedDateBlackouts: PriestException[];
  onDeleteException: (id: string) => void;
  selectedDateBookings: Booking[];
  onViewBookingDetails: (booking: Booking) => void;
}

/**
 * ============================================================================
 * [COMPONENT: AVAILABILITY SELECTED DAY PANEL]
 * Inspector and actions sidebar for the selected calendar date:
 * - Date header & live status badge
 * - One-click actions ("Mark Full Day Off", "Block Break Hours")
 * - Schedule breakdown (standard hours, blackouts, confirmed pujas)
 * ============================================================================
 */
export const AvailabilitySelectedDayPanel: React.FC<AvailabilitySelectedDayPanelProps> = ({
  selectedDate,
  isSelectedPast,
  isSelectedFullLeave,
  isSelectedToday,
  isPastWorkingHours,
  isBeforeWorkingHours,
  workingHours,
  durationHours,
  isSubmitting,
  isLoading,
  onToggleFullDayLeave,
  onOpenBlockHours,
  onOpenEditHours,
  selectedDateBlackouts,
  onDeleteException,
  selectedDateBookings,
  onViewBookingDetails,
}) => {
  return (
    <div className="w-full lg:w-96 bg-white p-4 sm:p-6 rounded-xl border-2 border-amber-300 shadow-xs space-y-6">
      {/* Selected Date Header */}
      <div className="pb-3 border-b border-amber-200">
        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
          Selected Auspicious Date
        </span>
        <h2 className="text-xl font-serif font-black text-stone-900 mt-1">
          {formatFullDate(selectedDate)}
        </h2>
        <div className="flex items-center gap-2 mt-1">
          {isSelectedPast ? (
            <Badge className="bg-stone-100 text-stone-700 border-stone-300 text-xs font-bold gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-500" />
              Status: Concluded (Past Date)
            </Badge>
          ) : isSelectedFullLeave ? (
            <Badge className="bg-red-100 text-red-800 border-red-300 text-xs font-bold gap-1">
              <Ban className="w-3.5 h-3.5 text-red-600" />
              Status: Full Day Off
            </Badge>
          ) : isSelectedToday ? (
            isPastWorkingHours ? (
              <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-xs font-bold gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                Status: Hours Concluded for Today
              </Badge>
            ) : isBeforeWorkingHours ? (
              <Badge className="bg-blue-100 text-blue-900 border-blue-300 text-xs font-bold gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                Status: Opens at {formatTimeAmPm(workingHours.defaultStartTime)} Today
              </Badge>
            ) : (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs font-bold gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Status: Open For Bookings Today
              </Badge>
            )
          ) : (
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs font-bold gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Status: Open For Bookings
            </Badge>
          )}
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="space-y-3">
        {isSelectedPast ? (
          <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-600 text-xs flex items-start gap-2.5">
            <Info className="h-4 w-4 text-stone-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-stone-700">Past Date Locked</p>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                This ceremony date has already concluded. Calendar exceptions, working hours, and leaves can only be scheduled for active or future dates.
              </p>
            </div>
          </div>
        ) : (
          <>
            <Button
              disabled={isSubmitting || isLoading}
              onClick={onToggleFullDayLeave}
              className={`w-full justify-center gap-2 h-11 text-xs font-bold shadow-xs cursor-pointer ${
                isSelectedFullLeave
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                  : 'bg-red-800 hover:bg-red-900 text-white'
              } ${isSubmitting || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSelectedFullLeave ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Cancel Leave (Make Available)
                </>
              ) : (
                <>
                  <Ban className="h-4 w-4" /> Mark Full Day Off (Leave)
                </>
              )}
            </Button>

            {!isSelectedFullLeave && (
              <Button
                variant="outline"
                disabled={isSubmitting || isLoading}
                onClick={onOpenBlockHours}
                className={`w-full justify-center gap-2 h-11 border-2 border-amber-400 text-stone-900 hover:bg-amber-50 font-bold text-xs cursor-pointer ${
                  isSubmitting || isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Clock className="h-4 w-4 text-amber-700" />
                <span>Block Specific Hours (e.g. 1 PM – 4 PM)</span>
              </Button>
            )}
          </>
        )}
      </div>

      {/* Day Schedule Breakdown */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-amber-700" />
          <span>Schedule Breakdown</span>
        </h3>

        {isSelectedFullLeave ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
              <span>Marked as Day Off</span>
            </div>
            <p className="text-[11px] text-red-700">
              Devotees cannot book any ceremonies on this date. Click above to cancel leave.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* Default Working Window */}
            <div
              className={`p-3 rounded-lg text-xs flex items-center justify-between ${
                isSelectedPast
                  ? 'bg-stone-50 border border-stone-200'
                  : 'bg-emerald-50/70 border border-emerald-300'
              }`}
            >
              <div>
                <span className={`font-bold block ${isSelectedPast ? 'text-stone-700' : 'text-emerald-950'}`}>
                  Standard Hours
                </span>
                <span className={`text-[11px] ${isSelectedPast ? 'text-stone-500' : 'text-emerald-700'}`}>
                  {formatTimeAmPm(workingHours.defaultStartTime)} – {formatTimeAmPm(workingHours.defaultEndTime)} ({durationHours} hrs)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {!isSelectedPast && (
                  <button
                    type="button"
                    onClick={onOpenEditHours}
                    className="text-[10px] text-emerald-800 hover:underline font-semibold cursor-pointer"
                  >
                    Change
                  </button>
                )}
                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold ${
                    isSelectedPast
                      ? 'bg-stone-100 text-stone-600 border-stone-300'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {isSelectedPast ? 'Concluded' : 'Active'}
                </Badge>
              </div>
            </div>

            {/* Partial Blackouts List */}
            {selectedDateBlackouts.map((bo) => (
              <div
                key={bo.id}
                className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-amber-950 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-amber-700" />
                    <span>
                      Blocked: {formatTimeAmPm(bo.startTime || '')} – {formatTimeAmPm(bo.endTime || '')}
                    </span>
                  </div>
                  <div className="text-[11px] text-amber-800 mt-0.5">{bo.reason || 'Unavailable'}</div>
                </div>
                {!isSelectedPast && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteException(bo.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:bg-red-100 hover:text-red-800 cursor-pointer"
                    title="Remove blackout"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            {/* Appointments for Selected Date */}
            {selectedDateBookings.map((b) => (
              <div
                key={b.id}
                className={`p-3.5 rounded-lg text-xs space-y-2 border ${
                  b.status === 'CONFIRMED'
                    ? 'bg-blue-50/80 border-blue-300'
                    : b.status === 'REJECTED'
                    ? 'bg-red-50/80 border-red-200'
                    : 'bg-amber-50/90 border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-bold text-stone-950 flex flex-wrap items-center gap-2">
                    <span>🪔 {b.serviceName || 'Puja Ceremony'}</span>
                    <BookingStatusBadge status={b.status} withPulse={false} />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewBookingDetails(b)}
                    className="h-7 px-2.5 text-[11px] border-stone-300 text-stone-800 hover:bg-white font-bold bg-white/70 shrink-0 cursor-pointer"
                  >
                    Details
                  </Button>
                </div>

                {/* Devotee Name & Contact */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
                  <div className="font-bold text-stone-900 flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-amber-300 shadow-2xs">
                    <User className="w-3.5 h-3.5 text-[#780016]" />
                    <span className="text-stone-600 font-medium text-[11px]">Booked by:</span>
                    <span className="text-[#780016] font-serif font-extrabold text-xs">
                      {b.userName || b.user?.name || (b as any).devoteeName || (b as any).customerName || 'Devotee'}
                    </span>
                  </div>
                  {(b.userPhone || b.user?.phoneNumber) && (
                    <span className="text-stone-700 font-mono text-[11px] font-semibold bg-white px-2.5 py-1 rounded-md border border-stone-200">
                      📞 {b.userPhone || b.user?.phoneNumber}
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-stone-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-semibold text-stone-800">
                    ⏰ {formatTimeAmPm(b.startTime || '')} – {formatTimeAmPm(b.endTime || '')} (
                    {b.status === 'CONFIRMED' ? 'Confirmed' : b.status === 'PENDING' ? 'Pending' : b.status})
                  </span>
                  {b.address && (
                    <span className="text-stone-600 flex items-center gap-0.5">
                      <MapPin className="w-3 h-3 text-red-700 inline shrink-0" />
                      <span>{b.address.villageTown || b.address.locality || b.address.city}</span>
                    </span>
                  )}
                </div>

                {(b.specialInstructions || b.notes || b.userNotes) && (
                  <div className="text-[11px] text-amber-950 bg-amber-100/90 px-2.5 py-1 rounded border border-amber-300 font-medium">
                    <span className="font-bold">Gotra / Notes: </span>
                    <span>"{b.specialInstructions || b.notes || b.userNotes}"</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
