import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminLoginSchema, AdminLoginInput } from '@/schemas/auth.schema';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ShieldAlert, Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

/**
 * AdminLoginPage
 * Private Internal Console Sign In for Platform Administrators
 * Built with React Hook Form, Zod Schema Validation, and Zustand Authentication.
 */
const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AdminLoginInput>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: AdminLoginInput) => {
    clearError();
    const success = await login({
      identifier: data.email.trim(),
      password: data.password,
    });

    if (success) {
      toast.success('Welcome to PujaCircle Admin Console.');
      navigate('/admin/dashboard');
    }
  };

  const handleFillDemo = () => {
    setValue('email', 'admin@pujacircle.demo', { shouldValidate: true });
    setValue('password', 'Admin@123', { shouldValidate: true });
    clearError();
  };

  return (
    <div className="container max-w-md py-16 px-4">
      <Card className="shadow-md border-destructive/30">
        <CardHeader className="text-center space-y-2 pb-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-destructive text-destructive-foreground mb-1 shadow-sm">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold font-serif text-foreground">
            PujaCircle Admin
          </CardTitle>
          <CardDescription className="text-xs">
            Private internal operations console. Authorized personnel only.
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

            {/* Email Address */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Administrator Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="admin@pujacircle.demo"
                  {...register('email')}
                  className="pl-9 text-xs"
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Admin Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter admin password"
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
                <span className="font-semibold text-foreground">Demo Admin:</span>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="text-destructive hover:underline font-medium"
                >
                  Auto-fill demo
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                admin@pujacircle.demo • Admin@123
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 pt-2">
            <Button
              type="submit"
              variant="destructive"
              className="w-full text-xs font-medium gap-1.5"
              disabled={isLoading}
            >
              {isLoading ? 'Authenticating...' : 'Access Administration Console'}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminLoginPage;
