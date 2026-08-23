import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ForgotPasswordPage: React.FC = () => {
  return (
    <div className="container max-w-md py-16">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Forgot Password / Access</CardTitle>
          <CardDescription>Enter registered phone to recover access</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Registered Phone Number</Label>
            <Input placeholder="98765 43210" maxLength={10} />
          </div>
          <Button className="w-full">Send Recovery OTP</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
