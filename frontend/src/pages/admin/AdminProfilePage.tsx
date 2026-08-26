import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Lock,
  Calendar,
  KeyRound,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';

import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/*
  PAGE: Admin Profile & Settings (/admin/profile)
  
  ACCESS:
  - ADMIN role only
  
  PURPOSE:
  - Dedicated workspace page for Platform Administrators to view account details,
    update full name, change password, and audit platform security permissions.
  - Email Address & Phone Number are locked (read-only) for administrative security.
*/
const AdminProfilePage: React.FC = () => {
  const { user, setUser } = useAuthStore();

  // Form states
  const [fullName, setFullName] = useState(user?.name || 'PujaCircle Admin');
  const [isSavingName, setIsSavingName] = useState(false);

  // Security / Password update states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Read-only account metadata
  const adminEmail = user?.email || 'admin@pujacircle.demo';
  const adminPhone = user?.phoneNumber || '+919900011223';
  const joinedDate = 'January 2026';

  // Handle Save Name
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Please enter a valid full name.');
      return;
    }

    setIsSavingName(true);

    setTimeout(() => {
      if (user) {
        setUser({
          ...user,
          name: fullName.trim(),
        });
      }
      toast.success('Admin profile name updated successfully!');
      setIsSavingName(false);
    }, 400);
  };

  // Handle Update Password
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error('Please enter your current password.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match.');
      return;
    }

    setIsUpdatingPassword(true);

    setTimeout(() => {
      toast.success('Admin password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsUpdatingPassword(false);
    }, 500);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      {/* Page Header */}
      <div className="border-b pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
          Admin Profile & Settings
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Manage your administrator account details, security credentials, and system access permissions.
        </p>
      </div>

      {/* Admin Profile Overview Card */}
      <Card className="shadow-sm border overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
            <div className="w-20 h-20 sm:w-16 sm:h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center font-bold text-2xl sm:text-xl border border-destructive/20 shadow-sm shrink-0">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl font-bold text-foreground">{fullName}</h2>
                <Badge variant="destructive" className="text-[10px] uppercase font-bold tracking-wide">
                  ADMIN
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{adminEmail}</p>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-[11px] text-muted-foreground pt-1">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Account Created: {joinedDate}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Edit Personal Profile Information Card */}
        <Card className="shadow-sm border">
          <CardHeader className="py-4 px-6 border-b bg-muted/20">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Account Details
            </CardTitle>
            <CardDescription className="text-xs">
              Update your full name. Email address and phone number are locked for administrative security.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Full Name Field (Editable) */}
              <div className="space-y-1.5">
                <Label htmlFor="admin-fullname" className="text-xs font-semibold">
                  Full Name *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="admin-fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-9 text-xs h-9 bg-card"
                    placeholder="Enter full name"
                    required
                  />
                </div>
              </div>

              {/* Email Address (Read-only / Disabled) */}
              <div className="space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
                  <Label htmlFor="admin-email" className="text-xs font-semibold">
                    Email Address
                  </Label>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                    <Lock className="w-3 h-3 text-muted-foreground" />
                    Locked for Admin Account
                  </span>
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                  <Input
                    id="admin-email"
                    type="email"
                    value={adminEmail}
                    disabled
                    className="pl-9 text-xs h-9 bg-muted/50 text-muted-foreground cursor-not-allowed border-dashed"
                  />
                </div>
              </div>

              {/* Phone Number (Read-only / Disabled) */}
              <div className="space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
                  <Label htmlFor="admin-phone" className="text-xs font-semibold">
                    Phone Number
                  </Label>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                    <Lock className="w-3 h-3 text-muted-foreground" />
                    Locked for Security
                  </span>
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                  <Input
                    id="admin-phone"
                    type="text"
                    value={adminPhone}
                    disabled
                    className="pl-9 text-xs h-9 bg-muted/50 text-muted-foreground cursor-not-allowed border-dashed"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSavingName}
                  className="text-xs gap-1.5 bg-primary text-primary-foreground w-full sm:w-auto h-9 font-medium justify-center"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSavingName ? 'Saving...' : 'Save Name Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Change Security Password Card */}
        <Card className="shadow-sm border">
          <CardHeader className="py-4 px-6 border-b bg-muted/20">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-primary" />
              Security & Password
            </CardTitle>
            <CardDescription className="text-xs">
              Update your administrator login password regularly to protect system data.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {/* Current Password */}
              <div className="space-y-1.5">
                <Label htmlFor="current-pass" className="text-xs font-semibold">
                  Current Password *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="current-pass"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="pl-9 pr-9 text-xs h-9 bg-card"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <Label htmlFor="new-pass" className="text-xs font-semibold">
                  New Password *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="new-pass"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-9 pr-9 text-xs h-9 bg-card"
                    placeholder="Enter at least 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirm-pass" className="text-xs font-semibold">
                  Confirm New Password *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm-pass"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9 text-xs h-9 bg-card"
                    placeholder="Re-enter new password"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="sm"
                  variant="outline"
                  disabled={isUpdatingPassword}
                  className="text-xs gap-1.5 shadow-sm w-full sm:w-auto h-9 font-medium justify-center"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminProfilePage;
