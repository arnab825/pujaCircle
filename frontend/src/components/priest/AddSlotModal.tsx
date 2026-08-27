import React, { useState, useEffect } from 'react';
import { PriestSlot } from '@/types/priest.types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Calendar as CalendarIcon, Sparkles, AlertCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface AddSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    data: { slotDate: string; startTime: string; endTime: string },
    addAnother?: boolean
  ) => Promise<boolean>;
  editingSlot?: PriestSlot | null;
  initialDate?: string;
}

export const AddSlotModal: React.FC<AddSlotModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingSlot,
  initialDate,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [slotDate, setSlotDate] = useState<string>(initialDate || todayStr);
  const [startTime, setStartTime] = useState<string>('10:00');
  const [endTime, setEndTime] = useState<string>('12:00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingAnother, setIsAddingAnother] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (editingSlot) {
      setSlotDate(editingSlot.slotDate || editingSlot.date || todayStr);
      setStartTime(editingSlot.startTime);
      setEndTime(editingSlot.endTime);
    } else {
      setSlotDate(initialDate || todayStr);
      setStartTime('10:00');
      setEndTime('12:00');
    }
    setErrorMsg(null);
  }, [editingSlot, initialDate, isOpen, todayStr]);

  const calculateDuration = (start: string, end: string): number => {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return eh * 60 + em - (sh * 60 + sm);
  };



  const applyPreset = (start: string, end: string) => {
    setStartTime(start);
    setEndTime(end);
    setErrorMsg(null);
  };

  const handleSubmit = async (addAnother: boolean = false) => {
    setErrorMsg(null);

    // Validation 1: Date must not be in the past
    if (slotDate < todayStr) {
      setErrorMsg('Please select a future date or today.');
      return;
    }

    // Validation 2: Time validation
    const duration = calculateDuration(startTime, endTime);
    if (duration <= 0) {
      setErrorMsg('End time must be after start time.');
      return;
    }
    if (duration < 30) {
      setErrorMsg('Slot duration must be at least 30 minutes.');
      return;
    }

    if (addAnother) {
      setIsAddingAnother(true);
    } else {
      setIsSubmitting(true);
    }

    try {
      const success = await onSave({ slotDate, startTime, endTime }, addAnother);
      if (success) {
        if (addAnother) {
          // Advance timings for quick next slot creation on same date
          const [curEndH, curEndM] = endTime.split(':').map(Number);
          const nextStartMinutes = curEndH * 60 + curEndM;
          const nextEndMinutes = Math.min(nextStartMinutes + duration, 23 * 60 + 59);

          const nsh = Math.floor(nextStartMinutes / 60);
          const nsm = nextStartMinutes % 60;
          const neh = Math.floor(nextEndMinutes / 60);
          const nem = nextEndMinutes % 60;

          if (nsh < 23) {
            setStartTime(`${String(nsh).padStart(2, '0')}:${String(nsm).padStart(2, '0')}`);
            setEndTime(`${String(neh).padStart(2, '0')}:${String(nem).padStart(2, '0')}`);
          }
          toast.success('Slot added! Ready to add next slot.');
        } else {
          onClose();
        }
      }
    } catch {
      setErrorMsg('An error occurred while saving availability.');
    } finally {
      setIsSubmitting(false);
      setIsAddingAnother(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-border/80 bg-card shadow-lg">
        {/* Header with Sacred Saffron accent */}
        <div className="bg-primary/5 px-6 pt-6 pb-4 border-b border-border/60">
          <DialogHeader className="space-y-1 text-left">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <DialogTitle className="text-lg font-bold font-serif text-foreground">
                {editingSlot ? 'Edit Availability Slot' : 'Add Availability'}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              {editingSlot
                ? 'Update your bookable hours for this date.'
                : 'Define an individual time window when devotees can book ceremonies with you.'}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Date Picker */}
          <div className="space-y-1.5">
            <Label htmlFor="slot-date" className="text-xs font-semibold flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5 text-primary" /> Date
            </Label>
            <Input
              id="slot-date"
              type="date"
              min={todayStr}
              value={slotDate}
              onChange={(e) => {
                setSlotDate(e.target.value);
                setErrorMsg(null);
              }}
              className="text-xs h-9 bg-card border-border"
              required
            />
          </div>

          {/* Time Pickers */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="start-time" className="text-xs font-semibold flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" /> Start Time
              </Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setErrorMsg(null);
                }}
                className="text-xs h-9 bg-card border-border font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="end-time" className="text-xs font-semibold flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" /> End Time
              </Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setErrorMsg(null);
                }}
                className="text-xs h-9 bg-card border-border font-mono"
                required
              />
            </div>
          </div>

          {/* Vedic Muhurat Presets */}
          <div className="space-y-1.5 pt-1 border-t border-border/40">
            <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" /> Standard Muhurat Times:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => applyPreset('08:00', '11:00')}
                className="p-6 text-center text-[13px] rounded-md border border-border bg-muted/20 hover:border-primary/40 hover:bg-primary/5 transition-colors"
              >
                <div className="font-medium text-foreground">Morning</div>
                <div className="text-muted-foreground font-mono text-[12px]">08:00 - 11:00</div>
              </button>
              <button
                type="button"
                onClick={() => applyPreset('11:30', '14:30')}
                className="p-6 text-center text-[13px] rounded-md border border-border bg-muted/20 hover:border-primary/40 hover:bg-primary/5 transition-colors"
              >
                <div className="font-medium text-foreground">Midday</div>
                <div className="text-muted-foreground font-mono text-[12px]">11:30 - 14:30</div>
              </button>
              <button
                type="button"
                onClick={() => applyPreset('16:00', '19:00')}
                className="p-6 text-center text-[13px] rounded-md border border-border bg-muted/20 hover:border-primary/40 hover:bg-primary/5 transition-colors"
              >
                <div className="font-medium text-foreground">Evening</div>
                <div className="text-muted-foreground font-mono text-[12px]">16:00 - 19:00</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <DialogFooter className="px-6 py-4 bg-muted/20 border-t border-border flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting || isAddingAnother}
            className="text-xs h-9"
          >
            Cancel
          </Button>

          {!editingSlot && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting || isAddingAnother}
              className="text-xs h-9 gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              {isAddingAnother ? 'Adding...' : 'Add & Add Another'}
            </Button>
          )}

          <Button
            type="button"
            size="sm"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting || isAddingAnother}
            className="text-xs h-9 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSubmitting
              ? 'Saving...'
              : editingSlot
                ? 'Save Changes'
                : 'Add Slot'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
