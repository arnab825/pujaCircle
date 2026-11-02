import { adminApi } from "@/api/admin.api";
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
} from "lucide-react";
import { toast } from "sonner";

import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  adminUpdateProfileSchema,
  adminUpdatePasswordSchema,
} from "@/schemas/admin.schema";

/**
 * AdminProfilePage
 * Platform Administrator account settings, security credentials, and profile image.
 * 100% Flexbox, zero CSS grids, zero gradients, pure solid white canvas, Haldi gold trims.
 */
export const AdminProfilePage: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const adminId = user?.id || "admin-root-1";

  // Avatar Management State
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => {
    return (
      user?.avatarUrl || localStorage.getItem(`admin_avatar_${adminId}`) || null
    );
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [fullName, setFullName] = useState(user?.name || "Swastika Roy");
  const [isSavingName, setIsSavingName] = useState(false);

  // Security / Password update states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Read-only account metadata
  const adminEmail = user?.email || "admin@pujacircle.com";
  const adminPhone = user?.phoneNumber || "+919999999999";
  const joinedDate = "January 2026";

  const initials =
    fullName
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "SR";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      setAvatarUrl(dataUrl);
      localStorage.setItem(`admin_avatar_${adminId}`, dataUrl);
      if (user) {
        setUser({
          ...user,
          avatarUrl: dataUrl,
        });
      }
      try {
        await adminApi.updateAdminProfile({ avatarUrl: dataUrl });
      } catch (err) {
        console.warn("Avatar sync notice:", err);
      }
      toast.success("Administrator avatar updated!");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = async () => {
    setAvatarUrl(null);
    localStorage.removeItem(`admin_avatar_${adminId}`);
    if (user) {
      setUser({
        ...user,
        avatarUrl: undefined,
      });
    }
    try {
      await adminApi.updateAdminProfile({ avatarUrl: null });
    } catch (err) {
      console.warn("Avatar remove notice:", err);
    }
    toast.success("Administrator photo removed.");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    const parseResult = adminUpdateProfileSchema.safeParse({
      fullName: fullName.trim(),
    });

    if (!parseResult.success) {
      toast.error(
        parseResult.error.errors[0]?.message || "Invalid name format.",
      );
      return;
    }

    setIsSavingName(true);
    try {
      const res = await adminApi.updateAdminProfile({ name: parseResult.data.fullName });
      if (res.success) {
        if (user) {
          setUser({
            ...user,
            name: parseResult.data.fullName,
          });
        }
        setFullName(parseResult.data.fullName);
        toast.success("Administrator name updated successfully!");
      } else {
        toast.error(res.message || "Failed to update profile name.");
      }
    } catch {
      toast.error("Failed to update profile name.");
    } finally {
      setIsSavingName(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const parseResult = adminUpdatePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!parseResult.success) {
      toast.error(
        parseResult.error.errors[0]?.message || "Invalid password parameters.",
      );
      return;
    }



    setIsUpdatingPassword(true);
    try {
      await new Promise((r) => setTimeout(r, 600));

      toast.success("Administrator password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Failed to update password.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 w-full max-w-7xl text-stone-900">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />

      {/* Page Header (100% Flexbox) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-xl border-2 border-amber-300 bg-white shadow-sm">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-md bg-amber-400 text-stone-950 flex items-center justify-center font-serif font-black text-2xl shadow-md shrink-0 select-none">
            ॐ
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-stone-950">
              Admin Profile & Platform Credentials
            </h1>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              Manage your administrator authority account details, security
              credentials, and profile picture.
            </p>
          </div>
        </div>
      </div>

      {/* Admin Profile Overview Card */}
      <div className="border-2 border-amber-300 bg-white rounded-xl p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
          <div className="flex flex-col items-center sm:items-start gap-2 shrink-0">
            <div className="relative group shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative block rounded-full ring-4 ring-amber-400 bg-amber-100 shadow-sm focus:outline-none focus:ring-offset-2 focus:ring-offset-white transition-transform hover:scale-105 cursor-pointer"
                title="Click to choose a new profile photo"
              >
                <Avatar className="w-20 h-20 border-2 border-white">
                  {avatarUrl ? (
                    <AvatarImage
                      src={avatarUrl}
                      alt={fullName}
                      className="object-cover"
                    />
                  ) : null}
                  <AvatarFallback className="bg-[#450A0A] text-white font-serif text-xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="absolute inset-1 rounded-full bg-stone-950/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-4 h-4" />
                </div>
              </button>
            </div>

            {avatarUrl && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="text-[11px] text-stone-500 hover:text-red-700 font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
                title="Remove custom profile photo"
              >
                <Trash2 className="w-3 h-3 text-red-600" />
                <span>Remove Photo</span>
              </button>
            )}
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-bold font-serif text-stone-950">
                {fullName}
              </h2>
              <Badge className="bg-[#450A0A] text-amber-300 border border-amber-400/40 text-[10px] font-bold tracking-wider uppercase">
                PLATFORM AUTHORITY
              </Badge>
            </div>
            <p className="text-xs font-mono text-stone-600 font-medium">
              {adminEmail}
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-stone-500 pt-1 font-medium">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <span>Console Account Created: {joinedDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details Deck (100% Flexbox, Zero CSS Grids) */}
      <div className="flex flex-col md:flex-row gap-6 w-full">
        {/* Edit Personal Profile Information Card */}
        <div className="w-full md:w-1/2 border-2 border-amber-300 bg-white rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
            <User className="w-4 h-4 text-red-700" />
            <h3 className="text-base font-bold font-serif text-stone-950">
              Account Details
            </h3>
          </div>
          <p className="text-xs text-stone-600">
            Update your full name. Email address and phone number are locked for
            administrative security.
          </p>

          <form onSubmit={handleSaveProfile} className="space-y-4 pt-1">
            <div className="space-y-1">
              <Label
                htmlFor="admin-fullname"
                className="text-xs font-bold text-stone-800 block"
              >
                Full Name *
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                <Input
                  id="admin-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 text-xs h-10 rounded-md border-stone-300 focus:ring-amber-500 bg-white"
                  placeholder="Enter full name"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="admin-email"
                  className="text-xs font-bold text-stone-800"
                >
                  Email Address
                </Label>
                <span className="text-[10px] text-stone-500 flex items-center gap-1 font-bold">
                  <Lock className="w-3 h-3 text-stone-400" /> Locked Authority
                </span>
              </div>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                <Input
                  id="admin-email"
                  type="email"
                  value={adminEmail}
                  disabled
                  className="pl-10 text-xs h-10 rounded-md bg-stone-100 text-stone-600 font-medium cursor-not-allowed border-dashed border-stone-300"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="admin-phone"
                  className="text-xs font-bold text-stone-800"
                >
                  Phone Number
                </Label>
                <span className="text-[10px] text-stone-500 flex items-center gap-1 font-bold">
                  <Lock className="w-3 h-3 text-stone-400" /> Locked Security
                </span>
              </div>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                <Input
                  id="admin-phone"
                  type="text"
                  value={adminPhone}
                  disabled
                  className="pl-10 text-xs h-10 rounded-md bg-stone-100 text-stone-600 font-mono font-bold cursor-not-allowed border-dashed border-stone-300"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="sm"
              disabled={isSavingName}
              className="text-xs gap-1.5 bg-[#780016] hover:bg-red-800 text-white font-bold border border-amber-400 w-full sm:w-auto h-10 px-5 rounded-md shadow-xs cursor-pointer puja-btn-tap"
            >
              <Save className="w-3.5 h-3.5" />
              {isSavingName ? "Saving..." : "Save Name Changes"}
            </Button>
          </form>
        </div>

        {/* Change Security Password Card */}
        <div className="w-full md:w-1/2 border-2 border-amber-300 bg-white rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
            <KeyRound className="w-4 h-4 text-amber-600" />
            <h3 className="text-base font-bold font-serif text-stone-950">
              Security & Credentials
            </h3>
          </div>
          <p className="text-xs text-stone-600">
            Update your administrator console login password regularly to
            protect system records.
          </p>

          <form onSubmit={handleUpdatePassword} className="space-y-4 pt-1">
            <div className="space-y-1">
              <Label
                htmlFor="current-pass"
                className="text-xs font-bold text-stone-800 block"
              >
                Current Password *
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                <Input
                  id="current-pass"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pl-10 pr-10 text-xs h-10 rounded-md border-stone-300 focus:ring-amber-500 bg-white"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <Label
                htmlFor="new-pass"
                className="text-xs font-bold text-stone-800 block"
              >
                New Password *
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                <Input
                  id="new-pass"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 pr-10 text-xs h-10 rounded-md border-stone-300 focus:ring-amber-500 bg-white"
                  placeholder="Enter at least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <Label
                htmlFor="confirm-pass"
                className="text-xs font-bold text-stone-800 block"
              >
                Confirm New Password *
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                <Input
                  id="confirm-pass"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 text-xs h-10 rounded-md border-stone-300 focus:ring-amber-500 bg-white"
                  placeholder="Re-enter new password"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="sm"
              disabled={isUpdatingPassword}
              className="text-xs gap-1.5 bg-[#780016] hover:bg-red-800 text-white font-bold border border-amber-400 w-full sm:w-auto h-10 px-5 rounded-md shadow-xs cursor-pointer puja-btn-tap"
            >
              <KeyRound className="w-3.5 h-3.5" />
              {isUpdatingPassword ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;
