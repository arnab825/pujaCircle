import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { availabilitySlotSchema, AvailabilitySlotInput } from '@/schemas/priest.schema';
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
import { Clock } from 'lucide-react';
import { toast } from 'sonner';

interface AddSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  existingSlots: PriestSlot[];
  onAddSlot: (data: { date: string; startTime: string; endTime: string }) => Promise<boolean>;
}

export const AddSlotModal: React.FC<AddSlotModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  existingSlots,
  onAddSlot,
}) => {
  const [addAnother, setAddAnother] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AvailabilitySlotInput>({
    resolver: zodResolver(availabilitySlotSchema),
    defaultValues: {
      date: selectedDate || new Date().toISOString().split('T')[0],
      startTime: '08:00',
      endTime: '10:00',
    },
  });

  const startTimeVal = watch('startTime');

  // Automatically suggest end time 2 hours after start time
  useEffect(() => {
    if (startTimeVal && /^([01]\d|2[0-3]):([0-5]\d)$/.test(startTimeVal)) {
      const [h, m] = startTimeVal.split(':').map(Number);
      const endH = (h + 2) % 24;
      const formattedEnd = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      setValue('endTime', formattedEnd, { shouldValidate: true });
    }
  }, [startTimeVal, setValue]);

  useEffect(() => {
    if (isOpen) {
      reset({
        date: selectedDate || new Date().toISOString().split('T')[0],
        startTime: '08:00',
        endTime: '10:00',
      });
    }
  }, [isOpen, selectedDate, reset]);

  const handleFormSubmit = async (data: AvailabilitySlotInput) => {
    setIsSubmitting(true);
    try {
      const success = await onAddSlot(data);
      if (success) {
        toast.success(`Slot ${data.startTime} - ${data.endTime} added!`);
        if (addAnother) {
          // Increment start time by 2.5 hours for quick chaining
          const [h, m] = data.endTime.split(':').map(Number);
          const nextStartH = (h + 1) % 24;
          const nextEndH = (nextStartH + 2) % 24;
          reset({
            date: data.date,
            startTime: `${String(nextStartH).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
            endTime: `${String(nextEndH).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
          });
        } else {
          onClose();
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentDateSlots = existingSlots.filter((s) => s.date === watch('date'));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" /> Add Availability Muhurat Slot
          </DialogTitle>
          <DialogDescription className="text-xs">
            Open appointment timings for devotees to book your Vedic rituals.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-2 text-xs">
          {/* Date Picker */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Date</Label>
            <Input type="date" {...register('date')} className="text-xs" />
            {errors.date && <p className="text-[11px] text-destructive">{errors.date.message}</p>}
          </div>

          {/* Time Pickers */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Start Time (HH:MM)</Label>
              <Input type="time" {...register('startTime')} className="text-xs" />
              {errors.startTime && (
                <p className="text-[11px] text-destructive">{errors.startTime.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">End Time (HH:MM)</Label>
              <Input type="time" {...register('endTime')} className="text-xs" />
              {errors.endTime && (
                <p className="text-[11px] text-destructive">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          {/* Existing Slots on this date preview */}
          {currentDateSlots.length > 0 && (
            <div className="p-3 rounded-lg bg-muted/40 border space-y-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground block">
                Existing Slots on {watch('date')}:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentDateSlots.map((s) => (
                  <span
                    key={s.id}
                    className={`text-[10px] px-2 py-0.5 rounded-md font-mono border ${
                      s.status === 'AVAILABLE'
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        : s.status === 'BOOKED'
                        ? 'bg-primary/10 text-primary border-primary/20'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {s.startTime} - {s.endTime} ({s.status})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Add Another Slot Checkbox */}
          <label className="flex items-center gap-2 pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={addAnother}
              onChange={(e) => setAddAnother(e.target.checked)}
              className="rounded text-primary h-4 w-4"
            />
            <span className="text-xs text-foreground font-medium">
              Keep dialog open to add another slot for this date
            </span>
          </label>

          <DialogFooter className="pt-2 gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="text-xs px-5">
              {isSubmitting ? 'Saving...' : 'Add Slot'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
