import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { availabilityExceptionSchema, AvailabilityExceptionInput } from '@/schemas/priest.schema';
import { AvailabilityException } from '@/types/priest.types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CalendarOff, Plus, Trash2 } from 'lucide-react';

interface AddExceptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exception: Omit<AvailabilityException, 'id' | 'priestId' | 'createdAt'>) => Promise<boolean>;
  initialDate?: string;
}

export const AddExceptionModal: React.FC<AddExceptionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialDate,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customSlots, setCustomSlots] = useState<Array<{ startTime: string; endTime: string }>>([
    { startTime: '10:00', endTime: '13:00' },
  ]);

  const todayStr = initialDate || new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AvailabilityExceptionInput>({
    resolver: zodResolver(availabilityExceptionSchema),
    defaultValues: {
      date: todayStr,
      type: 'BLOCKED',
      reason: '',
    },
  });

  const selectedType = watch('type');

  const handleAddCustomSlot = () => {
    setCustomSlots([...customSlots, { startTime: '14:00', endTime: '17:00' }]);
  };

  const handleRemoveCustomSlot = (index: number) => {
    setCustomSlots(customSlots.filter((_, i) => i !== index));
  };

  const handleCustomSlotChange = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const next = [...customSlots];
    next[index][field] = value;
    setCustomSlots(next);
  };

  const onSubmit = async (data: AvailabilityExceptionInput) => {
    setIsSubmitting(true);
    try {
      const payload: Omit<AvailabilityException, 'id' | 'priestId' | 'createdAt'> = {
        date: data.date,
        type: data.type,
        reason: data.reason,
        customSlots: data.type === 'CUSTOM' ? customSlots : undefined,
      };
      const success = await onSave(payload);
      if (success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-6 sm:p-7">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CalendarOff className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg sm:text-xl font-bold font-serif text-foreground">
                Add Date Exception
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Block a day for travel/holidays or configure special custom puja muhurat hours.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          {/* Target Date */}
          <div className="space-y-1.5">
            <Label htmlFor="exceptionDate" className="text-xs font-semibold text-foreground">
              Date
            </Label>
            <Input
              id="exceptionDate"
              type="date"
              {...register('date')}
              className="h-10 text-xs"
            />
            {errors.date && <p className="text-[11px] text-destructive">{errors.date.message}</p>}
          </div>

          {/* Exception Type */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Exception Type</Label>
            <RadioGroup
              value={selectedType}
              onValueChange={(val: 'BLOCKED' | 'CUSTOM') => setValue('type', val)}
              className="grid grid-cols-2 gap-3"
            >
              <div
                className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedType === 'BLOCKED'
                    ? 'border-destructive/60 bg-destructive/5 ring-1 ring-destructive/30'
                    : 'border-border hover:bg-muted/30'
                }`}
                onClick={() => setValue('type', 'BLOCKED')}
              >
                <RadioGroupItem value="BLOCKED" id="type-blocked" className="mt-0.5" />
                <div className="space-y-0.5">
                  <Label htmlFor="type-blocked" className="text-xs font-semibold text-foreground cursor-pointer">
                    Block Full Day
                  </Label>
                  <p className="text-[10px] text-muted-foreground">Unavailable for any bookings.</p>
                </div>
              </div>

              <div
                className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedType === 'CUSTOM'
                    ? 'border-primary/60 bg-primary/5 ring-1 ring-primary/30'
                    : 'border-border hover:bg-muted/30'
                }`}
                onClick={() => setValue('type', 'CUSTOM')}
              >
                <RadioGroupItem value="CUSTOM" id="type-custom" className="mt-0.5" />
                <div className="space-y-0.5">
                  <Label htmlFor="type-custom" className="text-xs font-semibold text-foreground cursor-pointer">
                    Custom Muhurat
                  </Label>
                  <p className="text-[10px] text-muted-foreground">Replace weekly rules on this date.</p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Block Reason or Custom Slots */}
          {selectedType === 'BLOCKED' ? (
            <div className="space-y-1.5">
              <Label htmlFor="reason" className="text-xs font-semibold">
                Reason (Optional)
              </Label>
              <Textarea
                id="reason"
                placeholder="e.g. Traveling to Varanasi, Temple Festival, Family Occasion..."
                {...register('reason')}
                rows={2}
                className="text-xs resize-none"
              />
              {errors.reason && <p className="text-[11px] text-destructive">{errors.reason.message}</p>}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Custom Time Slots</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCustomSlot}
                  className="h-7 text-xs gap-1"
                >
                  <Plus className="h-3 w-3" /> Add Slot
                </Button>
              </div>

              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {customSlots.map((slot, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => handleCustomSlotChange(idx, 'startTime', e.target.value)}
                      className="h-8 text-xs flex-1"
                    />
                    <span className="text-xs text-muted-foreground">–</span>
                    <Input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => handleCustomSlotChange(idx, 'endTime', e.target.value)}
                      className="h-8 text-xs flex-1"
                    />
                    {customSlots.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCustomSlot(idx)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="pt-2 gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="text-xs" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Exception'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
