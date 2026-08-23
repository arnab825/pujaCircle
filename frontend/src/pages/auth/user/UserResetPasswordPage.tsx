import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Lock, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

/**
 * UserResetPasswordPage
 * Reset Password with Email OTP validation
 */
const UserResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otp.trim() !== '123456') {
      setError('Invalid OTP code. Please use development mock code: 123456');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    toast.success('Password updated successfully! Please sign in.');
    navigate('/auth/user/login');
  };

  return (
    <div className="container max-w-md py-12 px-4">
      <Card className="shadow-md border-border/80">
        <CardHeader className="text-center space-y-1 pb-4">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-1">
            <Lock className="h-5 w-5" />
          </div>
          <CardTitle className="text-2xl font-bold font-serif text-foreground">
            Set New Password
          </CardTitle>
          <CardDescription className="text-xs">
            Enter the 6-digit recovery OTP and your new password.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleReset}>
          <CardContent className="space-y-3.5">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="p-2.5 bg-muted/40 rounded-lg border text-xs text-muted-foreground">
              Mock OTP: <strong className="text-primary font-mono">123456</strong>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Recovery OTP</Label>
              <Input
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="font-mono text-center tracking-widest text-sm"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">New Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-9 text-xs"
                  required
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
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Confirm New Password</Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-9 text-xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setOtp('123456');
                setNewPassword('User@123');
                setConfirmPassword('User@123');
                setError(null);
              }}
              className="text-[11px] text-primary hover:underline font-medium block text-right w-full"
            >
              Fill demo values
            </button>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 pt-2">
            <Button type="submit" className="w-full text-xs font-medium gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Update Password & Sign In
            </Button>
            <div className="text-center text-xs text-muted-foreground">
              <Link to="/auth/user/login" className="text-primary hover:underline">
                ← Cancel and Return to Sign In
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default UserResetPasswordPage;
