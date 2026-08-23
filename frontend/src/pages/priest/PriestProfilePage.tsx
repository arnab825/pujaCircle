import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const PriestProfilePage: React.FC = () => {
  return (
    <div className="container max-w-2xl py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Purohit Profile Settings</h1>
        <p className="text-muted-foreground mt-1">Update your Vedic background, language proficiencies, and service areas.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vedic Credentials</CardTitle>
          <CardDescription>This information is visible to devotees booking rituals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Display Name</Label>
            <Input defaultValue="Pt. Ramesh Shastri" />
          </div>
          <div className="space-y-1">
            <Label>Vedic Experience (Years)</Label>
            <Input type="number" defaultValue="18" />
          </div>
          <div className="space-y-1">
            <Label>Bio & Lineage</Label>
            <Textarea
              rows={3}
              defaultValue="Vedic scholar trained in Varanasi Gurukul. Specializes in Griha Pravesh and Satyanarayan Katha."
            />
          </div>
          <Button>Save Profile</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PriestProfilePage;
