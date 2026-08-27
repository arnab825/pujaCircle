import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, ForgotPasswordInput } from '@/schemas/auth.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { AuthRoleTabs } from '@/components/auth/AuthRoleTabs';
import { Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export interface ForgotPasswordCardProps {
  defaultRole?: 'USER' | 'PRIEST';
}

export const ForgotPasswordCard: React.FC<ForgotPasswordCardProps> = ({
  defaultRole = 'USER',
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryRole = searchParams.get('role')?.toUpperCase();
  const initialRole = (queryRole === 'PRIEST' || queryRole === 'USER') ? queryRole : defaultRole;

  const [activeRole, setActiveRole] = useState<'USER' | 'PRIEST'>(initialRole);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleConfig = {
    USER: {
      title: 'User Password Recovery',
      subtitle: 'Enter your registered email to receive a password reset code.',
      demoEmail: 'user@example.demo',
      login: '/user/login',
      reset: '/user/reset-password',
    },
    PRIEST: {
      title: 'Priest Password Recovery',
      subtitle: 'Enter your registered priest email to receive a password reset code.',
      demoEmail: 'priest@example.demo',
      login: '/priest/login',
      reset: '/priest/reset-password',
    },
  }[activeRole];

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleRoleChange = (newRole: string) => {
    const role = newRole as 'USER' | 'PRIEST';
    setActiveRole(role);
    setError(null);
    reset({
      email: '',
    });
  };

  const onSubmit = (data: ForgotPasswordInput) => {
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.info(`Recovery OTP sent to ${data.email}. Mock code: 123456`);
      navigate(roleConfig.reset);
    }, 400);
  };

  const handleFillDemo = () => {
    setValue('email', roleConfig.demoEmail, { shouldValidate: true });
    setError(null);
  };

  return (
    <div className="container max-w-md py-8 sm:py-12 px-4">
      {/* Role Switcher Tabs */}
      <AuthRoleTabs activeRole={activeRole} onChange={handleRoleChange} />

      <Card className="shadow-md border border-border/90 rounded-lg overflow-hidden">
        <CardHeader className="text-center space-y-2 pb-4 pt-6">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary mb-1">
            <Mail className="h-5 w-5" />
          </div>
          <CardTitle className="text-2xl font-bold font-serif text-foreground">
            {roleConfig.title}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
            {roleConfig.subtitle}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 pt-1">
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
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
                  placeholder={roleConfig.demoEmail}
                  {...register('email')}
                  className="pl-9 text-xs"
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-destructive">{errors.email.message}</p>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFillDemo}
              className="w-full text-xs text-muted-foreground hover:text-foreground border-dashed h-8 gap-1.5"
            >
              <Sparkles className="h-3 w-3 text-primary" />
              Fill Demo Email ({roleConfig.demoEmail})
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3.5 pb-6 pt-1">
            <Button
              type="submit"
              className="w-full text-xs font-semibold h-10 gap-1.5 shadow-xs"
              disabled={isLoading}
            >
              {isLoading ? 'Sending Code...' : 'Send Password Reset Code'}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
            <div className="text-center text-xs text-muted-foreground">
              <Link to={roleConfig.login} className="text-primary hover:underline font-medium">
                ← Return to Sign In
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ForgotPasswordCard;
