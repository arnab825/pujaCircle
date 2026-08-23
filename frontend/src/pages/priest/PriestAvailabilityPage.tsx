import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

const PriestAvailabilityPage: React.FC = () => {
  return (
    <div className="container max-w-3xl py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Muhurat Slots & Availability</h1>
          <p className="text-muted-foreground mt-1">Set the dates and time windows you are available for rituals.</p>
        </div>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" /> Add Slot
        </Button>
      </div>

      <div className="space-y-3">
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="font-semibold text-sm">2026-08-25</p>
              <p className="text-xs text-muted-foreground">07:30 AM - 10:30 AM (Auspicious Morning)</p>
            </div>
            <Badge variant="default">AVAILABLE</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="font-semibold text-sm">2026-08-25</p>
              <p className="text-xs text-muted-foreground">11:00 AM - 02:00 PM (Midday)</p>
            </div>
            <Badge variant="default">AVAILABLE</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="font-semibold text-sm">2026-08-26</p>
              <p className="text-xs text-muted-foreground">08:00 AM - 11:00 AM</p>
            </div>
            <Badge variant="secondary">BOOKED</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PriestAvailabilityPage;
