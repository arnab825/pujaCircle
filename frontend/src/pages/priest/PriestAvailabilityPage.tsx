import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Trash2,
  Ban,
  CheckCircle2,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  Zap,
  CalendarDays,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { mockSlots, mockBookings, mockRituals } from '@/mocks/db';
import { PriestSlot, SlotStatus } from '@/types/priest.types';

/**
 * Pre-defined Vedic Muhurat Presets for fast slot scheduling
 */
const MUHURAT_PRESETS = [
  {
    name: 'Brahma / Pratah Muhurat',
    icon: Sunrise,
    startTime: '07:00',
    endTime: '10:00',
    description: 'Early morning auspicious rituals (Griha Pravesh, Vastu)',
  },
  {
    name: 'Madhyahna Muhurat',
    icon: Sun,
    startTime: '11:00',
    endTime: '14:00',
    description: 'Midday Katha, Havan, and Vrat rituals',
  },
  {
    name: 'Sandhya Muhurat',
    icon: Sunset,
    startTime: '16:30',
    endTime: '19:30',
    description: 'Evening Aarti, Abhishek & Shanti ceremonies',
  },
];

/**
 * PAGE: Priest Availability & Slot Management (/priest/availability)
 * 
 * ACCESS:
 * - PRIEST role only (Inside PriestLayout)
 * 
 * PURPOSE:
 * - Configure daily muhurat time slots (07:30 - 10:30, etc.)
 * - Mark slots as AVAILABLE, BOOKED, or BLOCKED for temple/personal travel
 * - Add new slots using custom time or Vedic presets
 * 
 * DATA SOURCE:
 * - Centralized mock data from @/mocks/db (mockSlots, mockBookings, mockRituals)
 */
const PriestAvailabilityPage: React.FC = () => {
  // Slots state initialized from centralized mock database
  const [slots, setSlots] = useState<PriestSlot[]>(mockSlots);

  // Active date selection (defaults to 2026-08-25)
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-25');
  const [statusFilter, setStatusFilter] = useState<'ALL' | SlotStatus>('ALL');

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [newDate, setNewDate] = useState<string>('2026-08-25');
  const [newStartTime, setNewStartTime] = useState<string>('07:30');
  const [newEndTime, setNewEndTime] = useState<string>('10:30');
  const [newStatus, setNewStatus] = useState<SlotStatus>('AVAILABLE');

  // Generate a consecutive 7-day strip starting from 2026-08-24
  const dateStrip = useMemo(() => {
    const dates = [];
    const base = new Date('2026-08-24T00:00:00Z');
    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dates.push({ iso, dayName, monthDay });
    }
    return dates;
  }, []);

  // Filter slots by selected date and status
  const visibleSlots = useMemo(() => {
    return slots.filter((slot) => {
      const matchesDate = selectedDate ? slot.date === selectedDate : true;
      const matchesStatus = statusFilter === 'ALL' || slot.status === statusFilter;
      return matchesDate && matchesStatus;
    });
  }, [slots, selectedDate, statusFilter]);

  // Status breakdown metrics
  const stats = useMemo(() => {
    const daySlots = slots.filter((s) => s.date === selectedDate);
    return {
      total: daySlots.length,
      available: daySlots.filter((s) => s.status === 'AVAILABLE').length,
      booked: daySlots.filter((s) => s.status === 'BOOKED').length,
      blocked: daySlots.filter((s) => s.status === 'BLOCKED').length,
    };
  }, [slots, selectedDate]);

  // Toggle slot availability between AVAILABLE and BLOCKED
  const handleToggleStatus = (slotId: string) => {
    setSlots((prev) =>
      prev.map((s) => {
        if (s.id !== slotId) return s;
        if (s.status === 'BOOKED') return s; // Cannot toggle booked slot
        const nextStatus: SlotStatus = s.status === 'AVAILABLE' ? 'BLOCKED' : 'AVAILABLE';
        toast.success(
          nextStatus === 'AVAILABLE'
            ? 'Slot marked as Available for devotees.'
            : 'Slot blocked for personal/temple duties.'
        );
        return { ...s, status: nextStatus };
      })
    );
  };

  // Delete a slot
  const handleDeleteSlot = (slotId: string) => {
    const target = slots.find((s) => s.id === slotId);
    if (target?.status === 'BOOKED') {
      toast.error('Cannot remove a booked ceremony slot.');
      return;
    }
    setSlots((prev) => prev.filter((s) => s.id !== slotId));
    toast.success('Muhurat time slot removed.');
  };

  // Add a new slot
  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newStartTime || !newEndTime) {
      toast.error('Please enter valid start and end times.');
      return;
    }

    if (newStartTime >= newEndTime) {
      toast.error('End time must be after start time.');
      return;
    }

    const newSlot: PriestSlot = {
      id: `slot-${Date.now()}`,
      priestId: 'priest-1',
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      status: newStatus,
    };

    setSlots((prev) => [...prev, newSlot]);
    setIsDialogOpen(false);
    setSelectedDate(newDate);
    toast.success(`Muhurat slot added for ${newDate} (${newStartTime} - ${newEndTime})`);
  };

  // Preset fast-picker handler
  const handleApplyPreset = (startTime: string, endTime: string) => {
    setNewStartTime(startTime);
    setNewEndTime(endTime);
  };

  // Generate Standard Weekly Muhurat Schedule
  const handleGenerateStandardWeek = () => {
    const generated: PriestSlot[] = [];
    dateStrip.forEach((day, idx) => {
      generated.push({
        id: `slot-gen-morn-${idx}-${Date.now()}`,
        priestId: 'priest-1',
        date: day.iso,
        startTime: '07:30',
        endTime: '10:30',
        status: 'AVAILABLE',
      });
      generated.push({
        id: `slot-gen-eve-${idx}-${Date.now()}`,
        priestId: 'priest-1',
        date: day.iso,
        startTime: '16:30',
        endTime: '19:30',
        status: 'AVAILABLE',
      });
    });

    setSlots((prev) => {
      // Keep existing non-duplicate slots
      const existingDates = new Set(prev.map((s) => `${s.date}_${s.startTime}`));
      const nonDuplicateNew = generated.filter((g) => !existingDates.has(`${g.date}_${g.startTime}`));
      return [...prev, ...nonDuplicateNew];
    });

    toast.success('Generated standard Morning & Evening muhurat slots for the week!');
  };

  // Resolve booking information if a slot is BOOKED
  const getBookingForSlot = (slotId: string) => {
    const booking = mockBookings.find((b) => b.slotId === slotId);
    if (!booking) return null;
    const ritual = mockRituals.find((r) => r.id === booking.ritualId);
    return {
      reference: booking.bookingReference,
      ritualName: ritual?.name || 'Vedic Ceremony',
    };
  };

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-primary border-primary/30 text-[11px] font-medium">
              <Sparkles className="w-3 h-3 mr-1 text-primary" />
              Calendar & Muhurat Configuration
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-foreground">
            Schedule & Slot Availability
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Configure your daily muhurat timings and manage blocked dates for temple or family duties.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={handleGenerateStandardWeek}
            className="text-xs gap-1.5 border-primary/30 hover:bg-primary/5 hidden sm:inline-flex"
          >
            <Zap className="w-3.5 h-3.5 text-primary" />
            Populate Week Template
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setNewDate(selectedDate);
              setIsDialogOpen(true);
            }}
            className="text-xs gap-1.5 bg-primary hover:bg-brand-saffron-dark text-primary-foreground shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Time Slot
          </Button>
        </div>
      </div>

      {/* 2. Date Navigation Strip */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            Select Muhurat Date
          </h3>
          <span className="text-xs text-muted-foreground">Showing dates for August 2026</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          {dateStrip.map((day) => {
            const isSelected = selectedDate === day.iso;
            const countForDay = slots.filter((s) => s.date === day.iso).length;
            const hasBooked = slots.some((s) => s.date === day.iso && s.status === 'BOOKED');

            return (
              <button
                key={day.iso}
                type="button"
                onClick={() => setSelectedDate(day.iso)}
                className={`p-3 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary shadow-md ring-2 ring-primary/20'
                    : 'bg-card text-foreground hover:border-primary/40 hover:bg-accent/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-semibold uppercase ${isSelected ? 'text-primary-foreground/90' : 'text-muted-foreground'}`}>
                    {day.dayName}
                  </span>
                  {hasBooked && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-card" title="Has booked ceremony" />
                  )}
                </div>
                <p className={`text-base font-bold mt-1 ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}>
                  {day.monthDay}
                </p>
                <p className={`text-[11px] mt-0.5 ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  {countForDay} {countForDay === 1 ? 'Slot' : 'Slots'}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Daily Summary Stats & Filter Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 border-border/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Slots</span>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">{stats.total}</p>
        </Card>

        <Card className="p-4 border-border/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Available</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">{stats.available}</p>
        </Card>

        <Card className="p-4 border-border/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-primary">Booked</span>
            <CalendarIcon className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">{stats.booked}</p>
        </Card>

        <Card className="p-4 border-border/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Blocked</span>
            <Ban className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">{stats.blocked}</p>
        </Card>
      </div>

      {/* 4. Slot Filter Tabs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5">
          {(['ALL', 'AVAILABLE', 'BOOKED', 'BLOCKED'] as const).map((status) => (
            <Button
              key={status}
              size="sm"
              variant={statusFilter === status ? 'default' : 'outline'}
              onClick={() => setStatusFilter(status)}
              className={`text-xs h-8 ${
                statusFilter === status
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {status === 'ALL' ? 'All Slots' : status.charAt(0) + status.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>

        <div className="text-xs text-muted-foreground">
          Selected Date:{' '}
          <strong className="text-foreground font-semibold">
            {new Date(selectedDate + 'T00:00:00Z').toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </strong>
        </div>
      </div>

      {/* 5. Slot Grid / Cards */}
      {visibleSlots.length === 0 ? (
        <Card className="p-10 text-center space-y-3 bg-muted/10 border-dashed">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-foreground">No Muhurat Slots Found</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
              There are currently no slots configured matching your filter for this date.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setNewDate(selectedDate);
              setIsDialogOpen(true);
            }}
            className="text-xs gap-1.5 mt-2"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Slot for {selectedDate}
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleSlots.map((slot) => {
            const booking = slot.status === 'BOOKED' ? getBookingForSlot(slot.id) : null;

            return (
              <Card
                key={slot.id}
                className={`shadow-sm transition-all border ${
                  slot.status === 'AVAILABLE'
                    ? 'hover:border-emerald-500/50 bg-card'
                    : slot.status === 'BOOKED'
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-muted bg-muted/20 opacity-85'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <CardTitle className="text-base font-semibold text-foreground font-sans">
                        {slot.startTime} – {slot.endTime}
                      </CardTitle>
                    </div>

                    <Badge
                      variant="outline"
                      className={`text-[10px] uppercase font-semibold ${
                        slot.status === 'AVAILABLE'
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : slot.status === 'BOOKED'
                          ? 'border-primary/30 bg-primary/10 text-primary'
                          : 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {slot.status}
                    </Badge>
                  </div>

                  <CardDescription className="text-xs">
                    Date: {slot.date}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-1">
                  {/* Status contextual information */}
                  {slot.status === 'BOOKED' && booking && (
                    <div className="p-2.5 rounded-lg bg-card border border-primary/20 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground">{booking.ritualName}</span>
                        <Badge variant="secondary" className="text-[10px]">
                          {booking.reference}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Confirmed devotee booking on PujaCircle
                      </p>
                    </div>
                  )}

                  {slot.status === 'AVAILABLE' && (
                    <p className="text-xs text-muted-foreground">
                      Open for devotee bookings during this auspicious muhurat interval.
                    </p>
                  )}

                  {slot.status === 'BLOCKED' && (
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      Blocked for personal or local temple commitments.
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/60">
                    {slot.status === 'BOOKED' ? (
                      <Link to="/priest/bookings" className="w-full">
                        <Button size="sm" variant="outline" className="w-full text-xs gap-1.5">
                          View in Ceremony Ledger <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleStatus(slot.id)}
                          className={`text-xs gap-1.5 ${
                            slot.status === 'AVAILABLE'
                              ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-500/10'
                              : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10'
                          }`}
                        >
                          {slot.status === 'AVAILABLE' ? (
                            <>
                              <Ban className="w-3.5 h-3.5" /> Block Slot
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Make Available
                            </>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-2 h-8"
                          title="Delete slot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* 6. Enhanced "Add Time Slot" Modal Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[540px] p-6 rounded-2xl border-border shadow-2xl">
          {/* Header with Icon Accent */}
          <DialogHeader className="pb-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-left">
                <DialogTitle className="font-serif text-lg font-bold text-foreground tracking-tight">
                  Add Muhurat Time Slot
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Define your availability for sacred ritual ceremonies on PujaCircle.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateSlot} className="space-y-4 pt-2">
            {/* Quick Muhurat Presets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Quick Vedic Muhurat Presets
                </Label>
                <span className="text-[11px] text-primary font-medium">Click to apply</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {MUHURAT_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  const isMatch = newStartTime === preset.startTime && newEndTime === preset.endTime;

                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleApplyPreset(preset.startTime, preset.endTime)}
                      className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between h-[88px] ${
                        isMatch
                          ? 'border-primary bg-primary/10 ring-2 ring-primary/20 shadow-sm'
                          : 'border-border bg-card hover:border-primary/40 hover:bg-accent/30 text-muted-foreground'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div
                          className={`p-1.5 rounded-lg ${
                            isMatch ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                            isMatch
                              ? 'bg-primary/20 text-primary font-bold'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {preset.startTime}
                        </span>
                      </div>

                      <div>
                        <p
                          className={`text-xs font-semibold leading-snug line-clamp-1 ${
                            isMatch ? 'text-foreground' : 'text-foreground'
                          }`}
                        >
                          {preset.name.split('/')[0].trim()}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {preset.startTime} – {preset.endTime}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date Input with Right-aligned Calendar Icon */}
            <div className="space-y-1.5">
              <Label htmlFor="slot-date" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-primary" />
                Scheduled Date
              </Label>
              <div className="relative">
                <Input
                  id="slot-date"
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="text-xs h-9.5 bg-card border-border rounded-lg px-3.5 focus-visible:ring-primary w-full cursor-pointer [&::-webkit-calendar-picker-indicator]:ml-auto [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-75 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:filter hover:[&::-webkit-calendar-picker-indicator]:scale-110 transition-all"
                  required
                />
              </div>
            </div>

            {/* Custom Start / End Times with Right-aligned Clock Icons */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                Muhurat Time Interval
              </Label>
              <div className="grid grid-cols-2 gap-3 items-center">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-medium text-muted-foreground">Start Time</span>
                  <div className="relative">
                    <Input
                      type="time"
                      value={newStartTime}
                      onChange={(e) => setNewStartTime(e.target.value)}
                      className="text-xs h-9.5 bg-card border-border rounded-lg px-3.5 focus-visible:ring-primary w-full cursor-pointer [&::-webkit-calendar-picker-indicator]:ml-auto [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-75 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 hover:[&::-webkit-calendar-picker-indicator]:scale-110 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-medium text-muted-foreground">End Time</span>
                  <div className="relative">
                    <Input
                      type="time"
                      value={newEndTime}
                      onChange={(e) => setNewEndTime(e.target.value)}
                      className="text-xs h-9.5 bg-card border-border rounded-lg px-3.5 focus-visible:ring-primary w-full cursor-pointer [&::-webkit-calendar-picker-indicator]:ml-auto [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-75 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 hover:[&::-webkit-calendar-picker-indicator]:scale-110 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Status Cards Selector */}
            <div className="space-y-1.5 pt-0.5">
              <Label className="text-xs font-semibold text-foreground">
                Initial Slot Status
              </Label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setNewStatus('AVAILABLE')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                    newStatus === 'AVAILABLE'
                      ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20'
                      : 'border-border bg-card hover:bg-accent/30 text-muted-foreground'
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                      newStatus === 'AVAILABLE'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Available</p>
                    <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                      Open for devotee puja bookings
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setNewStatus('BLOCKED')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                    newStatus === 'BLOCKED'
                      ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/20'
                      : 'border-border bg-card hover:bg-accent/30 text-muted-foreground'
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                      newStatus === 'BLOCKED'
                        ? 'bg-amber-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Ban className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Blocked</p>
                    <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                      Temple duties or travel
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <DialogFooter className="pt-3 border-t border-border/60 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDialogOpen(false)}
                className="text-xs h-9 rounded-lg px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="text-xs h-9 rounded-lg px-5 bg-primary hover:bg-brand-saffron-dark text-primary-foreground shadow-sm font-medium"
              >
                Save Muhurat Slot
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PriestAvailabilityPage;
