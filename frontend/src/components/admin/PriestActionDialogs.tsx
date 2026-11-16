import React from 'react';
import { Priest } from '@/types/priest.types';
import { Ban, Trash2, XCircle } from 'lucide-react';
import { AdminActionModal } from '@/components/admin/AdminActionModal';

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
  return (
    <AdminActionModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Reject Purohit Application"
      icon={XCircle}
      description={
        <>
          Provide specific feedback for <strong>{priest?.fullName}</strong>.
        </>
      }
      placeholder="E.g., Incomplete Vedic qualifications documentation, unverified phone number..."
      confirmLabel="Confirm Rejection"
      confirmLoadingLabel="Rejecting..."
    />
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
  return (
    <AdminActionModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Ban Purohit Account"
      icon={Ban}
      description={
        <>
          Banning <strong>{priest?.fullName}</strong> will hide their profile from public searches and block incoming bookings.
        </>
      }
      warningAlert={{
        title: 'Automatic Cancellation & Email Notification:',
        description: (
          <span>
            Banning this Purohit will <strong>automatically cancel all of their active and pending bookings</strong>, and email notifications explaining the ban reason will be sent to the Purohit and all booked devotees.
          </span>
        ),
      }}
      placeholder="E.g., Repeated conduct violations, devotee complaints regarding punctuality..."
      confirmLabel="Confirm Account Ban"
      confirmLoadingLabel="Banning..."
    />
  );
};

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void>;
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
  return (
    <AdminActionModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={(reason) => onConfirm(reason)}
      title={title}
      icon={Trash2}
      description={description}
      warningAlert={{
        title: 'Automatic Cancellation & Notification:',
        description: (
          <span>
            Permanently deleting this account will <strong>automatically cancel all associated active and pending bookings</strong>, and dispatch notification emails to the account owner and all booked devotees.
          </span>
        ),
      }}
      placeholder="Reason for deletion (e.g., Unverified credentials, policy violations, user request)..."
      confirmLabel="Delete Permanently"
      confirmLoadingLabel="Deleting..."
      requireReason={false}
    />
  );
};
