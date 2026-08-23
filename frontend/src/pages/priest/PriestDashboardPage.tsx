import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

/*
  PAGE: Priest Dashboard (/priest/dashboard)
  
  ACCESS:
  - PRIEST role only (Strictly isolated in PriestLayout with PriestSidebar)
  
  PURPOSE:
  - Gives a Vedic Purohit an operational overview of their daily ritual schedule and upcoming bookings.
  
  FUTURE CONTENT:
  - 4 Stat Cards:
    1. Today's Bookings (count)
    2. Upcoming Bookings (count)
    3. Completed Pujas (count)
    4. Pending Requests (count)
  - Weekly Booking Schedule Chart (Bar chart: Mon-Sun distribution).
  - Upcoming Ceremonies List (Next 3 bookings with Devotee name, Ritual, Muhurat time, Locality).
  - Quick Actions: "Manage Availability Slots", "View All Bookings", "Update Profile".
  
  DATA SOURCE:
  - Currently: mockDashboardStats.priest & mockBookings from centralized mock data (@/mocks/db)
  - Future: GET /api/v1/priest/dashboard-stats
  
  IMPORTANT:
  - Do NOT show consumer/devotee navigation.
  - Priest navigates via dedicated PriestSidebar.
*/
const PriestDashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-foreground">Priest Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Welcome to your Purohit Workspace. Here is your ritual schedule overview.
          </p>
        </div>
        <Link to="/priest/availability">
          <Button size="sm">Manage Slots</Button>
        </Link>
      </div>

      {/* TODO: 4 Stat Cards (Today's Bookings, Upcoming, Completed, Pending) */}
      {/* TODO: Weekly booking bar chart */}
      {/* TODO: Upcoming ceremonies agenda list */}
      <div className="p-8 border rounded-lg bg-card text-center space-y-3">
        <p className="text-sm font-medium text-foreground">
          [Priest Performance & Schedule Dashboard Skeleton]
        </p>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Future implementation will display Today's Bookings, Upcoming Schedule, Weekly Booking Trends, and Quick Actions.
        </p>
      </div>
    </div>
  );
};

export default PriestDashboardPage;
