import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { priestApi } from '@/api/priest.api';
import { bookingApi } from '@/api/booking.api';
import { Booking } from '@/types/booking.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PriestBookingDetailsDialog } from '@/components/priest/PriestBookingDetailsDialog';
import { BlockTimeModal } from '@/components/priest/BlockTimeModal';
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge';
import { EditWorkingHoursModal } from '@/components/priest/EditWorkingHoursModal';
import {
  formatTimeAmPm,
  timeToMinutes,
  PriestException,
  getISTNow,
} from '@/lib/availabilityUtils';
import { formatFullDate } from '@/lib/utils';
import {
  Clock,
  Trash2,
  Calendar as CalendarIcon,
  CheckCircle2,
  Ban,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Info,
  CalendarDays,
  User,
  MapPin,
  Edit2,
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * PriestAvailabilityPage
 * Exception-Based 3-Month Rolling Calendar.
 * - Default: Available 07:00 AM to 09:00 PM every day for 90 days.
 * - Manage Full-Day Leaves & Partial Hour Blackouts with 1-click.
 * - Confirmed devotee bookings automatically subtracted from available windows.
 */
export const PriestAvailabilityPage: React.FC = () => {
  const { user } = useAuthStore();
  const priestId = user?.id || '';

  // Real-time IST Today state (Asia/Kolkata timezone - dynamic midnight rollover)
  const [currentIstState, setCurrentIstState] = useState(() => getISTNow());
  const todayStr = currentIstState.istDate;

  // Calendar State: 0 = current month, 1 = +1 month, 2 = +2 months (90 days total)
  const [monthOffset, setMonthOffset] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Dynamic heartbeat: keeps todayStr live so calendar never stays static at midnight
  useEffect(() => {
    const updateTime = () => {
      const now = getISTNow();
      setCurrentIstState((prev) => {
        if (prev.istDate !== now.istDate) {
          // Midnight rollover! Auto-advance selectedDate if user was on yesterday's date
          setSelectedDate((currSel) => (currSel === prev.istDate ? now.istDate : currSel));
          return now;
        }
        if (Math.abs(prev.istMinutes - now.istMinutes) >= 1) {
          return now;
        }
        return prev;
      });
    };

    const interval = setInterval(updateTime, 15000); // 15-second heartbeat
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateTime();
      }
    };
    window.addEventListener('focus', updateTime);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', updateTime);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  // Data State
  const [exceptions, setExceptions] = useState<PriestException[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [workingHours, setWorkingHours] = useState<{ defaultStartTime: string; defaultEndTime: string }>({
    defaultStartTime: '07:00',
    defaultEndTime: '21:00',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals State
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockModalInitialMode, setBlockModalInitialMode] = useState<'CUSTOM_HOURS' | 'BLOCK'>('CUSTOM_HOURS');
  const [isEditHoursModalOpen, setIsEditHoursModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Load bookings, working hours and client-side exceptions
  const loadScheduleData = async () => {
    try {
      setIsLoading(true);
      const [bookingData, whData] = await Promise.all([
        bookingApi.getPriestBookings(priestId),
        priestApi.getWorkingHours(priestId),
      ]);
      setBookings(bookingData || []);
      if (whData?.defaultStartTime && whData?.defaultEndTime) {
        setWorkingHours({
          defaultStartTime: whData.defaultStartTime,
          defaultEndTime: whData.defaultEndTime,
        });
      }

      // Load persistent exceptions from database
      const storedExceptions = await priestApi.getPriestExceptions(priestId);
      setExceptions(Array.isArray(storedExceptions) ? storedExceptions : []);
    } catch {
      toast.error('Failed to load schedule and bookings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadScheduleData();
  }, [priestId]);

  // Format concise hours for display (e.g. 7 AM or 7:30 AM)
  const formatDisplayHour = (timeStr: string) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return minutes > 0
      ? `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
      : `${displayHours} ${period}`;
  };

  const startMinutes = timeToMinutes(workingHours.defaultStartTime);
  const endMinutes = timeToMinutes(workingHours.defaultEndTime);
  const durationHours = Math.max(0, Math.round((endMinutes - startMinutes) / 60));
  const workingHoursDisplay = `${formatDisplayHour(workingHours.defaultStartTime)} – ${formatDisplayHour(workingHours.defaultEndTime)}`;

  // Save updated standard working hours
  const handleSaveWorkingHours = async (startTime: string, endTime: string) => {
    const res = await priestApi.updateWorkingHours(priestId, {
      defaultStartTime: startTime,
      defaultEndTime: endTime,
    });
    if (res && res.success === false) {
      throw new Error(res.message || 'Failed to update working hours.');
    }
    setWorkingHours({
      defaultStartTime: startTime,
      defaultEndTime: endTime,
    });
    toast.success(`Standard working hours updated to ${formatDisplayHour(startTime)} – ${formatDisplayHour(endTime)}.`);
  };

  // Calendar Month Computation (IST aligned)
  const { currentYear, currentMonth, monthTitle, firstDayOfWeek, daysInMonth, maxDateStr } = React.useMemo(() => {
    const [tYear, tMonth, tDay] = todayStr.split('-').map(Number);
    // Base view date on 1st of target month in IST
    const vDate = new Date(tYear, tMonth - 1 + monthOffset, 1);
    const cYear = vDate.getFullYear();
    const cMonth = vDate.getMonth();
    const mTitle = vDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const fDay = new Date(cYear, cMonth, 1).getDay();
    const dCount = new Date(cYear, cMonth + 1, 0).getDate();

    // 90 days rolling maximum in IST
    const maxD = new Date(tYear, tMonth - 1, tDay + 90);
    const mDateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(maxD);

    return {
      currentYear: cYear,
      currentMonth: cMonth,
      monthTitle: mTitle,
      firstDayOfWeek: fDay,
      daysInMonth: dCount,
      maxDateStr: mDateStr,
    };
  }, [todayStr, monthOffset]);

  // Toggle Full Day Leave
  const handleToggleFullDayLeave = async () => {
    if (isSubmitting) return;

    if (selectedDate < todayStr) {
      toast.error('Cannot modify schedule for past dates.');
      return;
    }

    const existingLeave = exceptions.find(
      (e) => e.date === selectedDate && e.type === 'FULL_DAY_LEAVE'
    );

    if (existingLeave) {
      try {
        setIsSubmitting(true);
        const res = await priestApi.deletePriestException(existingLeave.id, priestId);
        if (res && res.success === false) {
          toast.error(res.message || 'Failed to remove leave.');
          return;
        }
        setExceptions((prev) => prev.filter((e) => e.id !== existingLeave.id));
        await loadScheduleData();
        toast.success(`Leave removed for ${formatFullDate(selectedDate)}. You are now available ${workingHoursDisplay}.`);
      } catch {
        toast.error('Failed to remove leave.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      try {
        setIsSubmitting(true);
        const res = await priestApi.markFullDayOff({
          date: selectedDate,
          reason: 'Full Day Off / Leave',
          priestId,
        });

        if (res && res.success === false) {
          toast.error(res.message || 'Failed to mark day off.');
          return;
        }

        const saved = (res && res.data) ? res.data : res;
        const newLeave: PriestException = {
          id: saved?.id || `leave-${Date.now()}`,
          priestId,
          date: selectedDate,
          type: 'FULL_DAY_LEAVE',
          startTime: saved?.startTime || workingHours.defaultStartTime,
          endTime: saved?.endTime || workingHours.defaultEndTime,
          reason: saved?.reason || 'Full Day Off / Leave',
          createdAt: saved?.createdAt || new Date().toISOString(),
        };
        setExceptions((prev) => [...prev.filter((e) => e.id !== newLeave.id), newLeave]);
        await loadScheduleData();
        toast.success(`Marked ${formatFullDate(selectedDate)} as Day Off.`);
      } catch (err: any) {
        toast.error(err?.message || 'Failed to mark day off.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Add Specific Working Hours or Partial Break
  const handleSaveBlackout = async (
    startTime: string,
    endTime: string,
    reason: string,
    exceptionType: 'BLOCK' | 'CUSTOM_HOURS' = 'CUSTOM_HOURS'
  ) => {
    if (selectedDate < todayStr) {
      toast.error('Cannot configure working hours for past dates.');
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await priestApi.blockHours({
        date: selectedDate,
        startTime,
        endTime,
        reason,
        priestId,
        exceptionType,
      });

      if (res && res.success === false) {
        toast.error(res.message || 'Failed to configure hours.');
        return;
      }

      await loadScheduleData();
      if (exceptionType === 'CUSTOM_HOURS') {
        toast.success(`Specific working hours configured: ${formatTimeAmPm(startTime)} – ${formatTimeAmPm(endTime)} on ${formatFullDate(selectedDate)}.`);
      } else {
        toast.success(`Blocked break: ${formatTimeAmPm(startTime)} – ${formatTimeAmPm(endTime)} on ${formatFullDate(selectedDate)}.`);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to configure hours.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete a specific exception
  const handleDeleteException = async (exceptionId: string) => {
    try {
      await priestApi.deletePriestException(exceptionId, priestId);
      setExceptions((prev) => prev.filter((e) => e.id !== exceptionId));
      toast.success('Schedule updated. Reverted to standard hours.');
    } catch {
      toast.error('Failed to update schedule.');
    }
  };

  // Selected date status inspection
  const selectedDateExceptions = exceptions.filter((e) => e.date === selectedDate);
  const isSelectedFullLeave = selectedDateExceptions.some((e) => e.type === 'FULL_DAY_LEAVE');
  const selectedDateBlackouts = selectedDateExceptions.filter((e) => (e.type === 'PARTIAL_BLACKOUT' || e.exceptionType === 'BLOCK') && e.type !== 'FULL_DAY_LEAVE');
  const selectedDateBookings = bookings.filter((b) => {
    const bDate = (b.bookingDate || (b as any).scheduledDate || '').split('T')[0];
    return bDate === selectedDate && b.status !== 'CANCELLED';
  });

  const isSelectedPast = selectedDate < todayStr;
  const isSelectedToday = selectedDate === todayStr;
  const currentMinutesIST = currentIstState.istMinutes;
  const isPastWorkingHours = currentMinutesIST >= endMinutes;
  const isBeforeWorkingHours = currentMinutesIST < startMinutes;

  // Overall metrics across the 90-day window
  const totalLeavesCount = exceptions.filter((e) => e.type === 'FULL_DAY_LEAVE').length;
  const totalBlackoutsCount = exceptions.filter((e) => e.type === 'PARTIAL_BLACKOUT').length;
  const upcomingBookingsCount = bookings.filter((b) => b.bookingDate >= todayStr && b.status === 'CONFIRMED').length;

  return (
    <div className="space-y-8 w-full max-w-7xl text-stone-900 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-xl border-2 border-amber-300 bg-white shadow-xs">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-md bg-amber-400 text-stone-950 flex items-center justify-center font-serif font-black text-2xl shadow-md shrink-0 select-none">
            ॐ
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-stone-950">
              Availability & Leaves Calendar
            </h1>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              You are automatically set as <strong>Available 7:00 AM – 9:00 PM</strong> for the next 90 days. Simply mark your days off or busy hours below.
            </p>
          </div>
        </div>

        {/* 90-Day Rolling Badge */}
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 px-3 py-1.5 rounded-lg text-amber-900 text-xs font-bold shrink-0">
          <Sparkles className="h-4 w-4 text-amber-600" />
          <span>90-Day Rolling Calendar</span>
        </div>
      </div>

      {/* Metrics Summary Deck */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {/* 1. Default Working Hours */}
        <div className="p-5 rounded-lg border-2 border-amber-300 border-t-4 border-t-emerald-600 bg-white shadow-xs flex flex-col justify-between">
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
              onClick={() => setIsEditHoursModalOpen(true)}
              className="text-xs text-[#780016] hover:text-[#5C0011] font-bold bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-md cursor-pointer transition-colors inline-flex items-center gap-1 shrink-0 shadow-2xs"
              title="Configure daily standard hours"
            >
              <Edit2 className="h-3 w-3 text-red-700" />
              <span>Edit Hours</span>
            </button>
          </div>
        </div>

        {/* 2. Marked Days Off */}
        <div className="p-5 rounded-lg border-2 border-amber-300 border-t-4 border-t-red-600 bg-white shadow-xs flex flex-col justify-between">
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
        <div className="p-5 rounded-lg border-2 border-amber-300 border-t-4 border-t-amber-600 bg-white shadow-xs flex flex-col justify-between">
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
        <div className="p-5 rounded-lg border-2 border-amber-300 border-t-4 border-t-blue-600 bg-white shadow-xs flex flex-col justify-between">
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

      {/* Main Grid: Interactive Calendar on Left, Selected Day Inspector on Right */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Calendar Card */}
        <div className="flex-1 w-full bg-white p-6 rounded-xl border-2 border-amber-300 shadow-xs space-y-4">
          {/* Month Switcher Header */}
          <div className="flex items-center justify-between pb-3 border-b border-amber-200">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-red-700" />
              <h2 className="font-serif font-extrabold text-lg text-stone-900">
                {monthTitle}
              </h2>
              {isLoading && (
                <span className="text-xs text-amber-700 animate-pulse font-medium">
                  Syncing...
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={monthOffset === 0}
                onClick={() => setMonthOffset((prev) => Math.max(0, prev - 1))}
                className="h-8 px-2.5 border-amber-300 hover:bg-amber-50 text-stone-700"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline text-xs ml-1">Prev</span>
              </Button>

              <span className="text-xs font-bold text-amber-900 bg-amber-100/80 px-2.5 py-1 rounded">
                Month {monthOffset + 1} of 3
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={monthOffset >= 2}
                onClick={() => setMonthOffset((prev) => Math.min(2, prev + 1))}
                className="h-8 px-2.5 border-amber-300 hover:bg-amber-50 text-stone-700"
              >
                <span className="hidden sm:inline text-xs mr-1">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-stone-500 uppercase tracking-wider py-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Calendar Grid Days */}
          <div className="grid grid-cols-7 gap-2">
            {/* Blank leading days */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`blank-${i}`} className="h-24 bg-stone-50/40 rounded-lg border border-transparent" />
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
              const partialCount = dayExceptions.filter((e) => (e.type === 'PARTIAL_BLACKOUT' || e.exceptionType === 'BLOCK') && e.type !== 'FULL_DAY_LEAVE').length;
              const dayBookings = bookings.filter((b) => {
                const bDate = (b.bookingDate || (b as any).scheduledDate || '').split('T')[0];
                return bDate === dateStr && (b.status === 'CONFIRMED' || b.status === 'PENDING');
              });
              const dayConfirmedBookings = dayBookings.filter((b) => b.status === 'CONFIRMED');
              const dayPendingBookings = dayBookings.filter((b) => b.status === 'PENDING');

              return (
                <div
                  key={dateStr}
                  onClick={() => !isBeyond90 && setSelectedDate(dateStr)}
                  className={`h-24 p-2 rounded-lg border-2 transition-all flex flex-col justify-between select-none ${
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
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? 'text-[#780016] font-extrabold' : 'text-stone-800'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {isToday && (
                      <Badge variant="outline" className="text-[9px] px-1 py-0 bg-red-50 text-red-700 border-red-300 font-bold">
                        Today
                      </Badge>
                    )}
                  </div>

                  {/* Day Status Indicators */}
                  {!isDisabled && (
                    <div className="space-y-1">
                      {isLeave ? (
                        <div className="text-[10px] font-bold text-red-700 bg-red-100/90 rounded px-1 py-0.5 text-center">
                          Day Off
                        </div>
                      ) : (
                        <>
                          <div className="text-[10px] font-medium text-emerald-700 flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span className="truncate">{workingHoursDisplay}</span>
                          </div>

                          {partialCount > 0 && (
                            <div className="text-[9px] font-bold text-amber-800 bg-amber-100 rounded px-1 py-0.2 truncate">
                              ⚠️ {partialCount} blocked
                            </div>
                          )}

                          {dayBookings.length > 0 && (
                            <div className={`text-[9px] font-bold rounded px-1.5 py-0.5 truncate flex items-center gap-1 shadow-2xs ${
                              dayPendingBookings.length > 0 && dayConfirmedBookings.length === 0
                                ? 'text-amber-950 bg-amber-200 border border-amber-400'
                                : 'text-blue-900 bg-blue-100 border border-blue-300'
                            }`}>
                              <span>🪔</span>
                              <span className="truncate">
                                {dayBookings[0]?.serviceName?.split(' ')[0] || 'Puja'}
                                {(dayBookings[0]?.userName || dayBookings[0]?.user?.name || (dayBookings[0] as any)?.devoteeName)
                                  ? ` (${(dayBookings[0]?.userName || dayBookings[0]?.user?.name || (dayBookings[0] as any)?.devoteeName || '').split(' ')[0]})`
                                  : dayBookings.length > 1 ? ` (${dayBookings.length})` : ''}
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
          <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center gap-4 text-xs text-stone-600">
            <span className="font-bold text-stone-800">Legend:</span>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span>Available ({workingHoursDisplay})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <span>Day Off (Full Leave)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span>Blocked Hours</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span>Pending Booking</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
              <span>Confirmed Booking</span>
            </div>
          </div>
        </div>

        {/* Selected Day Inspector & Actions Panel */}
        <div className="w-full lg:w-96 bg-white p-6 rounded-xl border-2 border-amber-300 shadow-xs space-y-6">
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
                    Status: Opens at {formatDisplayHour(workingHours.defaultStartTime)} Today
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
                  onClick={handleToggleFullDayLeave}
                  className={`w-full justify-center gap-2 h-11 text-xs font-bold shadow-xs cursor-pointer ${
                    isSelectedFullLeave
                      ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                      : 'bg-red-800 hover:bg-red-900 text-white'
                  } ${(isSubmitting || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                    onClick={() => {
                      setBlockModalInitialMode('BLOCK');
                      setIsBlockModalOpen(true);
                    }}
                    className={`w-full justify-center gap-2 h-11 border-2 border-amber-400 text-stone-900 hover:bg-amber-50 font-bold text-xs cursor-pointer ${
                      (isSubmitting || isLoading) ? 'opacity-50 cursor-not-allowed' : ''
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
                <div className={`p-3 rounded-lg text-xs flex items-center justify-between ${
                  isSelectedPast
                    ? 'bg-stone-50 border border-stone-200'
                    : 'bg-emerald-50/70 border border-emerald-300'
                }`}>
                  <div>
                    <span className={`font-bold block ${isSelectedPast ? 'text-stone-700' : 'text-emerald-950'}`}>Standard Hours</span>
                    <span className={`text-[11px] ${isSelectedPast ? 'text-stone-500' : 'text-emerald-700'}`}>
                      {formatTimeAmPm(workingHours.defaultStartTime)} – {formatTimeAmPm(workingHours.defaultEndTime)} ({durationHours} hrs)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {!isSelectedPast && (
                      <button
                        type="button"
                        onClick={() => setIsEditHoursModalOpen(true)}
                        className="text-[10px] text-emerald-800 hover:underline font-semibold cursor-pointer"
                      >
                        Change
                      </button>
                    )}
                    <Badge variant="outline" className={`text-[10px] font-bold ${
                      isSelectedPast
                        ? 'bg-stone-100 text-stone-600 border-stone-300'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
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
                        <span>Blocked: {formatTimeAmPm(bo.startTime || '')} – {formatTimeAmPm(bo.endTime || '')}</span>
                      </div>
                      <div className="text-[11px] text-amber-800 mt-0.5">{bo.reason || 'Unavailable'}</div>
                    </div>
                    {!isSelectedPast && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteException(bo.id)}
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
                        onClick={() => {
                          setSelectedBooking(b);
                          setIsBookingModalOpen(true);
                        }}
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
                        ⏰ {formatTimeAmPm(b.startTime || '')} – {formatTimeAmPm(b.endTime || '')} ({b.status === 'CONFIRMED' ? 'Confirmed' : b.status === 'PENDING' ? 'Pending' : b.status})
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
      </div>

      {/* Partial Hour Blackout & Custom Specific Hours Modal */}
      <BlockTimeModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        selectedDate={selectedDate}
        initialMode={blockModalInitialMode}
        onSave={handleSaveBlackout}
      />

      {/* Edit Default Working Hours Modal */}
      <EditWorkingHoursModal
        isOpen={isEditHoursModalOpen}
        onClose={() => setIsEditHoursModalOpen(false)}
        initialStartTime={workingHours.defaultStartTime}
        initialEndTime={workingHours.defaultEndTime}
        onSave={handleSaveWorkingHours}
      />

      {/* Booking Details Modal */}
      <PriestBookingDetailsDialog
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedBooking(null);
        }}
        booking={selectedBooking}
      />
    </div>
  );
};

export default PriestAvailabilityPage;
