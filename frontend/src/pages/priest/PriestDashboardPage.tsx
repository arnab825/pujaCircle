import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, UserCheck } from 'lucide-react';

const PriestDashboardPage: React.FC = () => {
  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Purohit Portal Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage ritual appointments, schedules, and your verified profile.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Appointments</CardTitle>
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <CardDescription>Scheduled pujas from devotees</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/priest/bookings">
              <Button variant="outline" className="w-full">View Appointments</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Availability & Slots</CardTitle>
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <CardDescription>Configure muhurat slots for devotees</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/priest/availability">
              <Button variant="outline" className="w-full">Manage Slots</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Purohit Profile</CardTitle>
              <UserCheck className="h-5 w-5 text-primary" />
            </div>
            <CardDescription>Update bio, languages & specializations</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/priest/profile">
              <Button variant="outline" className="w-full">Edit Profile</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PriestDashboardPage;
