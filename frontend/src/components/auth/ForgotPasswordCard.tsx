import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, ForgotPasswordInput } from '@/schemas/auth.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export interface ForgotPasswordCardProps {
  role: 'USER' | 'PRIEST';
  loginPath: string;
  resetPath: string;
  demoEmail: string;
}

export const ForgotPasswordCard: React.FC<ForgotPasswordCardProps> = ({
  loginPath,
  resetPath,
  demoEmail,
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (data: ForgotPasswordInput) => {
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.info(`Recovery OTP sent to ${data.email}. Mock OTP: 123456`);
      navigate(resetPath);
    }, 400);
  };

  const handleFillDemo = () => {
    setValue('email', demoEmail, { shouldValidate: true });
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
            Recover Password
          </CardTitle>
          <CardDescription className="text-xs">
            Enter your registered email to receive a password reset OTP.
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

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Registered Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder={demoEmail}
                  {...register('email')}
                  className="pl-9 text-xs"
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-destructive">{errors.email.message}</p>
              )}
            </div>

            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[11px] text-primary hover:underline font-medium block text-right w-full"
            >
              Fill demo email ({demoEmail})
            </button>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 pt-2">
            <Button type="submit" className="w-full text-xs font-medium gap-1.5" disabled={isLoading}>
              {isLoading ? 'Sending OTP...' : 'Send Recovery OTP'}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
            <div className="text-center text-xs text-muted-foreground">
              <Link to={loginPath} className="text-primary hover:underline">
                ← Back to Sign In
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
