import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';

const LoginPage: React.FC = () => {
  return (
    <div className="container max-w-md py-16">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>Enter your mobile number to receive an OTP</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Mobile Number</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-sm text-muted-foreground">
                +91
              </span>
              <Input className="rounded-l-none" placeholder="98765 43210" maxLength={10} />
            </div>
          </div>
          <Button className="w-full">Send OTP</Button>
          <div className="text-center text-xs text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/auth/register" className="text-primary hover:underline font-medium">
              Register
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
