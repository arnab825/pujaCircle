import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

/*
  PAGE: Priest Directory (/priests)
  
  ACCESS:
  - Devotees (USER role) & Visitors
  - Only APPROVED priests are displayed in this directory (PENDING, BANNED priests are excluded).
  
  PURPOSE:
  - Find verified Vedic Purohits matching the devotee's city/PIN code and chosen ritual.
  - Displays years of experience, languages (Sanskrit, Hindi, Marathi, etc.), specializations, and ratings.
  
  FUTURE CONTENT:
  - Filter by city (Mumbai, Bengaluru, Pune, Delhi, Kolkata, etc.).
  - Filter by ritual specialization (Griha Pravesh, Havan, Katha).
  - Search by priest name or language.
  - Priest card with avatar, credentials, rating, and "View Profile / Book" CTA.
  
  DATA SOURCE:
  - Currently: mockPriests (filtered to approvalStatus === 'APPROVED') from centralized mock data (@/mocks/db)
  - Future: GET /api/v1/priests?status=APPROVED&city={city}
  
  IMPORTANT / VALIDATION:
  - Requires active devotee address for booking confirmation.
*/
const PriestListingPage: React.FC = () => {
  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-foreground">Find a Vedic Purohit 🕉️</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Vetted, Gurukul-trained priests available for in-home ceremonies across your city.
        </p>
      </div>

      {/* TODO: Add city filter dropdown, ritual filter, and search input */}
      {/* TODO: Map approved priests list from centralized mock data */}
      <div className="p-8 border rounded-lg bg-card text-center space-y-3">
        <p className="text-sm text-muted-foreground">
          [Priest listings directory will render here from centralized mock data]
        </p>
        <Link to="/auth/user/login">
          <Button variant="outline" size="sm">Sign In to Book a Purohit</Button>
        </Link>
      </div>
    </div>
  );
};

export default PriestListingPage;
