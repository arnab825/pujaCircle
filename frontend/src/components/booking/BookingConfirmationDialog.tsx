import React from 'react';
import { Link } from 'react-router-dom';
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
import { Textarea } from '@/components/ui/textarea';
import { Plus, Check } from 'lucide-react';
import { Priest, PriestService } from '@/types/priest.types';
import { CalculatedSlot } from '@/lib/availabilityUtils';
import { Address } from '@/types/address.types';
import { formatCurrency, formatFullDate, formatTime } from '@/lib/utils';

interface BookingConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  priest: Priest;
  selectedService: PriestService | null;
  selectedSlot: CalculatedSlot | null;
  selectedDate: string;
  userAddresses: Address[];
  selectedAddressId: string;
  onSelectAddressId: (id: string) => void;
  userNotes: string;
  onChangeNotes: (notes: string) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
  isAddressServed: (addr?: Address) => boolean;
}

/**
 * ============================================================================
 * [COMPONENT: BOOKING CONFIRMATION DIALOG]
 * Modal for finalizing venue selection, reviewing locked price, and submitting request.
 * ============================================================================
 */
export const BookingConfirmationDialog: React.FC<BookingConfirmationDialogProps> = ({
  isOpen,
  onClose,
  priest,
  selectedService,
  selectedSlot,
  selectedDate,
  userAddresses,
  selectedAddressId,
  onSelectAddressId,
  userNotes,
  onChangeNotes,
  isSubmitting,
  onSubmit,
  isAddressServed,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[92vh] flex flex-col p-4 sm:p-6 bg-white border-2 border-amber-300 shadow-2xl rounded-2xl overflow-hidden">
        <DialogHeader className="shrink-0 pb-3 border-b border-amber-100 pr-8 text-left">
          <DialogTitle className="text-base sm:text-lg font-bold font-serif text-stone-900">
            Confirm Ceremony Request
          </DialogTitle>
          <DialogDescription className="text-[11px] text-stone-600 leading-snug">
            Price is locked at request submission. Dakshina is payable directly in cash after ritual completion.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs custom-scrollbar">
          {/* Price & Service Summary Box */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-stone-600">Appointed Purohit:</span>
              <strong className="text-stone-900 font-serif text-xs sm:text-sm">
                {priest.displayName || priest.fullName}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-600">Ritual / Ceremony:</span>
              <strong className="text-stone-900 font-serif text-xs sm:text-sm">
                {selectedService?.serviceName || 'Selected Ceremony'}
              </strong>
            </div>
            <div className="flex items-center justify-between border-t border-amber-200 pt-1.5">
              <span className="text-stone-600">Service Dakshina:</span>
              <strong className="font-serif text-sm sm:text-base font-bold text-red-800">
                {formatCurrency(selectedService?.price || 2100)} (Direct Cash)
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-600">Scheduled Muhurat:</span>
              <span className="text-stone-900 font-bold text-[11px] sm:text-xs text-right">
                {selectedSlot
                  ? `${formatFullDate(selectedSlot.date)} (${formatTime(selectedSlot.startTime)} – ${formatTime(
                      selectedSlot.endTime
                    )})`
                  : `${formatFullDate(selectedDate)} (Please pick a slot)`}
              </span>
            </div>
          </div>

          {/* Address Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-stone-900">
                Puja Sanctum Venue (Home Address)
              </Label>
              <Link
                to="/user/addresses"
                className="text-xs text-red-700 hover:underline font-bold flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> Add Address
              </Link>
            </div>

            {userAddresses.length === 0 ? (
              <div className="p-3 rounded-md border border-amber-300 bg-amber-50 text-stone-800 space-y-2">
                <p className="text-xs">
                  You have no saved addresses. An address with PIN code is required for the priest to arrive.
                </p>
                <Link to="/user/addresses">
                  <Button
                    size="sm"
                    className="text-xs h-7.5 bg-red-700 hover:bg-red-800 text-white rounded-md"
                  >
                    + Add Address
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {userAddresses.map((addr) => {
                  const line1 =
                    [addr.houseNo, addr.villageTown || addr.locality]
                      .filter(Boolean)
                      .join(', ') || addr.city;
                  const line2 = `${addr.city}, ${addr.state} - ${addr.pincode || addr.pinCode}`;
                  const isOutside = !isAddressServed(addr);

                  return (
                    <div
                      key={addr.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-between ${
                        selectedAddressId === addr.id
                          ? 'border-red-700 bg-amber-50/50'
                          : 'border-stone-200 hover:border-amber-300'
                      }`}
                      onClick={() => onSelectAddressId(addr.id)}
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                          <span>{line1}</span>
                          {isOutside && (
                            <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded border border-red-200 font-bold">
                              Outside Service PIN
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500">{line2}</p>
                      </div>
                      {selectedAddressId === addr.id && (
                        <Check className="h-4 w-4 text-red-700 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Special Instructions Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-stone-900">
              Special Notes or Requests (Optional)
            </Label>
            <Textarea
              placeholder="Gotra details, specific mantras, apartment floor/landmark, etc."
              value={userNotes}
              onChange={(e) => onChangeNotes(e.target.value)}
              className="text-xs min-h-15 border-amber-300 focus-visible:ring-red-700"
            />
          </div>
        </div>

        <DialogFooter className="shrink-0 flex items-center justify-end gap-2 pt-2 border-t border-amber-200">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs border-amber-300 hover:bg-amber-50 rounded-md"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isSubmitting || !selectedAddressId || !selectedSlot}
            onClick={onSubmit}
            className="text-xs bg-[#780016] hover:bg-red-800 text-white rounded-md gap-1.5 font-bold shadow-xs cursor-pointer"
          >
            {isSubmitting ? (
              'Submitting Request...'
            ) : (
              <>
                <Check className="h-3.5 w-3.5" /> Confirm Ceremony Booking
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
