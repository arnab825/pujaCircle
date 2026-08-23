import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

/*
  PAGE: Devotee Puja Bookings (/bookings)
  
  ACCESS:
  - Devotees (USER role only)
  
  PURPOSE:
  - List of all confirmed, completed, and cancelled ceremony appointments for the devotee.
  
  FUTURE CONTENT:
  - Filter tabs (All, Upcoming, Completed, Cancelled).
  - Booking Card:
    - Ritual Title & Pandit Name
    - Muhurat Date & Time slot
    - Venue Address
    - Dakshina Amount & Offline Cash settlement status
    - Status Badge (CONFIRMED, COMPLETED, CANCELLED)
    - "View Details" & "Cancel Booking" action
  
  DATA SOURCE:
  - Currently: mockBookings from centralized mock data (@/mocks/db)
  - Future: GET /api/v1/user/bookings
*/
const BookingsPage: React.FC = () => {
  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-foreground">My Puja Bookings 🕉️</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track upcoming rituals, past ceremonies, and purohit appointments.
          </p>
        </div>
        <Link to="/rituals">
          <Button size="sm">Book New Ceremony</Button>
        </Link>
      </div>

      {/* TODO: Status filter tabs (Upcoming, Completed, Cancelled) */}
      {/* TODO: Map devotee bookings list from centralized mock data */}
      <div className="p-8 border rounded-lg bg-card text-center space-y-3">
        <p className="text-xs text-muted-foreground">
          [Devotee bookings list will render here from centralized mock data]
        </p>
      </div>
    </div>
  );
};

export default BookingsPage;
