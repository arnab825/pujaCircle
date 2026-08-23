import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const VerifyOtpPage: React.FC = () => {
  return (
    <div className="container max-w-md py-16">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Verify Phone OTP</CardTitle>
          <CardDescription>Enter the 6-digit verification code</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>6-Digit OTP</Label>
            <Input maxLength={6} placeholder="123456" className="text-center text-lg font-mono tracking-widest" />
          </div>
          <Button className="w-full">Verify & Log In</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyOtpPage;
