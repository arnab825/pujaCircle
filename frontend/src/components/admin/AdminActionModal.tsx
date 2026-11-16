import React, { useState, useEffect } from 'react';
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
import { AlertTriangle, LucideIcon } from 'lucide-react';

export interface AdminActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  title: string;
  icon: LucideIcon;
  description: React.ReactNode;
  warningAlert?: {
    title: string;
    description: React.ReactNode;
  };
  placeholder?: string;
  confirmLabel: string;
  confirmLoadingLabel: string;
  requireReason?: boolean;
}

/**
 * Reusable modal for Admin destructive actions (Ban, Suspend, Delete, Reject)
 * with justification input and automated notice warnings.
 */
export const AdminActionModal: React.FC<AdminActionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  icon: Icon,
  description,
  warningAlert,
  placeholder = 'Provide details or reason...',
  confirmLabel,
  confirmLoadingLabel,
  requireReason = true,
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReason('');
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (requireReason && !reason.trim()) return;
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
        <DialogHeader className="pr-10 sm:pr-12 text-left">
          <DialogTitle className="text-base flex items-center gap-2 text-destructive">
            <Icon className="w-4 h-4 shrink-0" />
            <span>{title}</span>
          </DialogTitle>
          <DialogDescription className="text-xs break-words leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-3">
          {warningAlert && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-red-800">
                <AlertTriangle className="w-3.5 h-3.5 text-red-700 shrink-0" />
                {warningAlert.title}
              </p>
              <div className="text-[11px] leading-relaxed text-red-700">
                {warningAlert.description}
              </div>
            </div>
          )}

          <Textarea
            placeholder={placeholder}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="text-xs min-h-20"
          />
        </div>

        <DialogFooter className="flex flex-row items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 sm:flex-initial sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleSubmit}
            disabled={(requireReason && !reason.trim()) || isSubmitting}
            className="flex-1 sm:flex-initial sm:w-auto"
          >
            {isSubmitting ? confirmLoadingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
