import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

/*
  PAGE: Home Page (Landing & Discovery)
  
  ACCESS:
  - Public / Visitor / USER
  - Note: PRIEST is redirected to /priest/dashboard, ADMIN to /admin/dashboard
  
  PURPOSE:
  - Hero marketing section introducing PujaCircle Vedic booking services.
  - Featured rituals carousel / grid (Griha Pravesh, Satyanarayan Katha, Rudrabhishek).
  - How It Works (Select ritual -> Match Vedic priest by PIN code -> Sacred muhurat).
  - Devotee testimonials and Vedic trust badges.
  
  FUTURE CONTENT:
  - Hero banner with CTA ("Book a Puja", "Find Purohit").
  - Featured rituals list from centralized mock data / API.
  - Location prompt for unauthenticated devotees to enter PIN code.
  - Call to action for Purohits to join platform ("Join as a Purohit").
  
  DATA SOURCE:
  - Currently: mockRituals from centralized mock data (@/mocks/db)
  - Future: GET /api/v1/rituals/featured
  
  IMPORTANT / VALIDATION:
  - Devotees browsing rituals must sign in and provide an address before confirming booking.
*/
const HomePage: React.FC = () => {
  return (
    <div className="container py-12 space-y-8">
      {/* Hero Section Placeholder */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground font-serif">
          Experience Authentic Vedic Ceremonies at Home 🕉️
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Connect with vetted, qualified Vedic Purohits across your city for sacred rituals and family pujas.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link to="/rituals">
            <Button size="lg" className="text-sm">Explore Rituals</Button>
          </Link>
          <Link to="/priests">
            <Button size="lg" variant="outline" className="text-sm">Find a Purohit</Button>
          </Link>
        </div>
      </div>

      {/* Featured Rituals Section Placeholder */}
      <div className="pt-8 border-t space-y-4">
        <h2 className="text-xl font-bold text-center">Featured Vedic Rituals</h2>
        <p className="text-xs text-center text-muted-foreground">
          {/* TODO: Render featured rituals grid from mockRituals */}
          [Featured rituals grid will be rendered here from centralized mock data]
        </p>
      </div>
    </div>
  );
};

export default HomePage;
