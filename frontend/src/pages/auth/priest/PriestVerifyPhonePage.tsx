import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Phone, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const PriestVerifyPhonePage: React.FC = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim() === '123456') {
      toast.success('Purohit mobile verified successfully!');
      navigate('/auth/priest/login');
    } else {
      setError('Invalid OTP code. Please enter development mock code: 123456');
    }
  };

  return (
    <div className="container max-w-md py-12 px-4">
      <Card className="shadow-md border-primary/20">
        <CardHeader className="text-center space-y-1 pb-4">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground mb-1 shadow-sm">
            <Phone className="h-5 w-5" />
          </div>
          <CardTitle className="text-2xl font-bold font-serif text-foreground">
            Verify Purohit Mobile
          </CardTitle>
          <CardDescription className="text-xs">
            Enter the 6-digit verification code sent to your +91 mobile.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleVerify}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="p-3 bg-muted/40 rounded-lg border text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">Development Mock OTP:</p>
              <p>Enter code: <strong className="text-primary font-mono text-sm">123456</strong></p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">6-Digit Code</Label>
              <Input
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="font-mono text-center tracking-widest text-base"
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 pt-2">
            <Button type="submit" className="w-full text-xs font-medium gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Verify Mobile Number
            </Button>
            <div className="text-center text-xs text-muted-foreground">
              <Link to="/auth/priest/login" className="text-primary hover:underline">
                Back to Sign In
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default PriestVerifyPhonePage;
