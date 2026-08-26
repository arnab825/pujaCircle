import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import {
  mockGetPriestSlots,
  mockCreatePriestSlot,
  mockToggleSlotStatus,
  mockDeleteSlot,
} from '@/mocks/mock-api';
import { PriestSlot } from '@/types/priest.types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AddSlotModal } from '@/components/priest/AddSlotModal';
import {
  Clock,
  Plus,
  Trash2,
  Ban,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { toast } from 'sonner';

export const PriestAvailabilityPage: React.FC = () => {
  const { user } = useAuthStore();
  const priestId = user?.id === 'user-priest-1' ? 'priest-1' : user?.id || 'priest-1';

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [slots, setSlots] = useState<PriestSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchSlots = async () => {
    try {
      const res = await mockGetPriestSlots(priestId);
      if (res.success) {
        setSlots(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [priestId]);

  const handleAddSlot = async (data: { date: string; startTime: string; endTime: string }): Promise<boolean> => {
    const res = await mockCreatePriestSlot(priestId, data);
    if (res.success) {
      fetchSlots();
      return true;
    } else {
      toast.error(res.message);
      return false;
    }
  };

  const handleToggleBlock = async (slot: PriestSlot) => {
    const newStatus = slot.status === 'AVAILABLE' ? 'BLOCKED' : 'AVAILABLE';
    const res = await mockToggleSlotStatus(slot.id, priestId, newStatus);
    if (res.success) {
      toast.success(res.message);
      fetchSlots();
    } else {
      toast.error(res.message);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    const res = await mockDeleteSlot(slotId, priestId);
    if (res.success) {
      toast.success(res.message);
      fetchSlots();
    } else {
      toast.error(res.message);
    }
  };

  // Group slots by date
  const selectedDateSlots = slots.filter((s) => s.date === selectedDate);
  const totalAvailable = slots.filter((s) => s.status === 'AVAILABLE').length;
  const totalBooked = slots.filter((s) => s.status === 'BOOKED').length;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-foreground flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            <span>Availability Slots</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your appointment calendar. Add multiple slots, block personal time, and track booked pujas.
          </p>
        </div>

        <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 text-xs h-9 self-start sm:self-auto">
          <Plus className="h-4 w-4" /> Add Availability Slot
        </Button>
      </div>

      {/* Date Filter & Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Date Selector */}
        <div className="sm:col-span-6 flex items-center gap-2 p-2 bg-muted/40 rounded-xl border">
          <CalendarIcon className="h-4 w-4 text-primary ml-2 shrink-0" />
          <span className="text-xs font-semibold shrink-0">Selected Date:</span>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs h-8 bg-card border-border"
          />
        </div>

        {/* Quick Metrics */}
        <div className="sm:col-span-6 flex items-center justify-end gap-3 text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-medium">
            ● {totalAvailable} Available
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 font-medium">
            ● {totalBooked} Booked
          </span>
        </div>
      </div>

      {/* Slots for Selected Date Card */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-serif">
              Slots for {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </CardTitle>
            <CardDescription className="text-xs">
              {selectedDateSlots.length} slot(s) configured for this date.
            </CardDescription>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAddModalOpen(true)}
            className="h-8 text-xs gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Add Slot for Date
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-muted-foreground">Loading calendar slots...</div>
          ) : selectedDateSlots.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <Clock className="h-8 w-8 mx-auto text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground">No availability slots scheduled for this date.</p>
              <Button size="sm" onClick={() => setIsAddModalOpen(true)} className="text-xs gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Schedule Muhurat Slot
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {selectedDateSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-foreground">
                          {slot.startTime} – {slot.endTime}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] py-0 ${
                            slot.status === 'AVAILABLE'
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                              : slot.status === 'BOOKED'
                              ? 'bg-primary/10 text-primary border-primary/30'
                              : 'bg-muted text-muted-foreground border-border'
                          }`}
                        >
                          {slot.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {slot.status === 'BOOKED'
                          ? 'Reserved for scheduled ceremony'
                          : slot.status === 'AVAILABLE'
                          ? 'Open for devotee booking requests'
                          : 'Blocked for personal time / traveling'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {slot.status !== 'BOOKED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleBlock(slot)}
                        className="h-8 text-xs gap-1 text-muted-foreground"
                      >
                        <Ban className="h-3.5 w-3.5" />
                        {slot.status === 'AVAILABLE' ? 'Block Slot' : 'Unblock'}
                      </Button>
                    )}

                    {slot.status !== 'BOOKED' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        aria-label="Delete slot"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}

                    {slot.status === 'BOOKED' && (
                      <span className="text-[11px] text-primary font-medium px-2 py-1 bg-primary/5 rounded-md border border-primary/20">
                        🔒 Booked appointment
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddSlotModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        selectedDate={selectedDate}
        existingSlots={slots}
        onAddSlot={handleAddSlot}
      />
    </div>
  );
};

export default PriestAvailabilityPage;
