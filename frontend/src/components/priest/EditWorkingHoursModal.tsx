import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Clock, X, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { formatTimeAmPm } from '@/lib/availabilityUtils';

interface EditWorkingHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStartTime: string;
  initialEndTime: string;
  onSave: (startTime: string, endTime: string) => Promise<void>;
}

export const EditWorkingHoursModal: React.FC<EditWorkingHoursModalProps> = ({
  isOpen,
  onClose,
  initialStartTime,
  initialEndTime,
  onSave,
}) => {
  // Normalize "07:00:00" to "07:00"
  const cleanTime = (t: string, fallback: string) => {
    if (!t) return fallback;
    const parts = t.split(':');
    return `${parts[0].padStart(2, '0')}:${(parts[1] || '00').padStart(2, '0')}`;
  };

  const [startTime, setStartTime] = useState(() => cleanTime(initialStartTime, '07:00'));
  const [endTime, setEndTime] = useState(() => cleanTime(initialEndTime, '21:00'));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStartTime(cleanTime(initialStartTime, '07:00'));
      setEndTime(cleanTime(initialEndTime, '21:00'));
      setError(null);
    }
  }, [isOpen, initialStartTime, initialEndTime]);

  if (!isOpen) return null;

  // Calculate live duration in hours
  const calculateDuration = () => {
    const [sH, sM] = startTime.split(':').map(Number);
    const [eH, eM] = endTime.split(':').map(Number);
    if (isNaN(sH) || isNaN(eH)) return null;
    const diffMins = eH * 60 + eM - (sH * 60 + sM);
    if (diffMins <= 0) return null;
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return mins > 0 ? `${hrs} hrs ${mins} mins` : `${hrs} hours`;
  };

  const durationStr = calculateDuration();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startTime || !endTime) {
      setError('Both start and end time are required.');
      return;
    }
    if (startTime >= endTime) {
      setError('End time must be later than start time.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave(startTime, endTime);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update working hours.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyPreset = (start: string, end: string) => {
    setStartTime(start);
    setEndTime(end);
    setError(null);
  };

  const PRESETS = [
    { label: '7 AM – 9 PM', sub: '14-hr full day window', start: '07:00', end: '21:00' },
    { label: '7 AM – 6 PM', sub: '11-hr standard daytime', start: '07:00', end: '18:00' },
    { label: '6 AM – 6 PM', sub: 'Early morning dawn shift', start: '06:00', end: '18:00' },
    { label: '8 AM – 8 PM', sub: '12-hr balanced window', start: '08:00', end: '20:00' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl border-2 border-amber-300 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden shadow-2xl space-y-0">
        {/* Header */}
        <div className="bg-[#780016] text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-amber-400 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 pr-2 min-w-0">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-md bg-amber-400 text-stone-950 flex items-center justify-center font-serif font-black text-sm sm:text-base shrink-0 shadow-xs">
              ॐ
            </div>
            <div className="min-w-0">
              <h3 className="font-serif font-bold text-sm sm:text-lg text-white truncate">
                Configure Standard Daily Hours
              </h3>
              <p className="text-[11px] sm:text-xs text-amber-200/90 font-medium truncate">
                Applied across your 90-day rolling calendar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-amber-200 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10 cursor-pointer shrink-0"
            title="Close dialog"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
          <p className="text-xs text-stone-600 leading-relaxed font-medium">
            Define your daily standard availability window. Devotees booking rituals can select muhurat slots only within these hours unless you mark a day off or block specific hours.
          </p>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Presets */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
              Quick Working Window Presets
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRESETS.map((p) => {
                const isSelected = startTime === p.start && endTime === p.end;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => applyPreset(p.start, p.end)}
                    className={`text-left p-3 rounded-lg border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-100/60 shadow-xs'
                        : 'border-amber-200 bg-amber-50/40 hover:bg-amber-100/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-stone-950 text-sm">{p.label}</span>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">{p.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Range Custom Inputs */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
              Custom Time Range
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-stone-600 block">Start Time</span>
                <div className="relative">
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full h-11 px-3 py-2 text-sm border-2 border-amber-300 rounded-md focus:outline-none focus:border-amber-600 font-bold text-stone-900 bg-white"
                    required
                  />
                </div>
                <span className="text-[10px] text-stone-500 font-medium">
                  Starts at: {formatTimeAmPm(startTime)}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-stone-600 block">End Time</span>
                <div className="relative">
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full h-11 px-3 py-2 text-sm border-2 border-amber-300 rounded-md focus:outline-none focus:border-amber-600 font-bold text-stone-900 bg-white"
                    required
                  />
                </div>
                <span className="text-[10px] text-stone-500 font-medium">
                  Ends at: {formatTimeAmPm(endTime)}
                </span>
              </div>
            </div>
          </div>

          {/* Active Summary Pill */}
          {durationStr && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center justify-between text-xs text-emerald-950">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>
                  Standard Daily Window: <strong>{formatTimeAmPm(startTime)} – {formatTimeAmPm(endTime)}</strong>
                </span>
              </div>
              <span className="font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                {durationStr}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 border-t border-stone-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10 px-5 text-xs font-bold border-2 border-stone-300 text-stone-700 hover:bg-stone-50 cursor-pointer w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-6 bg-[#780016] hover:bg-red-800 text-white font-bold text-xs gap-1.5 shadow-xs border border-amber-400 cursor-pointer w-full sm:w-auto"
            >
              {isSubmitting ? (
                <span>Saving Schedule...</span>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  <span>Save Working Hours</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
