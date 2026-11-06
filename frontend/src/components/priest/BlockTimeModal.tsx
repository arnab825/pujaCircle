import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, AlertCircle, Ban } from 'lucide-react';
import { formatFullDate } from '@/lib/utils';

interface BlockTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string; // YYYY-MM-DD
  initialMode?: 'BLOCK' | 'CUSTOM_HOURS';
  onSave: (startTime: string, endTime: string, reason: string, exceptionType: 'BLOCK' | 'CUSTOM_HOURS') => void;
}

const REASON_OPTIONS = [
  'Travel / Out of Station',
  'Lunch & Rest',
  'Temple Ritual / Seva',
  'Personal / Family Work',
  'Medical / Health Rest',
  'Other',
];

export const BlockTimeModal: React.FC<BlockTimeModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  initialMode = 'BLOCK',
  onSave,
}) => {
  const mode = initialMode;
  const [startTime, setStartTime] = useState('13:00');
  const [endTime, setEndTime] = useState('16:00');
  const [selectedReasonOption, setSelectedReasonOption] = useState('Travel / Out of Station');
  const [customReason, setCustomReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startTime || !endTime) {
      setError('Both start and end time are required.');
      return;
    }
    if (startTime >= endTime) {
      setError('End time must be after start time.');
      return;
    }

    const defaultReason = selectedReasonOption;
    const finalReason =
      selectedReasonOption === 'Other'
        ? customReason.trim() || 'Blocked Break / Personal'
        : defaultReason;

    setError(null);
    onSave(startTime, endTime, finalReason, mode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl border-2 border-amber-300 w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-amber-100 bg-amber-50/50 shrink-0">
          <div className="flex items-center gap-3 pr-2 min-w-0">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-md border flex items-center justify-center shrink-0 bg-red-50 text-red-800 border-red-200">
              <Ban className="h-5 w-5 text-red-700" />
            </div>
            <div className="min-w-0">
              <h2 className="font-serif font-bold text-sm sm:text-base text-stone-900 truncate">
                Block Specific Hours
              </h2>
              <p className="text-xs text-stone-600 font-medium truncate">
                {selectedDate ? formatFullDate(selectedDate) : 'Select a date'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-md hover:bg-stone-100 transition-colors cursor-pointer shrink-0"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          <div className="p-3 rounded-md text-xs leading-relaxed border bg-amber-50/70 border-amber-300 text-stone-800">
            <span>
              <strong>Blocked Hours:</strong> Devotees will <strong>NOT</strong> be able to book rituals during this window (e.g. 1:00 PM – 4:00 PM), while all your other standard working hours remain open.
            </span>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Time pickers */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">From (Start)</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border-2 border-stone-200 focus:border-amber-500 rounded-md p-2 text-xs sm:text-sm font-mono text-stone-900 outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">To (End)</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border-2 border-stone-200 focus:border-amber-500 rounded-md p-2 text-xs sm:text-sm font-mono text-stone-900 outline-none"
                required
              />
            </div>
          </div>

          {/* Reason Selection */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-bold text-stone-700">
              {mode === 'CUSTOM_HOURS' ? 'Label / Note for this schedule' : 'Reason for Blocking Break'}
            </label>
            <select
              value={selectedReasonOption}
              onChange={(e) => setSelectedReasonOption(e.target.value)}
              className="w-full border-2 border-stone-200 focus:border-amber-500 rounded-md p-2 text-xs sm:text-sm text-stone-900 bg-white outline-none cursor-pointer font-medium"
            >
              {REASON_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            {selectedReasonOption === 'Other' && (
              <div className="pt-1 space-y-1">
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Enter your custom note or reason..."
                  className="w-full border-2 border-amber-400 focus:border-amber-600 rounded-md p-2 text-xs sm:text-sm text-stone-900 outline-none animate-in fade-in duration-100"
                  autoFocus
                  required
                />
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-center sm:justify-end gap-2 sm:gap-3 pt-4 border-t border-stone-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto h-9 sm:h-10 px-4 text-xs font-semibold border-stone-300 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto h-9 sm:h-10 px-5 text-xs font-bold bg-[#780016] hover:bg-red-800 text-white shadow-xs cursor-pointer"
            >
              {mode === 'CUSTOM_HOURS' ? 'Save Specific Hours' : 'Block Break Window'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
