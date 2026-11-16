import React, { useState } from 'react';
import { Lock, KeyRound, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export interface ChangePasswordCardProps {
  onUpdatePassword: (passwords: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<{ success: boolean; message?: string }>;
  title?: string;
  description?: string;
  buttonLabel?: string;
}

/**
 * ============================================================================
 * [COMPONENT: CHANGE PASSWORD CARD]
 * Reusable password update card used across Admin, Priest, and Devotee profiles.
 * Features:
 * - Password visibility toggles for each field
 * - Client-side validation (min length, match check)
 * - Loading state with spinner
 * - Sonner toast notifications
 * - 100% Flexbox, Haldi gold trims (#780016), pure solid white canvas
 * ============================================================================
 */
export const ChangePasswordCard: React.FC<ChangePasswordCardProps> = ({
  onUpdatePassword,
  title = 'Security & Credentials',
  description = 'Update your account password to keep your sacred credentials secure.',
  buttonLabel = 'Update Password',
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error('Please enter your current password.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match. Please verify.');
      return;
    }

    setIsUpdating(true);
    try {
      const res = await onUpdatePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (res.success) {
        toast.success(res.message || 'Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(res.message || 'Failed to update password. Please check your current password.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'An unexpected error occurred while updating password.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="border-2 border-amber-300 bg-white rounded-xl p-4 sm:p-7 shadow-sm">
      <div className="flex items-center gap-3 pb-4 border-b border-amber-200">
        <div className="h-9 w-9 rounded-md bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
          <KeyRound className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold font-serif text-stone-900">
            {title}
          </h2>
          <p className="text-xs text-stone-600">
            {description}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4 max-w-xl">
        {/* Current Password */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-stone-700">
            Current Password <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Input
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="pl-9 pr-10 border-stone-300 bg-white text-xs sm:text-sm"
              disabled={isUpdating}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none"
              tabIndex={-1}
            >
              {showCurrentPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-stone-700">
            New Password (minimum 6 characters) <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new strong password"
              className="pl-9 pr-10 border-stone-300 bg-white text-xs sm:text-sm"
              disabled={isUpdating}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none"
              tabIndex={-1}
            >
              {showNewPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm New Password */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-stone-700">
            Confirm New Password <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="pl-9 pr-10 border-stone-300 bg-white text-xs sm:text-sm"
              disabled={isUpdating}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Security advisory tip */}
        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
          <span>
            Passwords must be at least 6 characters. Do not share your login credentials with anyone.
          </span>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={isUpdating || !currentPassword || !newPassword || !confirmPassword}
            className="w-full sm:w-auto bg-[#780016] hover:bg-[#5a0010] text-white font-medium text-xs sm:text-sm px-6 py-2.5 h-auto shadow-sm"
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating Security Credentials...
              </>
            ) : (
              <>
                <KeyRound className="h-4 w-4 mr-2" />
                {buttonLabel}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
