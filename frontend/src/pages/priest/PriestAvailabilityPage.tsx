import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { priestApi } from '@/api/priest.api';
import { bookingApi } from '@/api/booking.api';
import { PriestSlot } from '@/types/priest.types';
import { Booking } from '@/types/booking.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddSlotModal } from '@/components/priest/AddSlotModal';
import { PriestBookingDetailsDialog } from '@/components/priest/PriestBookingDetailsDialog';
import { formatTime, formatFullDate } from '@/lib/utils';
import {
  Clock,
  Plus,
  Trash2,
  Edit2,
  Calendar as CalendarIcon,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  History,
  CalendarDays,
} from 'lucide-react';
import { toast } from 'sonner';

export const PriestAvailabilityPage: React.FC = () => {
  const { user } = useAuthStore();
  const priestId = user?.id === 'user-priest-1' ? 'priest-1' : user?.id || 'priest-1';

  const todayStr = new Date().toISOString().split('T')[0];

  const [slots, setSlots] = useState<PriestSlot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<PriestSlot | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Past slots section collapse toggle
  const [showPastSlots, setShowPastSlots] = useState(false);

  const fetchSlotsAndBookings = async () => {
    try {
      setIsLoading(true);
      const [slotData, bookingData] = await Promise.all([
        priestApi.getPriestSlots(priestId),
        bookingApi.getPriestBookings(priestId),
      ]);
      setSlots(slotData);
      setBookings(bookingData);
    } catch {
      toast.error('Failed to load availability slots.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSlotsAndBookings();
  }, [priestId]);

  // Handle Save (Create or Update)
  const handleSaveSlot = async (
    data: { slotDate: string; startTime: string; endTime: string },
    addAnother: boolean = false
  ): Promise<boolean> => {
    try {
      if (editingSlot) {
        const res = await priestApi.updateAvailabilitySlot(editingSlot.id, priestId, data);
        if (res.success) {
          toast.success(res.message);
          await fetchSlotsAndBookings();
          setEditingSlot(null);
          return true;
        } else {
          toast.error(res.message);
          return false;
        }
      } else {
        const res = await priestApi.createAvailabilitySlot(priestId, data);
        if (res.success) {
          toast.success(res.message);
          await fetchSlotsAndBookings();
          if (!addAnother) {
            setIsAddModalOpen(false);
          }
          return true;
        } else {
          toast.error(res.message);
          return false;
        }
      }
    } catch {
      toast.error('An unexpected error occurred while saving availability.');
      return false;
    }
  };

  // Handle Delete
  const handleDeleteSlot = async (slot: PriestSlot) => {
    if (slot.status === 'BOOKED') {
      toast.error('Cannot delete a booked availability slot.');
      return;
    }

    if (!window.confirm(`Delete availability slot for ${formatFullDate(slot.slotDate || slot.date || '')} (${formatTime(slot.startTime)} - ${formatTime(slot.endTime)})?`)) {
      return;
    }

    try {
      const res = await priestApi.deleteAvailabilitySlot(slot.id, priestId);
      if (res.success) {
        toast.success(res.message);
        fetchSlotsAndBookings();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('Failed to remove availability slot.');
    }
  };

  // Handle View Booking
  const handleViewBooking = (slot: PriestSlot) => {
    const slotDate = slot.slotDate || slot.date;
    const matchedBooking = bookings.find(
      (b) =>
        b.priestId === priestId &&
        (b.slotId === slot.id || b.availabilitySlotId === slot.id ||
          (b.bookingDate === slotDate && b.startTime === slot.startTime))
    );

    if (matchedBooking) {
      setSelectedBooking(matchedBooking);
      setIsBookingModalOpen(true);
    } else {
      toast.info('Booking details for this time slot are currently being processed.');
    }
  };

  // Separate upcoming and past slots
  const upcomingSlots = slots.filter((s) => (s.slotDate || s.date || '') >= todayStr);
  const pastSlots = slots.filter((s) => (s.slotDate || s.date || '') < todayStr);

  // Group upcoming slots by date
  const groupedUpcoming: Record<string, PriestSlot[]> = {};
  upcomingSlots.forEach((slot) => {
    const d = slot.slotDate || slot.date || '';
    if (!groupedUpcoming[d]) {
      groupedUpcoming[d] = [];
    }
    groupedUpcoming[d].push(slot);
  });

  // Group past slots by date
  const groupedPast: Record<string, PriestSlot[]> = {};
  pastSlots.forEach((slot) => {
    const d = slot.slotDate || slot.date || '';
    if (!groupedPast[d]) {
      groupedPast[d] = [];
    }
    groupedPast[d].push(slot);
  });

  const upcomingDates = Object.keys(groupedUpcoming).sort();
  const pastDates = Object.keys(groupedPast).sort().reverse();

  // Metrics
  const totalUpcomingCount = upcomingSlots.length;
  const availableUpcomingCount = upcomingSlots.filter((s) => s.status === 'AVAILABLE').length;
  const bookedUpcomingCount = upcomingSlots.filter((s) => s.status === 'BOOKED').length;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-foreground flex items-center gap-2.5">
            <Clock className="h-7 w-7 text-primary shrink-0" />
            <span>Availability Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Set your specific date & time availability for devotees to book auspicious ceremonies.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingSlot(null);
            setIsAddModalOpen(true);
          }}
          className="gap-2 text-xs sm:text-sm h-10 px-4 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>+ Add Availability</span>
        </Button>
      </div>

      {/* Metrics Summary Banner */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border/80 bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Total Upcoming
            </span>
            <CalendarDays className="h-4 w-4 text-muted-foreground/60" />
          </div>
          <div className="text-2xl font-bold font-serif text-foreground mt-1">
            {totalUpcomingCount}
          </div>
        </Card>

        <Card className="border-border/80 bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Available Slots
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-serif text-emerald-600 dark:text-emerald-400 mt-1">
            {availableUpcomingCount}
          </div>
        </Card>

        <Card className="border-border/80 bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
              Booked Ceremonies
            </span>
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold font-serif text-primary mt-1">
            {bookedUpcomingCount}
          </div>
        </Card>
      </div>

      {/* SECTION 1: UPCOMING AVAILABILITY */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-1 border-b border-border/60">
          <div>
            <h2 className="text-lg font-bold font-serif text-foreground flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-primary" />
              <span>Upcoming Availability</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Dates and time windows currently open or reserved on your schedule.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-xs text-muted-foreground">
            Loading your availability calendar...
          </div>
        ) : upcomingDates.length === 0 ? (
          <Card className="border-dashed border-border/80 p-10 text-center bg-card">
            <div className="max-w-md mx-auto space-y-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                <CalendarIcon className="h-6 w-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-foreground">No Upcoming Availability Set</h3>
              <p className="text-xs text-muted-foreground">
                You haven't listed any availability slots yet. Add your available dates and hours so devotees can request bookings.
              </p>
              <Button
                onClick={() => {
                  setEditingSlot(null);
                  setIsAddModalOpen(true);
                }}
                className="gap-2 text-xs h-9 mt-2 bg-primary text-primary-foreground"
              >
                <Plus className="h-4 w-4" /> Add Your First Slot
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {upcomingDates.map((dateStr) => {
              const daySlots = groupedUpcoming[dateStr];
              const isToday = dateStr === todayStr;

              return (
                <div key={dateStr} className="space-y-3">
                  {/* Date Heading */}
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    <h3 className="text-sm font-bold font-serif text-foreground">
                      {formatFullDate(dateStr)}
                    </h3>
                    {isToday && (
                      <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                        Today
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      ({daySlots.length} {daySlots.length === 1 ? 'slot' : 'slots'})
                    </span>
                  </div>

                  {/* Slots Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {daySlots.map((slot) => {
                      const isAvailable = slot.status === 'AVAILABLE';

                      return (
                        <Card
                          key={slot.id}
                          className={`border transition-all shadow-2xs ${
                            isAvailable
                              ? 'bg-card border-border hover:border-emerald-500/40'
                              : 'bg-primary/5 border-primary/30'
                          }`}
                        >
                          <CardContent className="p-4 space-y-3">
                            {/* Time & Status Row */}
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="font-mono text-sm font-bold text-foreground">
                                  {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                                </div>
                                <span className="text-[11px] text-muted-foreground block mt-0.5">
                                  Puja Window
                                </span>
                              </div>

                              <Badge
                                variant="outline"
                                className={`text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 ${
                                  isAvailable
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                    : 'bg-primary/15 text-primary border-primary/40'
                                }`}
                              >
                                {isAvailable ? (
                                  <span className="flex items-center gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    AVAILABLE
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    BOOKED
                                  </span>
                                )}
                              </Badge>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="pt-2 border-t border-border/50 flex items-center justify-end gap-2">
                              {isAvailable ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setEditingSlot(slot);
                                      setIsAddModalOpen(true);
                                    }}
                                    className="h-7 px-2.5 text-xs text-muted-foreground hover:text-primary gap-1"
                                  >
                                    <Edit2 className="h-3 w-3" /> Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteSlot(slot)}
                                    className="h-7 px-2.5 text-xs text-muted-foreground hover:text-destructive gap-1"
                                  >
                                    <Trash2 className="h-3 w-3" /> Delete
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewBooking(slot)}
                                  className="h-7 px-3 text-xs gap-1.5 bg-background border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                                >
                                  <ExternalLink className="h-3 w-3" /> View Booking
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: PAST AVAILABILITY */}
      {pastSlots.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-border/60">
          <button
            type="button"
            onClick={() => setShowPastSlots(!showPastSlots)}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 border border-border transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              <span className="font-serif font-semibold text-sm text-foreground">
                Past Availability History
              </span>
              <Badge variant="outline" className="text-[10px]">
                {pastSlots.length} {pastSlots.length === 1 ? 'record' : 'records'}
              </Badge>
            </div>
            {showPastSlots ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {showPastSlots && (
            <div className="space-y-5 animate-in fade-in pt-2">
              {pastDates.map((dateStr) => {
                const daySlots = groupedPast[dateStr];

                return (
                  <div key={dateStr} className="space-y-2">
                    <h4 className="text-xs font-semibold font-serif text-muted-foreground">
                      {formatFullDate(dateStr)}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {daySlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="p-3 rounded-lg border border-border/60 bg-muted/20 flex items-center justify-between gap-2"
                        >
                          <div className="font-mono text-xs text-foreground">
                            {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-[9px] ${
                              slot.status === 'BOOKED'
                                ? 'bg-primary/10 text-primary border-primary/20'
                                : 'bg-muted text-muted-foreground border-border'
                            }`}
                          >
                            {slot.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Slot Modal */}
      <AddSlotModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingSlot(null);
        }}
        onSave={handleSaveSlot}
        editingSlot={editingSlot}
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
