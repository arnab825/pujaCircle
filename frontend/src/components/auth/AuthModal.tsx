import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/api/auth.api';
import { toast } from 'sonner';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalView, closeAuthModal, setUser, openAuthModal } = useAuthStore();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit Indian phone number');
      return;
    }
    setIsLoading(true);
    try {
      await authApi.sendOtp(phoneNumber);
      toast.success(`OTP sent to +91 ${phoneNumber} (Use 123456)`);
      openAuthModal('VERIFY_OTP');
    } catch {
      toast.error('Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit OTP');
      return;
    }
    setIsLoading(true);
    try {
      const response = await authApi.verifyOtp({ phoneNumber, otp });
      setUser(response.user);
      toast.success('Signed in successfully!');
      closeAuthModal();
    } catch (err: any) {
      toast.error(err.message || 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {authModalView === 'LOGIN' && 'Sign In with Phone'}
            {authModalView === 'REGISTER' && 'Create Devotee Account'}
            {authModalView === 'VERIFY_OTP' && 'Verify OTP'}
          </DialogTitle>
          <DialogDescription>
            {authModalView === 'VERIFY_OTP'
              ? `Enter the 6-digit OTP sent to +91 ${phoneNumber}`
              : 'Enter your 10-digit Indian mobile number to proceed.'}
          </DialogDescription>
        </DialogHeader>

        {authModalView !== 'VERIFY_OTP' ? (
          <form onSubmit={handleSendOtp} className="space-y-4 pt-2">
            {authModalView === 'REGISTER' && (
              <div className="space-y-1">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Aditi Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="phone">Mobile Number</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-sm text-muted-foreground">
                  +91
                </span>
                <Input
                  id="phone"
                  type="tel"
                  maxLength={10}
                  className="rounded-l-none"
                  placeholder="98765 43210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label htmlFor="otp">Enter 6-Digit OTP</Label>
              <Input
                id="otp"
                maxLength={6}
                placeholder="123456"
                className="text-center tracking-widest text-lg font-mono"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
