import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/auth.store';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="container max-w-2xl py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Devotee Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account information and contact preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your registered identity on PujaCircle</CardDescription>
            </div>
            {user?.isPhoneVerified && (
              <Badge variant="accent" className="flex items-center gap-1 text-green-700 bg-green-50 border-green-200">
                <CheckCircle2 className="h-3.5 w-3.5" /> Phone Verified
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Full Name</Label>
            <Input defaultValue={user?.fullName || 'Aditi Sharma'} />
          </div>
          <div className="space-y-1">
            <Label>Registered Phone Number (+91)</Label>
            <Input disabled defaultValue={user?.phoneNumber || '9876543210'} />
            <p className="text-[11px] text-muted-foreground">Phone number is verified and tied to OTP login.</p>
          </div>
          <Button className="w-full sm:w-auto">Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
