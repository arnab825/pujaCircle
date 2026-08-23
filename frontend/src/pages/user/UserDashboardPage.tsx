import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { Calendar, MapPin, User, Sparkles } from 'lucide-react';

const UserDashboardPage: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Namaste, {user?.name || 'Devotee'}</h1>
          <p className="text-muted-foreground mt-1">Manage your rituals, addresses, and priest appointments.</p>
        </div>
        <Link to="/priests">
          <Button className="gap-2">
            <Sparkles className="h-4 w-4" /> Book New Puja
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">My Bookings</CardTitle>
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <CardDescription>View upcoming and completed rituals</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/user/bookings">
              <Button variant="outline" className="w-full">View All Bookings</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Saved Addresses</CardTitle>
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <CardDescription>Manage puja locations and default address</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/user/addresses">
              <Button variant="outline" className="w-full">Manage Addresses</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Profile Details</CardTitle>
              <User className="h-5 w-5 text-primary" />
            </div>
            <CardDescription>Personal info and phone verification</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/user/profile">
              <Button variant="outline" className="w-full">Edit Profile</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboardPage;
