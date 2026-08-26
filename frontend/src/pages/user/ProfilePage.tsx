import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import {
  mockGetAddresses,
  mockGetBookings,
  mockUpdateUserProfile,
  mockResetPassword,
} from '@/mocks/mock-api';
import { mockDb } from '@/mocks/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { PageHeader } from '@/components/common/PageHeader';
import {
  User,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Calendar,
  Lock,
  KeyRound,
  Sparkles,
  Edit3,
  Save,
  X,
  ChevronRight,
  BookOpen,
  Camera,
  Trash2,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';

export const ProfilePage: React.FC = () => {
  const { user, setUser } = useAuthStore();

  // 1. Identify active user from AuthStore or fallback to mock user
  const devoteeId = user?.id || 'user-devotee-1';
  const dbUser = mockDb.users.find((u) => u.id === devoteeId) || mockDb.users[0];

  // 2. Local state for devotee statistics
  const [addressCount, setAddressCount] = useState<number>(0);
  const [bookingCount, setBookingCount] = useState<number>(0);

  // 3. Avatar profile photo state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => {
    return localStorage.getItem(`devotee_avatar_${devoteeId}`) || null;
  });
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 4. Personal Information edit state (Only name is editable)
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>(user?.name || dbUser?.name || 'Devotee');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);

  // Read-only email and phone
  const email = user?.email || dbUser?.email || 'devotee@pujacircle.com';
  const phoneNumber = user?.phoneNumber || dbUser?.phoneNumber || '+91 9876543210';

  // 5. Password update form state
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState<boolean>(false);

  // Sync full name when user auth store changes
  useEffect(() => {
    if (user?.name) {
      setFullName(user.name);
    }
  }, [user]);

  // Load bookings and addresses count from mock API
  useEffect(() => {
    async function loadDevoteeStats() {
      try {
        const [addrRes, bookRes] = await Promise.all([
          mockGetAddresses(devoteeId),
          mockGetBookings(devoteeId),
        ]);
        if (addrRes.success) setAddressCount(addrRes.data.length);
        if (bookRes.success) setBookingCount(bookRes.data.length);
      } catch {
        setAddressCount(dbUser?.hasAddress ? 1 : 0);
        setBookingCount(dbUser?.bookingCount || 0);
      }
    }

    loadDevoteeStats();
  }, [devoteeId, dbUser]);

  // Helper for 2-letter avatar fallback initials
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'DV';

  // Format member joined date
  const memberSince = dbUser?.createdAt
    ? new Date(dbUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'January 2026';

  // Handler: Upload new profile photo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setAvatarUrl(dataUrl);
      localStorage.setItem(`devotee_avatar_${devoteeId}`, dataUrl);
      setIsAvatarModalOpen(false);
      toast.success('Profile picture updated successfully!');
    };
    reader.readAsDataURL(file);
  };

  // Handler: Remove profile photo
  const handleRemoveAvatar = () => {
    setAvatarUrl(null);
    localStorage.removeItem(`devotee_avatar_${devoteeId}`);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsAvatarModalOpen(false);
    toast.success('Profile picture removed successfully.');
  };

  // Handler: Save profile name changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await mockUpdateUserProfile(devoteeId, {
        fullName: fullName.trim(),
        email: email.trim(),
      });

      if (res.success && res.data) {
        setUser(res.data);
        setIsEditing(false);
        toast.success('Your profile name has been updated successfully!');
      } else {
        toast.error(res.message || 'Failed to update profile.');
      }
    } catch {
      toast.error('An error occurred while updating profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handler: Cancel editing
  const handleCancelEdit = () => {
    setFullName(user?.name || dbUser?.name || '');
    setIsEditing(false);
  };

  // Handler: Change password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await mockResetPassword({
        otp: '123456',
        newPassword,
        confirmPassword,
      });

      if (res.success) {
        if (dbUser) {
          dbUser.password = newPassword;
        }
        toast.success('Password changed successfully. Your account is secure.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(res.message || 'Failed to update password.');
      }
    } catch {
      toast.error('Error updating password. Please try again.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="container max-w-5xl py-8 space-y-8 animate-in fade-in-50 duration-300">
      {/* Hidden File Input for Avatar */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />

      {/* Avatar Management Modal */}
      <Dialog open={isAvatarModalOpen} onOpenChange={setIsAvatarModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Profile Picture</DialogTitle>
            <DialogDescription>
              Upload a clear photo for your devotee profile or reset to default initials.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-6 gap-4">
            <div className="p-1 rounded-full bg-gradient-to-tr from-brand-maroon via-brand-saffron to-brand-gold shadow-md">
              <Avatar className="w-28 h-28 border-2 border-background">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={fullName} className="object-cover" />
                ) : null}
                <AvatarFallback className="bg-brand-ivory text-brand-maroon font-serif text-3xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <p className="text-xs text-muted-foreground">Supported formats: JPG, PNG, WEBP (Max 5MB)</p>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
            {avatarUrl ? (
              <Button
                type="button"
                variant="destructive"
                onClick={handleRemoveAvatar}
                className="w-full sm:w-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove Photo
              </Button>
            ) : <div />}

            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAvatarModalOpen(false)}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-brand-saffron hover:bg-brand-saffron-dark text-white flex-1 sm:flex-none"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload New Photo
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Top Header & Quick Links */}
      <PageHeader
        title="Devotee Profile"
        description="Manage your personal details, verified contacts, and security settings."
        badgeText="Vedic Heritage"
      >
        <Link to="/addresses" className="w-full sm:w-auto">
          <Button variant="outline" className="border-border hover:border-brand-saffron hover:bg-brand-saffron/5 w-full sm:w-auto h-9 text-xs">
            <MapPin className="w-4 h-4 mr-2 text-brand-saffron" />
            Manage Addresses
          </Button>
        </Link>
        <Link to="/bookings" className="w-full sm:w-auto">
          <Button className="bg-brand-saffron hover:bg-brand-saffron-dark text-white shadow-sm w-full sm:w-auto h-9 text-xs">
            <BookOpen className="w-4 h-4 mr-2" />
            Ceremony Bookings
          </Button>
        </Link>
      </PageHeader>

      {/* Hero Devotee Card */}
      <div className="relative overflow-hidden rounded-2xl border bg-card p-5 sm:p-6 md:p-8 shadow-sm">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-brand-saffron/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-16 w-48 h-48 rounded-full bg-brand-gold/10 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-center md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-5 w-full sm:w-auto text-center sm:text-left">
            {/* Clickable Avatar to Change Photo */}
            <div className="relative group shrink-0">
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="relative block p-1 rounded-full bg-gradient-to-tr from-brand-maroon via-brand-saffron to-brand-gold shadow-md focus:outline-none focus:ring-2 focus:ring-brand-saffron focus:ring-offset-2 transition-transform hover:scale-105"
                title="Click to change profile picture"
              >
                <Avatar className="w-24 h-24 sm:w-20 sm:h-20 border-2 border-background">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt={fullName} className="object-cover" />
                  ) : null}
                  <AvatarFallback className="bg-brand-ivory text-brand-maroon font-serif text-2xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                {/* Camera Overlay on Hover */}
                <div className="absolute inset-1 rounded-full bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                  <Camera className="w-5 h-5 mb-0.5" />
                  <span className="text-[9px] font-medium tracking-wide uppercase">Edit</span>
                </div>
              </button>

              <div className="absolute bottom-0 right-0 bg-emerald-500 text-white rounded-full p-1 border-2 border-background shadow-sm pointer-events-none" title="Active Devotee">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Devotee Info */}
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-foreground">{fullName}</h2>
                <Badge className="bg-brand-maroon text-white hover:bg-brand-maroon/90 text-xs">
                  Devotee
                </Badge>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 text-xs">
                  Active
                </Badge>
              </div>

              {/* Verified Contact Badges */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-xs text-muted-foreground pt-1">
                <div className="flex items-center gap-1.5 bg-muted/60 px-2.5 py-1 rounded-md" title="Verified Mobile">
                  <Phone className="w-3.5 h-3.5 text-brand-saffron" />
                  <span className="font-mono font-medium text-foreground">{phoneNumber}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ml-0.5" />
                </div>

                <div className="flex items-center gap-1.5 bg-muted/60 px-2.5 py-1 rounded-md" title="Verified Email">
                  <Mail className="w-3.5 h-3.5 text-brand-saffron" />
                  <span className="text-foreground">{email}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ml-0.5" />
                </div>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-muted-foreground pt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  Member since {memberSince}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="border-border hover:border-brand-saffron hover:bg-brand-saffron/5 w-full sm:w-auto h-9 text-xs"
              >
                <Edit3 className="w-4 h-4 mr-1.5 text-brand-saffron" />
                Edit Profile
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                className="text-muted-foreground hover:text-foreground w-full sm:w-auto h-9 text-xs"
              >
                <X className="w-4 h-4 mr-1.5" />
                Cancel
              </Button>
            )}
          </div>
        </div>

        {/* Devotee Quick Stats Row */}
        <Separator className="my-5" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 flex flex-col justify-center">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
              Ceremonies Booked
            </span>
            <span className="text-2xl font-bold font-serif text-brand-saffron mt-0.5">
              {bookingCount}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 flex flex-col justify-center">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand-saffron" />
              Saved Addresses
            </span>
            <span className="text-2xl font-bold font-serif text-foreground mt-0.5">
              {addressCount}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 flex flex-col justify-center">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Account Status
            </span>
            <span className="text-base font-semibold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              Active & Verified
            </span>
          </div>
        </div>
      </div>

      {/* Main Tabs Section */}
      <Tabs defaultValue="personal" className="w-full space-y-6">
        <TabsList className="grid grid-cols-2 w-full sm:max-w-sm bg-muted/80 p-1 border">
          <TabsTrigger value="personal" className="text-xs sm:text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
            <User className="w-4 h-4 mr-1.5 hidden sm:inline-block text-brand-saffron" />
            Personal Details
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs sm:text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
            <KeyRound className="w-4 h-4 mr-1.5 hidden sm:inline-block text-brand-maroon" />
            Security & Passwords
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Personal Details */}
        <TabsContent value="personal" className="space-y-6 focus-visible:outline-none">
          <Card className="border shadow-sm">
            <CardHeader className="p-4 sm:p-6 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-lg sm:text-xl font-serif">Personal Information</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Your primary profile details used during ritual bookings and priest communication.
                  </CardDescription>
                </div>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="border-brand-saffron/40 hover:border-brand-saffron text-brand-saffron hover:bg-brand-saffron/10 w-full sm:w-auto h-9 text-xs shrink-0"
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name (Editable) */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Full Name {isEditing && <span className="text-brand-saffron">*</span>}
                    </Label>
                    {isEditing ? (
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Aditi Sharma"
                        className="focus-visible:ring-brand-saffron"
                        required
                      />
                    ) : (
                      <div className="p-3 bg-muted/30 rounded-lg border border-border/50 text-sm font-medium text-foreground flex items-center justify-between">
                        <span>{fullName}</span>
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Email Address (Read-Only) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Email Address
                      </Label>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3" /> Verified
                      </span>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg border border-border/50 text-sm text-muted-foreground flex items-center justify-between cursor-not-allowed">
                      <span>{email}</span>
                      <Lock className="w-4 h-4 text-muted-foreground/70" />
                    </div>
                    {isEditing && (
                      <p className="text-[11px] text-muted-foreground">
                        Email address is verified and cannot be modified.
                      </p>
                    )}
                  </div>

                  {/* Phone Number (Read-Only) */}
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Mobile Number
                      </Label>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3" /> Primary OTP Verified
                      </span>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg border border-border/50 text-sm font-mono text-muted-foreground flex items-center justify-between cursor-not-allowed">
                      <span>{phoneNumber}</span>
                      <Lock className="w-4 h-4 text-muted-foreground/70" />
                    </div>
                    {isEditing && (
                      <p className="text-[11px] text-muted-foreground">
                        Mobile number is linked to your OTP authentication and cannot be modified.
                      </p>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={handleCancelEdit} className="w-full sm:w-auto h-9 text-xs">
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSavingProfile}
                      className="bg-brand-saffron hover:bg-brand-saffron-dark text-white w-full sm:w-auto h-9 text-xs"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSavingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Security & Passwords */}
        <TabsContent value="security" className="space-y-6 focus-visible:outline-none">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-serif">Security & Password</CardTitle>
              <CardDescription>
                Update your account password and review device authentication status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-xl">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type="password"
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="pr-10 focus-visible:ring-brand-saffron"
                        required
                      />
                      <Lock className="w-4 h-4 absolute right-3 top-3 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pr-10 focus-visible:ring-brand-saffron"
                        required
                      />
                      <KeyRound className="w-4 h-4 absolute right-3 top-3 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Must be at least 8 characters long with a combination of letters, numbers, and special characters.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pr-10 focus-visible:ring-brand-saffron"
                        required
                      />
                      <Lock className="w-4 h-4 absolute right-3 top-3 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted/40 rounded-xl border space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Account Security Protection
                  </div>
                  <p>
                    All passwords are encrypted with high-grade security protocols. You will remain logged in on this browser after updating your password.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="bg-brand-saffron hover:bg-brand-saffron-dark text-white w-full sm:w-auto h-9 text-xs"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {isUpdatingPassword ? 'Updating Password...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <Link to="/addresses" className="group">
          <Card className="border hover:border-brand-saffron/60 transition-all shadow-sm hover:shadow-md bg-card">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-brand-saffron/10 text-brand-saffron group-hover:scale-105 transition-transform">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold font-serif text-base text-foreground group-hover:text-brand-saffron transition-colors">
                    Manage Puja Locations
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {addressCount} saved location{addressCount !== 1 ? 's' : ''} for home and temple ceremonies
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-brand-saffron group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Card>
        </Link>

        <Link to="/bookings" className="group">
          <Card className="border hover:border-brand-saffron/60 transition-all shadow-sm hover:shadow-md bg-card">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-brand-maroon/10 text-brand-maroon group-hover:scale-105 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold font-serif text-base text-foreground group-hover:text-brand-maroon transition-colors">
                    Ceremony Bookings & History
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {bookingCount} past & upcoming Vedic ritual{bookingCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-brand-maroon group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default ProfilePage;
