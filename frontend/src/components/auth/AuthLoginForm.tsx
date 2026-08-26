import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { phoneLoginSchema, UserLoginInput } from '@/schemas/auth.schema';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Phone, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export interface AuthLoginFormProps {
  role: 'USER' | 'PRIEST';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  demoCredentials: {
    phone: string;
    pass: string;
  };
  redirectPath: string;
  successMessage: string;
  forgotPasswordPath: string;
  registerPath: string;
  registerPromptText: string;
}

export const AuthLoginForm: React.FC<AuthLoginFormProps> = ({
  title,
  subtitle,
  icon,
  demoCredentials,
  redirectPath,
  successMessage,
  forgotPasswordPath,
  registerPath,
  registerPromptText,
}) => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UserLoginInput>({
    resolver: zodResolver(phoneLoginSchema),
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
      toast.success(successMessage);
      navigate(redirectPath);
    }
  };

  const handleFillDemo = () => {
    setValue('phoneNumber', demoCredentials.phone, { shouldValidate: true });
    setValue('password', demoCredentials.pass, { shouldValidate: true });
    clearError();
  };

  return (
    <div className="container max-w-md py-12 px-4">
      <Card className="shadow-md border-border/80">
        <CardHeader className="text-center space-y-2 pb-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-1">
            {icon}
          </div>
          <CardTitle className="text-2xl font-bold font-serif text-foreground">
            {title}
          </CardTitle>
          <CardDescription className="text-xs">
            {subtitle}
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
                  placeholder={demoCredentials.phone}
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
                  to={forgotPasswordPath}
                  className="text-[11px] text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  className="pl-9 pr-9 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Quick Demo Fill Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFillDemo}
              className="w-full text-xs text-muted-foreground border-dashed h-8"
            >
              Fill Demo Credentials ({demoCredentials.phone})
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pb-6">
            <Button type="submit" className="w-full gap-2 text-xs h-10" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
              <ArrowRight className="h-4 w-4" />
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              {registerPromptText}{' '}
              <Link to={registerPath} className="text-primary font-semibold hover:underline">
                Create an account
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
