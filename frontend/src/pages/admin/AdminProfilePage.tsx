import React, { useState, useRef } from "react";
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
  Camera,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  adminUpdateProfileSchema,
  adminUpdatePasswordSchema,
} from "@/schemas/admin.schema";

const AdminProfilePage: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const adminId = user?.id || "admin-root-1";

  // Avatar Management State
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => {
    return (
      user?.avatarUrl || localStorage.getItem(`admin_avatar_${adminId}`) || null
    );
  });
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [fullName, setFullName] = useState(user?.name || "PujaCircle Admin");
  const [isSavingName, setIsSavingName] = useState(false);

  // Security / Password update states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Read-only account metadata
  const adminEmail = user?.email || "admin@pujacircle.demo";
  const adminPhone = user?.phoneNumber || "+919900011223";
  const joinedDate = "January 2026";

  // Helper for 2-letter initials
  const initials =
    fullName
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "AD";

  // Handler: Upload new profile photo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setAvatarUrl(dataUrl);
      localStorage.setItem(`admin_avatar_${adminId}`, dataUrl);
      if (user) {
        setUser({
          ...user,
          avatarUrl: dataUrl,
        });
      }
      setIsAvatarModalOpen(false);
      toast.success("Profile picture updated successfully!");
    };
    reader.readAsDataURL(file);
  };

  // Handler: Remove profile photo
  const handleRemoveAvatar = () => {
    setAvatarUrl(null);
    localStorage.removeItem(`admin_avatar_${adminId}`);
    if (user) {
      setUser({
        ...user,
        avatarUrl: undefined,
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setIsAvatarModalOpen(false);
    toast.success("Profile picture removed");
  };

  // Handle Save Name
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const result = adminUpdateProfileSchema.safeParse({
      fullName: fullName.trim(),
    });
    if (!result.success) {
      toast.error(
        result.error.errors[0]?.message || "Invalid administrator name format.",
      );
      return;
    }

    setIsSavingName(true);

    setTimeout(() => {
      if (user) {
        setUser({
          ...user,
          name: result.data.fullName,
          avatarUrl: avatarUrl || undefined,
        });
      }
      toast.success("Admin profile name updated successfully!");
      setIsSavingName(false);
    }, 400);
  };

  // Handle Update Password
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();

    const result = adminUpdatePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!result.success) {
      toast.error(
        result.error.errors[0]?.message || "Invalid password format.",
      );
      return;
    }

    setIsUpdatingPassword(true);

    setTimeout(() => {
      toast.success("Admin password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsUpdatingPassword(false);
    }, 500);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      {/* Hidden File Input for Image Upload */}
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
            <DialogTitle className="font-serif text-lg">
              Profile Picture
            </DialogTitle>
            <DialogDescription className="text-xs">
              Upload a photo for your admin profile or reset to default initials.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-5 gap-3">
            <Avatar className="w-24 h-24 border border-border shadow-xs">
              {avatarUrl ? (
                <AvatarImage
                  src={avatarUrl}
                  alt={fullName}
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="bg-muted text-foreground text-2xl font-bold font-serif">
                {initials}
              </AvatarFallback>
            </Avatar>
            <p className="text-[11px] text-muted-foreground">
              Supported formats: JPG, PNG, WEBP (Max 5MB)
            </p>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
            {avatarUrl ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemoveAvatar}
                className="w-full sm:w-auto text-xs"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Remove Photo
              </Button>
            ) : (
              <div />
            )}

            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAvatarModalOpen(false)}
                className="flex-1 sm:flex-none text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1 sm:flex-none text-xs gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Photo
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Page Header */}
      <div className="border-b pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
          Admin Profile & Settings
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Manage your administrator account details, security credentials, and profile picture.
        </p>
      </div>

      {/* Admin Profile Overview Card */}
      <Card className="shadow-xs border border-border/80 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
            {/* Clickable Avatar with Camera Badge */}
            <div className="relative group shrink-0">
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="relative block rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-transform hover:scale-105 cursor-pointer"
                title="Click to change profile picture"
              >
                <Avatar className="w-20 h-20 sm:w-18 sm:h-18 border border-border shadow-xs">
                  {avatarUrl ? (
                    <AvatarImage
                      src={avatarUrl}
                      alt={fullName}
                      className="object-cover"
                    />
                  ) : null}
                  <AvatarFallback className="bg-muted text-foreground font-serif text-xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                {/* Camera Badge */}
                <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground p-1.5 rounded-full shadow-xs border-2 border-background group-hover:bg-primary/90 transition-colors">
                  <Camera className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>

            <div className="space-y-1 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl font-bold text-foreground">
                  {fullName}
                </h2>
                <Badge
                  variant="secondary"
                  className="text-[10px] uppercase font-bold tracking-wide"
                >
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
        <Card className="shadow-xs border border-border/80">
          <CardHeader className="py-4 px-6 border-b bg-muted/20">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Account Details
            </CardTitle>
            <CardDescription className="text-xs">
              Update your full name. Email address and phone number are locked
              for administrative security.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Full Name Field (Editable) */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="admin-fullname"
                  className="text-xs font-semibold"
                >
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
                  <Label
                    htmlFor="admin-email"
                    className="text-xs font-semibold"
                  >
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
                  <Label
                    htmlFor="admin-phone"
                    className="text-xs font-semibold"
                  >
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
                  className="text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto h-9 font-medium justify-center"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSavingName ? "Saving..." : "Save Name Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Change Security Password Card */}
        <Card className="shadow-xs border border-border/80">
          <CardHeader className="py-4 px-6 border-b bg-muted/20">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-primary" />
              Security & Password
            </CardTitle>
            <CardDescription className="text-xs">
              Update your administrator login password regularly to protect
              system data.
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
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="pl-9 pr-9 text-xs h-9 bg-card"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
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
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-9 pr-9 text-xs h-9 bg-card"
                    placeholder="Enter at least 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
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
                  className="text-xs gap-1.5 shadow-xs w-full sm:w-auto h-9 font-medium justify-center cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  {isUpdatingPassword ? "Updating..." : "Update Password"}
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
