import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin } from 'lucide-react';

const PriestBookingsPage: React.FC = () => {
  return (
    <div className="container max-w-3xl py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Devotee Puja Appointments</h1>
        <p className="text-muted-foreground mt-1">Review scheduled ceremonies and devotee addresses.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <span className="text-xs font-mono text-muted-foreground">Booking Ref: PC-2026-0801</span>
            <CardTitle className="text-lg">Griha Pravesh & Vastu Puja</CardTitle>
          </div>
          <Badge>CONFIRMED</Badge>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground pt-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>2026-08-26</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span>08:00 AM - 11:00 AM</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span>Aditi Sharma, Bandra West, Mumbai</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PriestBookingsPage;
