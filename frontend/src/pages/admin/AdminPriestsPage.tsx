import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

/*
  PAGE: Manage Vedic Priests (/admin/priests)
  
  ACCESS:
  - ADMIN role only
  
  PURPOSE:
  - Centralized platform roster of all Vedic scholars across all lifecycle states.
  - Review applications, approve, reject, ban bad actors, unban, or delete priest profiles.
  
  STATUS TABS:
  - ALL: Complete platform directory.
  - APPROVED: Active purohits appearing in public devotee discovery.
  - PENDING: Applications waiting for admin credential review.
  - BANNED: Infraction accounts whose login access is revoked.
  
  ACTIONS PER PRIEST:
  - PENDING: Review & Approve / Reject.
  - APPROVED: Ban account (with administrative reason).
  - BANNED: Lift ban & Reactivate back to Approved.
  - ALL: View Details (/admin/priests/:id) or Permanently Remove / Delete.
  
  DATA SOURCE:
  - Currently: mockPriests from centralized mock data (@/mocks/db)
  - Future: GET /api/v1/admin/priests
*/
const AdminPriestsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
            Manage Vedic Priests 🪔
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Full platform roster of Vedic scholars: review applications, approve, reject, ban, or remove profiles.
          </p>
        </div>
      </div>

      {/* TODO: Status filter tabs (ALL, APPROVED, PENDING, BANNED) */}
      {/* TODO: Search box by priest name, city, phone */}
      {/* TODO: Priests table with status badges and action triggers (Approve, Reject, Ban, Unban, Delete) */}
      <div className="p-8 border rounded-lg bg-card text-center space-y-3">
        <p className="text-sm font-medium text-foreground">
          [Admin Priest Management Directory Skeleton]
        </p>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Future implementation will render the full directory table with real-time status tabs and administrative modal actions.
        </p>
      </div>
    </div>
  );
};

export default AdminPriestsPage;
