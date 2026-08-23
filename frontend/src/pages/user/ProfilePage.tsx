import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

/*
  PAGE: Devotee Profile Settings (/profile)
  
  ACCESS:
  - Devotees (USER role only)
  
  PURPOSE:
  - Displays devotee account information (Name, Verified Mobile, Verified Email).
  - Quick navigation links to Manage Addresses and View Booking History.
  
  FUTURE CONTENT:
  - Account info summary (Name, +91 Phone Number with Verified badge, Email with Verified badge).
  - Password update form.
  - Notification preferences for ritual reminders.
  
  DATA SOURCE:
  - Currently: useAuthStore (user)
  - Future: GET /api/v1/user/profile
*/
const ProfilePage: React.FC = () => {
  return (
    <div className="container max-w-2xl py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-foreground">Devotee Profile 👤</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your personal details, verified contacts, and security settings.
          </p>
        </div>
        <Link to="/addresses">
          <Button variant="outline" size="sm">Manage Addresses</Button>
        </Link>
      </div>

      <div className="p-6 border rounded-lg bg-card space-y-4">
        {/* TODO: Display Name, Verified Mobile (+91), Verified Email */}
        {/* TODO: Add change password form */}
        <div className="p-4 bg-muted/40 rounded border text-xs text-muted-foreground">
          [Devotee Account Details & Security Settings Placeholder]
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
