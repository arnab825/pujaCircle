import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { verifyOtpSchema, VerifyOtpInput } from '@/schemas/auth.schema';
import { authApi } from '@/api/auth.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

/**
 * UserVerifyEmailPage
 * Standalone Email Verification Page
 * Built with React Hook Form, Zod Schema Validation, and centralized mock OTP.
 */
const UserVerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<VerifyOtpInput>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      otp: '',
    },
  });

  const onSubmit = async (data: VerifyOtpInput) => {
    setError(null);
    const res = await authApi.verifyEmailOtp({ email: 'user@example.demo', otp: data.otp });

    if (res.success) {
      toast.success('Email address verified successfully!');
      navigate('/auth/user/login');
    } else {
      setError(res.message);
    }
  };

  const handleFillDemoOtp = () => {
    setValue('otp', '123456', { shouldValidate: true });
    setError(null);
  };

  return (
    <div className="container max-w-md py-12 px-4">
      <Card className="shadow-md border-border/80">
        <CardHeader className="text-center space-y-1 pb-4">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-1">
            <Mail className="h-5 w-5" />
          </div>
          <CardTitle className="text-2xl font-bold font-serif text-foreground">
            Verify Email Address
          </CardTitle>
          <CardDescription className="text-xs">
            Enter the 6-digit verification code sent to your email.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
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
                {...register('otp')}
                className="font-mono text-center tracking-widest text-base"
              />
              {errors.otp && (
                <p className="text-[11px] text-destructive">{errors.otp.message}</p>
              )}
            </div>

            <button
              type="button"
              onClick={handleFillDemoOtp}
              className="text-[11px] text-primary hover:underline font-medium block text-right w-full"
            >
              Fill mock OTP (123456)
            </button>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 pt-2">
            <Button type="submit" className="w-full text-xs font-medium gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Verify Email Address
            </Button>
            <div className="text-center text-xs text-muted-foreground">
              <Link to="/auth/user/login" className="text-primary hover:underline">
                Back to Sign In
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default UserVerifyEmailPage;
