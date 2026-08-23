import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

/*
  PAGE: Booking Appointment Details (/bookings/:id)
  
  ACCESS:
  - Devotees (USER role only)
  
  PURPOSE:
  - Full details for a single ceremony appointment:
    - Booking Reference (e.g. PC-1001)
    - Pandit name, phone, Gurukul qualifications
    - Ritual name, duration, requirements/samagri
    - Scheduled date & Muhurat timing
    - Venue address details
    - Offline Dakshina amount (Cash on completion)
    - Special instructions for Pandit
    - Cancellation action with reason prompt
  
  DATA SOURCE:
  - Currently: mockBookings (@/mocks/db)
  - Future: GET /api/v1/user/bookings/:id
*/
const BookingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="container max-w-2xl py-8 space-y-6">
      <Link to="/bookings" className="text-xs text-muted-foreground hover:text-primary">
        ← Back to All Bookings
      </Link>

      <div className="p-6 border rounded-lg bg-card space-y-4">
        <h1 className="text-2xl font-bold font-serif text-foreground">Ceremony Booking Details</h1>
        <p className="text-xs text-muted-foreground">Booking Reference: {id}</p>

        {/* TODO: Display Pandit contact, Muhurat timing, Venue address */}
        {/* TODO: Display Samagri list and offline dakshina amount */}
        {/* TODO: Add 'Cancel Appointment' button */}
        <div className="p-4 bg-muted/40 rounded border text-xs text-muted-foreground">
          [Complete Booking details, Muhurat schedule, and Offline Dakshina breakdown placeholder]
        </div>

        <div className="pt-2 flex justify-between">
          <Button variant="outline" size="sm" className="text-xs text-destructive">
            Cancel Booking
          </Button>
          <Link to="/bookings">
            <Button size="sm" className="text-xs">Done</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsPage;
