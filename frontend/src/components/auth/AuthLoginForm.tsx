import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { AuthRoleTabs } from '@/components/auth/AuthRoleTabs';
import { AuthShowcasePanel } from '@/components/auth/AuthShowcasePanel';

const loginSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, 'Please enter your email address')
      .email('Please enter a valid email address')
      .max(150, 'Email is too long'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password is too long'),
  })
  .strict();

type LoginFormData = z.infer<typeof loginSchema>;

export interface AuthLoginFormProps {
  role: 'USER' | 'PRIEST';
  title: string;
  subtitle: string;
  forgotPasswordHref: string;
  registerHref: string;
  registerLabel: string;
  dashboardRedirectHref: string;
  alternateRoleRedirectHref: string;
}

/**
 * ============================================================================
 * [COMPONENT: AUTH LOGIN FORM]
 * Unified, accessible authentication form for Devotees and Purohits.
 * Combines:
 * - Left Sacred Vermilion Showcase Panel
 * - Interactive Role Switcher Tabs
 * - Real-time Form Validation via Zod + React Hook Form
 * - Account Registration Popup when email is unregistered
 * ============================================================================
 */
export const AuthLoginForm: React.FC<AuthLoginFormProps> = ({
  role,
  title,
  subtitle,
  forgotPasswordHref,
  registerHref,
  registerLabel,
  dashboardRedirectHref,
  alternateRoleRedirectHref,
}) => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isRegisterPopupOpen, setIsRegisterPopupOpen] = useState(false);
  const [attemptedEmail, setAttemptedEmail] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const watchEmail = watch('email');
  const watchPassword = watch('password');
  const isFormValid = Boolean(watchEmail?.trim() && watchPassword?.trim());

  // Clear stale auth errors on mount/unmount
  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    setAttemptedEmail(data.email.trim());

    const success = await login({
      email: data.email.trim().toLowerCase(),
      password: data.password,
    });

    if (success) {
      toast.success('Signed in successfully! Welcome to PujaCircle.');
      navigate(dashboardRedirectHref);
    } else {
      const currentErr = useAuthStore.getState().error || '';
      const isNotRegistered =
        currentErr.toLowerCase().includes('not found') ||
        currentErr.toLowerCase().includes('no account') ||
        currentErr.toLowerCase().includes('not registered') ||
        currentErr.toLowerCase().includes('does not exist');

      if (isNotRegistered) {
        setIsRegisterPopupOpen(true);
      }
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex items-center justify-center py-6 sm:py-10 px-3 sm:px-4 max-w-full overflow-x-hidden">
      <div className="w-full max-w-4xl rounded-xl border-2 border-amber-300 bg-white shadow-xl overflow-hidden flex flex-col lg:flex-row items-stretch">
        {/* Left Showcase Panel */}
        <AuthShowcasePanel role={role} />

        {/* Right Form Panel */}
        <div className="w-full lg:w-7/12 p-4 sm:p-8 md:p-10 bg-white flex flex-col justify-between relative">
          <div>
            {/* Role Switcher Tabs */}
            <div className="flex items-center justify-between gap-2 sm:gap-4 mb-6">
              <div className="flex-1 min-w-0">
                <AuthRoleTabs
                  activeRole={role}
                  onRoleChange={(newRole) => {
                    clearError();
                    if (newRole !== role) {
                      navigate(alternateRoleRedirectHref);
                    }
                  }}
                />
              </div>
            </div>

            {/* Form Header */}
            <div className="space-y-1 mb-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-semibold">
                <Sparkles className="h-3 w-3 text-amber-700" />
                <span>Secure Vedic Portal</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-serif text-stone-950">
                {title}
              </h1>
              <p className="text-xs text-stone-600">
                {subtitle}
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                <div className="flex-1">
                  <div className="font-semibold">Sign in unsuccessful</div>
                  <div>{error}</div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-700">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <Input
                    type="email"
                    {...register('email')}
                    placeholder="name@example.com"
                    className="pl-9 border-stone-300 bg-white text-xs sm:text-sm"
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-stone-700">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <Link
                    to={forgotPasswordHref}
                    className="text-[11px] text-[#780016] hover:underline font-semibold"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="Enter your password"
                    className="pl-9 pr-10 border-stone-300 bg-white text-xs sm:text-sm"
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="w-full bg-[#780016] hover:bg-[#5a0010] text-white font-medium text-xs sm:text-sm py-2.5 h-auto shadow-sm mt-2"
              >
                {isLoading ? (
                  <span>Verifying Credentials...</span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    Sign In to Sanctum
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          </div>

          {/* Footer Register Link */}
          <div className="pt-6 mt-6 border-t border-stone-200 text-center text-xs text-stone-600">
            Don't have an account?{' '}
            <Link
              to={registerHref}
              className="font-bold text-[#780016] hover:underline"
            >
              {registerLabel}
            </Link>
          </div>
        </div>
      </div>

      {/* Account Not Registered Modal */}
      <Dialog open={isRegisterPopupOpen} onOpenChange={setIsRegisterPopupOpen}>
        <DialogContent className="sm:max-w-md border-2 border-amber-300 bg-white">
          <DialogHeader>
            <div className="h-10 w-10 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 mb-2">
              <UserCheck className="h-5 w-5" />
            </div>
            <DialogTitle className="font-serif text-lg text-stone-950">
              Account Not Registered
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-600 mt-1">
              We couldn't find an existing PujaCircle account associated with{' '}
              <span className="font-semibold text-stone-900">{attemptedEmail}</span>.
              Would you like to register now?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRegisterPopupOpen(false)}
              className="text-xs border-stone-300"
            >
              Check Again
            </Button>
            <Button
              type="button"
              onClick={() => {
                setIsRegisterPopupOpen(false);
                navigate(registerHref);
              }}
              className="bg-[#780016] hover:bg-[#5a0010] text-white text-xs"
            >
              {registerLabel}
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
