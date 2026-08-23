import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

/*
  PAGE: Platform Admin Dashboard (/admin/dashboard)
  
  ACCESS:
  - ADMIN role only (Private operations console)
  
  PURPOSE:
  - High-level platform health metrics, monthly bookings trend, quick priest review queue, and platform activity feed.
  
  FUTURE CONTENT:
  - 4 Platform Stat Cards:
    1. Total Registered Devotees (1,248)
    2. Verified Vedic Priests (86)
    3. Pending Priest Approvals (7)
    4. Total Ritual Bookings (2,430)
  - Monthly Bookings Trend Chart (Jan-Jun bar/area chart).
  - Pending Priest Review Table (Scholar name, phone, city, specialization, 'Review' action).
  - Quick Hub: "Manage Priests", "Registered Devotees".
  - Live Platform Activity Feed.
  
  DATA SOURCE:
  - Currently: mockDashboardStats.admin & mockPriests from centralized mock data (@/mocks/db)
  - Future: GET /api/v1/admin/dashboard-stats
  
  IMPORTANT:
  - Accessible ONLY to internal platform administrators.
*/
const AdminDashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
            Administration Console 🛡️
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            System-wide overview, verification queue, and platform health metrics.
          </p>
        </div>

        <Link to="/admin/priests">
          <Button size="sm" variant="destructive" className="text-xs">
            Manage Priests Roster
          </Button>
        </Link>
      </div>

      {/* TODO: 4 Stat Cards (Devotees, Priests, Approvals, Bookings) */}
      {/* TODO: Monthly Bookings Trend Chart */}
      {/* TODO: Pending Priest Applications Review Table */}
      {/* TODO: Quick Management Cards (Manage Priests & Registered Devotees) */}
      <div className="p-8 border rounded-lg bg-card text-center space-y-3">
        <p className="text-sm font-medium text-foreground">
          [Admin Platform Overview & Analytics Dashboard Skeleton]
        </p>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Future implementation will render Platform Metric Cards, Monthly Booking Trend Charts, Pending Applications Review List, and Devotee Hub.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
