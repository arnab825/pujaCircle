import React from 'react';

/*
  PAGE: Priest Bookings Ledger (/priest/bookings)
  
  ACCESS:
  - PRIEST role only
  
  PURPOSE:
  - Complete operational ledger of all ceremony appointments assigned to this Purohit.
  
  FUTURE CONTENT:
  - Filter by status: All, Upcoming, Completed, Cancelled.
  - Table / Card view:
    - Devotee Name & Phone Number
    - Ritual Type & Requirements
    - Scheduled Muhurat Date & Time
    - Venue Locality & Address
    - Offline Dakshina Settlement Status
    - Action: "Mark as Completed", "View Directions"
  
  DATA SOURCE:
  - Currently: mockBookings from centralized mock data (@/mocks/db)
  - Future: GET /api/v1/priest/bookings
*/
const PriestBookingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-foreground">Ceremony Appointments 🕉️</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          View all scheduled family pujas and complete post-ritual dakshina settlements.
        </p>
      </div>

      {/* TODO: Status filter tabs (Upcoming, Completed, Cancelled) */}
      {/* TODO: Priest Bookings table mapping mockBookings from centralized mock data */}
      <div className="p-8 border rounded-lg bg-card text-center space-y-3">
        <p className="text-xs text-muted-foreground">
          [Priest Bookings Roster and Appointment Details Placeholder]
        </p>
      </div>
    </div>
  );
};

export default PriestBookingsPage;
