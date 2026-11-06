import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DevoteeRecord } from './UserManagementTable';
import { Ban } from 'lucide-react';

interface SuspendUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  user: DevoteeRecord | null;
}

export const SuspendUserDialog: React.FC<SuspendUserDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  user,
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    setIsSubmitting(true);
    try {
      await onConfirm(reason.trim());
      setReason('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pr-8 sm:pr-10 text-left">
          <DialogTitle className="text-base flex items-center gap-2 text-destructive">
            <Ban className="w-4 h-4 shrink-0" />
            <span>Suspend Devotee Account</span>
          </DialogTitle>
          <DialogDescription className="text-xs break-words leading-relaxed">
            Suspension prevents <strong>{user?.name}</strong> from initiating new ceremony bookings.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <Textarea
            placeholder="E.g., Repeated booking cancellations, payment disputes..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="text-xs min-h-20"
          />
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleSubmit}
            disabled={!reason.trim() || isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? 'Suspending...' : 'Confirm Suspension'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
