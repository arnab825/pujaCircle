import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ResetPasswordPage: React.FC = () => {
  return (
    <div className="container max-w-md py-16">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Reset Account Credentials</CardTitle>
          <CardDescription>Enter OTP and update your phone verification</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>OTP Code</Label>
            <Input maxLength={6} placeholder="123456" />
          </div>
          <Button className="w-full">Confirm & Reset</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
