import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  weeklyAvailabilityRuleSchema,
  WeeklyAvailabilityRuleInput,
} from '@/schemas/priest.schema';
import { WeeklyAvailabilityRule } from '@/types/priest.types';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DAYS_OF_WEEK, SLOT_DURATION_OPTIONS, BUFFER_OPTIONS } from '@/lib/constants';
import { Clock, Sparkles } from 'lucide-react';

interface AddWeeklyRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: Omit<WeeklyAvailabilityRule, 'id' | 'priestId' | 'createdAt'>) => Promise<boolean>;
  editingRule?: WeeklyAvailabilityRule | null;
  initialDay?: number;
}

export const AddWeeklyRuleModal: React.FC<AddWeeklyRuleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingRule,
  initialDay = 1,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<WeeklyAvailabilityRuleInput>({
    resolver: zodResolver(weeklyAvailabilityRuleSchema),
    defaultValues: {
      dayOfWeek: initialDay,
      startTime: '09:00',
      endTime: '13:00',
      slotDurationMinutes: 60,
      bufferMinutes: 0,
      isActive: true,
    },
  });

  const selectedDay = watch('dayOfWeek');
  const startTime = watch('startTime');
  const endTime = watch('endTime');
  const slotDuration = watch('slotDurationMinutes');
  const buffer = watch('bufferMinutes');

  useEffect(() => {
    if (editingRule) {
      reset({
        dayOfWeek: editingRule.dayOfWeek,
        startTime: editingRule.startTime,
        endTime: editingRule.endTime,
        slotDurationMinutes: editingRule.slotDurationMinutes,
        bufferMinutes: editingRule.bufferMinutes,
        isActive: editingRule.isActive,
      });
    } else {
      reset({
        dayOfWeek: initialDay,
        startTime: '09:00',
        endTime: '13:00',
        slotDurationMinutes: 60,
        bufferMinutes: 0,
        isActive: true,
      });
    }
  }, [editingRule, initialDay, reset, isOpen]);

  // Compute live slot preview
  const generatePreviewSlots = () => {
    if (!startTime || !endTime || !slotDuration) return [];
    const [sH, sM] = startTime.split(':').map(Number);
    const [eH, eM] = endTime.split(':').map(Number);
    if (isNaN(sH) || isNaN(sM) || isNaN(eH) || isNaN(eM)) return [];

    const startTotal = sH * 60 + sM;
    const endTotal = eH * 60 + eM;
    const step = Number(slotDuration) + Number(buffer || 0);

    const list: string[] = [];
    let current = startTotal;

    while (current + Number(slotDuration) <= endTotal) {
      const slotStartH = Math.floor(current / 60);
      const slotStartM = current % 60;
      const slotEndMinutes = current + Number(slotDuration);
      const slotEndH = Math.floor(slotEndMinutes / 60);
      const slotEndM = slotEndMinutes % 60;

      const s = `${String(slotStartH).padStart(2, '0')}:${String(slotStartM).padStart(2, '0')}`;
      const e = `${String(slotEndH).padStart(2, '0')}:${String(slotEndM).padStart(2, '0')}`;
      list.push(`${s} – ${e}`);

      current += step;
    }
    return list;
  };

  const previewList = generatePreviewSlots();

  const onSubmit = async (data: WeeklyAvailabilityRuleInput) => {
    setIsSubmitting(true);
    try {
      const success = await onSave(data);
      if (success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold font-serif flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            {editingRule ? 'Edit Weekly Schedule Rule' : 'Add Weekly Working Hours'}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Set your recurring available hours. Devotee booking slots will be generated automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Day of Week */}
          <div className="space-y-1.5">
            <Label htmlFor="dayOfWeek" className="text-xs font-semibold">
              Day of the Week
            </Label>
            <Select
              value={String(selectedDay)}
              onValueChange={(val) => setValue('dayOfWeek', Number(val), { shouldValidate: true })}
            >
              <SelectTrigger id="dayOfWeek" className="h-9 text-xs">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map((dayName, idx) => (
                  <SelectItem key={idx} value={String(idx)} className="text-xs">
                    {dayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.dayOfWeek && (
              <p className="text-[11px] text-destructive">{errors.dayOfWeek.message}</p>
            )}
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="startTime" className="text-xs font-semibold">
                Start Time
              </Label>
              <Input
                id="startTime"
                type="time"
                {...register('startTime')}
                className="h-9 text-xs"
              />
              {errors.startTime && (
                <p className="text-[11px] text-destructive">{errors.startTime.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="endTime" className="text-xs font-semibold">
                End Time
              </Label>
              <Input
                id="endTime"
                type="time"
                {...register('endTime')}
                className="h-9 text-xs"
              />
              {errors.endTime && (
                <p className="text-[11px] text-destructive">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          {/* Slot Duration & Buffer */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="slotDuration" className="text-xs font-semibold">
                Slot Duration
              </Label>
              <Select
                value={String(slotDuration)}
                onValueChange={(val) =>
                  setValue('slotDurationMinutes', Number(val), { shouldValidate: true })
                }
              >
                <SelectTrigger id="slotDuration" className="h-9 text-xs">
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent>
                  {SLOT_DURATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="buffer" className="text-xs font-semibold">
                Rest / Travel Buffer
              </Label>
              <Select
                value={String(buffer)}
                onValueChange={(val) =>
                  setValue('bufferMinutes', Number(val), { shouldValidate: true })
                }
              >
                <SelectTrigger id="buffer" className="h-9 text-xs">
                  <SelectValue placeholder="Buffer" />
                </SelectTrigger>
                <SelectContent>
                  {BUFFER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="p-3 bg-muted/40 rounded-xl border border-border/80 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Calculated Slots ({previewList.length})</span>
            </div>
            {previewList.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
                {previewList.map((slotText, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 text-[11px] font-mono bg-card rounded-md border border-border text-foreground shadow-2xs"
                  >
                    {slotText}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                No full slots fit within this time range. Please extend the end time.
              </p>
            )}
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="text-xs" disabled={isSubmitting || previewList.length === 0}>
              {isSubmitting ? 'Saving...' : editingRule ? 'Update Schedule' : 'Save Working Hours'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
