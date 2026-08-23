import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userLoginSchema, UserLoginInput } from '@/schemas/auth.schema';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Sparkles, Phone, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

/**
 * UserLoginPage
 * Customer / Devotee Login Portal
 * Built with React Hook Form, Zod Schema Validation, and Zustand Authentication.
 */
const UserLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UserLoginInput>({
    resolver: zodResolver(userLoginSchema),
    defaultValues: {
      phoneNumber: '',
      password: '',
    },
  });

  const onSubmit = async (data: UserLoginInput) => {
    clearError();
    const cleanPhone = data.phoneNumber.trim();
    const identifier = cleanPhone.startsWith('+91') ? cleanPhone : `+91${cleanPhone.replace(/\D/g, '')}`;

    const success = await login({
      identifier,
      password: data.password,
    });

    if (success) {
      toast.success('Welcome back to PujaCircle!');
      navigate('/rituals');
    }
  };

  const handleFillDemo = () => {
    setValue('phoneNumber', '+919876543210', { shouldValidate: true });
    setValue('password', 'User@123', { shouldValidate: true });
    clearError();
  };

  return (
    <div className="container max-w-md py-12 px-4">
      <Card className="shadow-md border-border/80">
        <CardHeader className="text-center space-y-2 pb-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-1">
            <Sparkles className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold font-serif text-foreground">
            Devotee Sign In
          </CardTitle>
          <CardDescription className="text-xs">
            Enter your mobile number and password to access your puja bookings.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 pt-2">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Mobile Number (+91) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Mobile Number (+91)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="+91 98765 43210"
                  {...register('phoneNumber')}
                  className="pl-9 text-xs"
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-[11px] text-destructive">{errors.phoneNumber.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Password</Label>
                <Link
                  to="/auth/user/forgot-password"
                  className="text-[11px] text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password')}
                  className="pl-9 pr-9 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Quick Demo Autofill */}
            <div className="p-2.5 rounded-md bg-muted/40 border text-[11px] text-muted-foreground space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Demo Devotee:</span>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="text-primary hover:underline font-medium"
                >
                  Auto-fill demo
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                +919876543210 • User@123
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 pt-2">
            <Button
              type="submit"
              className="w-full text-xs font-medium gap-1.5"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In as Devotee'}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>

            <div className="text-center text-xs text-muted-foreground">
              New to PujaCircle?{' '}
              <Link to="/auth/user/register" className="text-primary font-medium hover:underline">
                Create an account
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default UserLoginPage;
