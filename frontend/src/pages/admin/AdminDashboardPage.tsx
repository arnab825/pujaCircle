import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Users, Calendar } from 'lucide-react';

const AdminDashboardPage: React.FC = () => {
  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Portal Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform administration, priest approval verification, and metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Priest Approvals</CardTitle>
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <CardDescription>Review pending priest applications</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/admin/priest-approvals">
              <Button variant="outline" className="w-full">Review Queue (1 Pending)</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Registered Devotees</CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </div>
            <CardDescription>Manage user accounts & verification</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>View Users (Future Phase)</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Platform Bookings</CardTitle>
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <CardDescription>System-wide ritual activity</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>Booking Overview (Future Phase)</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
