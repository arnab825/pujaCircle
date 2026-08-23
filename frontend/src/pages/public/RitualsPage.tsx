import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

/*
  PAGE: Rituals Directory (/rituals)
  
  ACCESS:
  - Devotees (USER role) & Visitors
  - Note: Unauthenticated visitors can view rituals but are prompted to sign in with an address to book.
  
  PURPOSE:
  - Lists all Vedic ceremonies (Griha Pravesh, Satyanarayan Katha, Maha Rudrabhishek, Vivah Sanskar, Navagraha Havan).
  - Categorized by Grah Pravesh, Festivals & Vrats, Havan & Yagya.
  - Displays duration, suggested dakshina, and ritual requirements.
  
  FUTURE CONTENT:
  - Search by ritual title or category.
  - Filter by deity, occasion, or samagri inclusion.
  - "Book Now" CTA leading to priest selection for the chosen ritual.
  
  DATA SOURCE:
  - Currently: mockRituals from centralized mock data (@/mocks/db)
  - Future: GET /api/v1/rituals
  
  IMPORTANT / VALIDATION:
  - Clicking "Book Ceremony" checks if user is logged in with a registered address; if not, redirects to address setup.
*/
const RitualsPage: React.FC = () => {
  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-foreground">Vedic Rituals & Ceremonies 🕉️</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Explore sacred ceremonies performed according to traditional Vedic Vidhi.
        </p>
      </div>

      {/* TODO: Search and filter controls for ritual categories */}
      {/* TODO: Render rituals grid mapping mockRituals from centralized mock data */}
      <div className="p-8 border rounded-lg bg-card text-center space-y-3">
        <p className="text-sm text-muted-foreground">
          [Rituals directory grid will render here with cards for Griha Pravesh, Satyanarayan Katha, Rudrabhishek]
        </p>
        <Link to="/priests">
          <Button variant="outline" size="sm">Browse Available Purohits</Button>
        </Link>
      </div>
    </div>
  );
};

export default RitualsPage;
