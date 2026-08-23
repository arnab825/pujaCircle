import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/store/booking.store';
import { formatCurrency } from '@/lib/utils';
import { Sparkles, Calendar, Clock, MapPin, CreditCard } from 'lucide-react';

interface BookingConfirmModalProps {
  onConfirm: () => void;
  isLoading?: boolean;
}

export const BookingConfirmModal: React.FC<BookingConfirmModalProps> = ({
  onConfirm,
  isLoading = false,
}) => {
  const { isBookingModalOpen, closeBookingModal, draft } = useBookingStore();

  return (
    <Dialog open={isBookingModalOpen} onOpenChange={(open) => !open && closeBookingModal()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-semibold mb-1">
            <Sparkles className="h-5 w-5" />
            <span>Confirm Puja Booking</span>
          </div>
          <DialogTitle className="text-xl">Review Details</DialogTitle>
          <DialogDescription>
            Please review the schedule and ritual dakshina before confirmation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-3 text-sm">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Calendar className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="font-medium">{draft.bookingDate || 'Selected Date'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Clock className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Time Slot</p>
              <p className="font-medium">Auspicious Morning Muhurat</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <MapPin className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Location</p>
              <p className="font-medium">Selected Devotee Address</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-accent/20 border border-accent/40">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs font-semibold text-foreground">Dakshina (Suggested)</p>
                <p className="text-xs text-muted-foreground">Pay offline in cash to Purohit</p>
              </div>
            </div>
            <span className="text-base font-bold text-foreground">
              {formatCurrency(draft.estimatedDakshina || 2100)}
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => closeBookingModal()} disabled={isLoading}>
            Back
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Booking...' : 'Confirm Puja Booking'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
