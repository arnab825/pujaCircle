import React from 'react';
import { MapPin, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PriestService } from '@/types/priest.types';
import { CalculatedSlot } from '@/lib/availabilityUtils';
import { formatCurrency, formatFullDate, formatTime } from '@/lib/utils';
import { Address } from '@/types/address.types';

interface BookingSummaryCardProps {
  selectedService: PriestService | null;
  selectedSlot: CalculatedSlot | null;
  selectedDate: string;
  selectedAddress: Address | undefined;
  isAddressOutside: boolean;
  selectedAddressSummary: string;
  selectedAddressDetail: string;
  onOpenAddressPicker: () => void;
  onReviewAndBook: () => void;
  isAuthenticated: boolean;
}

/**
 * ============================================================================
 * [COMPONENT: BOOKING SUMMARY CARD]
 * Sticky ceremony reservation overview with pricing breakdown, address check,
 * and direct call to action.
 * ============================================================================
 */
export const BookingSummaryCard: React.FC<BookingSummaryCardProps> = ({
  selectedService,
  selectedSlot,
  selectedDate,
  selectedAddress,
  isAddressOutside,
  selectedAddressSummary,
  selectedAddressDetail,
  onOpenAddressPicker,
  onReviewAndBook,
  isAuthenticated,
}) => {
  return (
    <div className="bg-white border-2 border-amber-300 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-amber-100">
        <Sparkles className="w-4 h-4 text-amber-600" />
        <h3 className="font-serif font-bold text-base text-stone-900">
          Ceremony Reservation
        </h3>
      </div>

      <div className="space-y-3 text-xs">
        {/* Selected Ritual */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-stone-500">Selected Puja:</span>
          <strong className="text-stone-900 text-right font-serif">
            {selectedService?.serviceName || 'Choose Ceremony'}
          </strong>
        </div>

        {/* Selected Muhurat Time */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-stone-500">Scheduled Time:</span>
          <strong className="text-stone-900 text-right">
            {selectedSlot
              ? `${formatTime(selectedSlot.startTime)} - ${formatTime(selectedSlot.endTime)}`
              : 'Choose Muhurat Slot'}
          </strong>
        </div>

        {/* Selected Date */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-stone-500">Date:</span>
          <strong className="text-stone-900 text-right">
            {formatFullDate(selectedDate)}
          </strong>
        </div>

        {/* Venue Address */}
        <div className="pt-2 border-t border-amber-100 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-stone-500 font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-red-700" />
              Ceremony Venue:
            </span>
            <button
              type="button"
              onClick={onOpenAddressPicker}
              className="text-[11px] font-bold text-red-700 hover:underline cursor-pointer"
            >
              {selectedAddress ? 'Change' : '+ Select'}
            </button>
          </div>
          <p className="text-stone-900 font-semibold truncate">
            {selectedAddressSummary}
          </p>
          <p className="text-[11px] text-stone-500 truncate">
            {selectedAddressDetail}
          </p>
          {isAddressOutside && (
            <p className="text-[10px] text-red-600 font-medium">
              ⚠️ Address is outside priest's primary serving postal code.
            </p>
          )}
        </div>

        {/* Dakshina Total Box */}
        <div className="pt-3 border-t border-amber-200">
          <div className="flex items-center justify-between text-stone-900">
            <span className="font-bold text-sm">Service Dakshina:</span>
            <strong className="font-serif text-xl font-bold text-[#780016]">
              {formatCurrency(selectedService?.price || 0)}
            </strong>
          </div>
          <p className="text-[10px] text-stone-500 mt-0.5">
            100% direct cash dakshina after ritual completion. Zero advance deposit.
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <Button
          type="button"
          onClick={onReviewAndBook}
          disabled={!selectedSlot || !selectedService}
          className="w-full bg-[#780016] hover:bg-red-800 text-white font-bold text-xs sm:text-sm py-2.5 h-auto rounded-md shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <span>{isAuthenticated ? 'Review & Request Booking' : 'Sign In to Book'}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-950 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <span>
          PujaCircle guarantees authenticated Vedic purohits with transparent samagri lists and zero hidden commissions.
        </span>
      </div>
    </div>
  );
};
