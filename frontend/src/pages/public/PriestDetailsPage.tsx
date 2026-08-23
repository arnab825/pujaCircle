import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

/*
  PAGE: Priest Profile & Booking Schedule (/priests/:id)
  
  ACCESS:
  - Devotees (USER role) & Visitors
  
  PURPOSE:
  - Detailed profile of a Vedic Purohit: Gurukul lineage, Vedic background, languages, service localities.
  - Interactive calendar showing available muhurat slots (mockSlots).
  - Booking initiation for a selected ritual, slot, and devotee address.
  
  FUTURE CONTENT:
  - Priest biographical details, credentials, ratings, and customer reviews.
  - Ritual selection dropdown.
  - Date & Muhurat slot picker.
  - Address selection dropdown (for logged-in devotees with registered addresses).
  - Booking confirmation button triggering offline cash dakshina appointment creation.
  
  DATA SOURCE:
  - Currently: mockPriests, mockRituals, mockSlots from centralized mock data (@/mocks/db)
  - Future: GET /api/v1/priests/:id and GET /api/v1/priests/:id/slots
  
  IMPORTANT / VALIDATION:
  - Only authenticated devotees with a valid saved address can proceed to create a booking.
*/
const PriestDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <Link to="/priests" className="text-xs text-muted-foreground hover:text-primary">
        ← Back to Purohits Directory
      </Link>

      <div className="p-6 border rounded-lg bg-card space-y-4">
        <h1 className="text-2xl font-bold font-serif text-foreground">Pandit Profile & Booking</h1>
        <p className="text-xs text-muted-foreground">Priest ID: {id}</p>

        {/* TODO: Display priest bio, Gurukul lineage, specializations, and ratings */}
        {/* TODO: Display ritual selection, date picker, slot selection from mockSlots */}
        {/* TODO: Address picker and 'Confirm Puja Booking' action */}
        <div className="p-4 bg-muted/40 rounded border text-xs text-muted-foreground">
          [Priest credentials, available calendar slots, and booking flow will render here]
        </div>

        <Link to="/bookings">
          <Button size="sm">View My Bookings</Button>
        </Link>
      </div>
    </div>
  );
};

export default PriestDetailsPage;
