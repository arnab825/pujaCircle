import React from 'react';

/*
  PAGE: Registered Devotees Directory (/admin/users)
  
  ACCESS:
  - ADMIN role only
  
  PURPOSE:
  - Administrator directory of all customer/devotee accounts registered on PujaCircle.
  
  FUTURE CONTENT:
  - Overview Stat Cards: Total Devotees, Active Accounts, Suspended Accounts.
  - Search input: Filter by devotee name, email, phone, city.
  - Devotees Table:
    - Name & Registration Date
    - Contact Phone (+91) & Email
    - Primary City & Saved Address Status
    - Total Bookings Count
    - Account Status Badge (ACTIVE vs SUSPENDED)
    - Action: "Suspend Account" / "Reactivate Account"
  
  DATA SOURCE:
  - Currently: mockUsers (role === 'USER') from centralized mock data (@/mocks/db)
  - Future: GET /api/v1/admin/users
*/
const AdminUsersPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
          Registered Devotees
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Platform directory of registered devotees, contact verification status, and account actions.
        </p>
      </div>

      {/* TODO: Devotee Stat Cards (Total, Active, Suspended) */}
      {/* TODO: Search input */}
      {/* TODO: Devotees table mapping mockUsers with Suspend/Reactivate actions */}
      <div className="p-8 border rounded-lg bg-card text-center space-y-3">
        <p className="text-sm font-medium text-foreground">
          [Registered Devotees Directory Skeleton]
        </p>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Future implementation will render the devotee directory table with verification badges, booking counts, and account suspension controls.
        </p>
      </div>
    </div>
  );
};

export default AdminUsersPage;
