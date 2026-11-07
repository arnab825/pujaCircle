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
import { Priest } from '@/types/priest.types';
import { Ban, Trash2, XCircle } from 'lucide-react';

interface RejectPriestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  priest: Priest | null;
}

export const RejectPriestDialog: React.FC<RejectPriestDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  priest,
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
            <XCircle className="w-4 h-4 shrink-0" />
            <span>Reject Purohit Application</span>
          </DialogTitle>
          <DialogDescription className="text-xs break-words">
            Provide specific feedback for <strong>{priest?.fullName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <Textarea
            placeholder="E.g., Incomplete Vedic qualifications documentation, unverified phone number..."
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
            {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface BanPriestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  priest: Priest | null;
}

export const BanPriestDialog: React.FC<BanPriestDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  priest,
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
            <span>Ban Purohit Account</span>
          </DialogTitle>
          <DialogDescription className="text-xs break-words leading-relaxed">
            Banning <strong>{priest?.fullName}</strong> will hide their profile from public searches and block incoming bookings.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <Textarea
            placeholder="E.g., Repeated conduct violations, devotee complaints regarding punctuality..."
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
            {isSubmitting ? 'Banning...' : 'Confirm Account Ban'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
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
            <Trash2 className="w-4 h-4 shrink-0" />
            <span>{title}</span>
          </DialogTitle>
          <DialogDescription className="text-xs leading-relaxed break-words">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? 'Deleting...' : 'Delete Permanently'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
