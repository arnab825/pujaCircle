import React from 'react';
import { DevoteeRecord } from '@/components/admin/UserManagementTable';
import { Ban } from 'lucide-react';
import { AdminActionModal } from '@/components/admin/AdminActionModal';

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
  return (
    <AdminActionModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Suspend Devotee Account"
      icon={Ban}
      description={
        <>
          Suspension revokes platform booking privileges for <strong>{user?.name}</strong>.
        </>
      }
      warningAlert={{
        title: 'Automatic Cancellation & Notification:',
        description: (
          <span>
            Suspending this devotee will <strong>automatically cancel all of their active and pending bookings on the priest side</strong>, and a notification email stating the reason will be sent to the devotee.
          </span>
        ),
      }}
      placeholder="E.g., Repeated booking cancellations, payment disputes..."
      confirmLabel="Confirm Suspension"
      confirmLoadingLabel="Suspending..."
    />
  );
};
