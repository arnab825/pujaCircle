import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { priestApi } from '@/api/priest.api';
import { bookingApi } from '@/api/booking.api';
import { Booking } from '@/types/booking.types';
import { PriestBookingDetailsDialog } from '@/components/priest/PriestBookingDetailsDialog';
import { BlockTimeModal } from '@/components/priest/BlockTimeModal';
import { EditWorkingHoursModal } from '@/components/priest/EditWorkingHoursModal';
import { AvailabilityStatsDeck } from '@/components/priest/availability/AvailabilityStatsDeck';
import { AvailabilityCalendarMatrix } from '@/components/priest/availability/AvailabilityCalendarMatrix';
import { AvailabilitySelectedDayPanel } from '@/components/priest/availability/AvailabilitySelectedDayPanel';
import {
  formatTimeAmPm,
  timeToMinutes,
  PriestException,
  getISTNow,
} from '@/lib/availabilityUtils';
import { formatFullDate } from '@/lib/utils';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';

/**
 * ============================================================================
 * [PAGE: PRIEST AVAILABILITY & LEAVES CALENDAR]
 * Exception-Based 3-Month Rolling Calendar:
 * - Default: Available 07:00 AM to 09:00 PM every day for 90 days.
 * - Manage Full-Day Leaves & Partial Hour Blackouts with 1-click.
 * - Confirmed devotee bookings automatically subtracted from available windows.
 * - 100% Flexbox, zero CSS Grids, pure solid colors, Haldi gold trims.
 * ============================================================================
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
          setSelectedDate((currSel) => (currSel === prev.istDate ? now.istDate : currSel));
          return now;
        }
        if (Math.abs(prev.istMinutes - now.istMinutes) >= 1) {
          return now;
        }
        return prev;
      });
    };

    const interval = setInterval(updateTime, 15000);
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
  const [blockModalInitialMode, setBlockModalInitialMode] = useState<'BLOCK' | 'CUSTOM_HOURS'>('BLOCK');
  const [isEditHoursModalOpen, setIsEditHoursModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Load schedule data
  const loadScheduleData = async () => {
    if (!priestId) return;
    try {
      setIsLoading(true);
      const [exceptionsData, workingHoursData, bookingsRes] = await Promise.all([
        priestApi.getPriestExceptions(priestId),
        priestApi.getWorkingHours(priestId),
        bookingApi.getPriestBookings(priestId),
      ]);

      setExceptions(exceptionsData || []);
      if (workingHoursData && workingHoursData.defaultStartTime && workingHoursData.defaultEndTime) {
        setWorkingHours({
          defaultStartTime: workingHoursData.defaultStartTime,
          defaultEndTime: workingHoursData.defaultEndTime,
        });
      }

      const activeBookings = (bookingsRes || []).filter(
        (b: Booking) => b.status === 'CONFIRMED' || b.status === 'PENDING'
      );
      setBookings(activeBookings);
    } catch {
      toast.error('Failed to sync calendar availability.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadScheduleData();
  }, [priestId]);

  // Compute 90-Day Rolling Boundaries
  const baseDate = new Date(`${todayStr}T00:00:00`);
  const maxDate = new Date(baseDate);
  maxDate.setDate(maxDate.getDate() + 90);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  // Active viewing month
  const targetDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + monthOffset, 1);
  const currentYear = targetDate.getFullYear();
  const currentMonth = targetDate.getMonth();
  const monthTitle = targetDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // Grid details for current active month
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Working hours math
  const startMinutes = timeToMinutes(workingHours.defaultStartTime);
  const endMinutes = timeToMinutes(workingHours.defaultEndTime);
  const durationHours = Math.round((endMinutes - startMinutes) / 60);
  const workingHoursDisplay = `${formatTimeAmPm(workingHours.defaultStartTime)} – ${formatTimeAmPm(workingHours.defaultEndTime)}`;

  // Save new default working hours
  const handleSaveWorkingHours = async (newStartTime: string, newEndTime: string) => {
    try {
      setIsSubmitting(true);
      const res = await priestApi.updateWorkingHours(priestId, {
        defaultStartTime: newStartTime,
        defaultEndTime: newEndTime,
      });

      if (res && res.success === false) {
        toast.error(res.message || 'Failed to update working hours.');
        return;
      }

      setWorkingHours({ defaultStartTime: newStartTime, defaultEndTime: newEndTime });
      await loadScheduleData();
      toast.success(`Standard working hours updated: ${formatTimeAmPm(newStartTime)} – ${formatTimeAmPm(newEndTime)}.`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update working hours.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Full-Day Leave
  const handleToggleFullDayLeave = async () => {
    if (selectedDate < todayStr) {
      toast.error('Cannot configure schedule for past dates.');
      return;
    }

    const existingLeave = exceptions.find((e) => e.date === selectedDate && e.type === 'FULL_DAY_LEAVE');

    if (existingLeave) {
      try {
        setIsSubmitting(true);
        await priestApi.deletePriestException(existingLeave.id, priestId);
        setExceptions((prev) => prev.filter((e) => e.id !== existingLeave.id));
        toast.success(`Leave cancelled for ${formatFullDate(selectedDate)}. Marked as Available.`);
      } catch {
        toast.error('Failed to cancel leave.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      try {
        setIsSubmitting(true);
        const res = await priestApi.markFullDayOff({
          date: selectedDate,
          reason: 'Personal Day Off',
          priestId,
        });

        if (res && res.success === false) {
          toast.error(res.message || 'Failed to mark day off.');
          return;
        }

        await loadScheduleData();
        toast.success(`Marked as Day Off on ${formatFullDate(selectedDate)}.`);
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
  const selectedDateBlackouts = selectedDateExceptions.filter(
    (e) => (e.type === 'PARTIAL_BLACKOUT' || e.exceptionType === 'BLOCK') && e.type !== 'FULL_DAY_LEAVE'
  );
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
      <AvailabilityStatsDeck
        workingHoursDisplay={workingHoursDisplay}
        durationHours={durationHours}
        totalLeavesCount={totalLeavesCount}
        totalBlackoutsCount={totalBlackoutsCount}
        upcomingBookingsCount={upcomingBookingsCount}
        onEditWorkingHours={() => setIsEditHoursModalOpen(true)}
      />

      {/* Main Grid: Interactive Calendar on Left, Selected Day Inspector on Right */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Calendar Card */}
        <AvailabilityCalendarMatrix
          monthTitle={monthTitle}
          monthOffset={monthOffset}
          setMonthOffset={setMonthOffset}
          isLoading={isLoading}
          firstDayOfWeek={firstDayOfWeek}
          daysInMonth={daysInMonth}
          currentYear={currentYear}
          currentMonth={currentMonth}
          todayStr={todayStr}
          maxDateStr={maxDateStr}
          selectedDate={selectedDate}
          onSelectDate={(date) => setSelectedDate(date)}
          exceptions={exceptions}
          bookings={bookings}
          workingHoursDisplay={workingHoursDisplay}
        />

        {/* Selected Day Inspector & Actions Panel */}
        <AvailabilitySelectedDayPanel
          selectedDate={selectedDate}
          isSelectedPast={isSelectedPast}
          isSelectedFullLeave={isSelectedFullLeave}
          isSelectedToday={isSelectedToday}
          isPastWorkingHours={isPastWorkingHours}
          isBeforeWorkingHours={isBeforeWorkingHours}
          workingHours={workingHours}
          durationHours={durationHours}
          isSubmitting={isSubmitting}
          isLoading={isLoading}
          onToggleFullDayLeave={handleToggleFullDayLeave}
          onOpenBlockHours={() => {
            setBlockModalInitialMode('BLOCK');
            setIsBlockModalOpen(true);
          }}
          onOpenEditHours={() => setIsEditHoursModalOpen(true)}
          selectedDateBlackouts={selectedDateBlackouts}
          onDeleteException={handleDeleteException}
          selectedDateBookings={selectedDateBookings}
          onViewBookingDetails={(b) => {
            setSelectedBooking(b);
            setIsBookingModalOpen(true);
          }}
        />
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
