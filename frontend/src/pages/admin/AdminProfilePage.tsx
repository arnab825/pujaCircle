import { adminApi } from "@/api/admin.api";
import React, { useState, useRef, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Save,
  Camera,
  Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { adminUpdateProfileSchema } from "@/schemas/admin.schema";
import { ChangePasswordCard } from "@/components/common/ChangePasswordCard";

/**
 * ============================================================================
 * [PAGE: ADMIN PROFILE]
 * Platform Administrator account settings, profile image, and security credentials.
 * 100% Flexbox, zero CSS grids, pure solid white canvas, Haldi gold trims.
 * ============================================================================
 */
export const AdminProfilePage: React.FC = () => {
  const { user, setUser } = useAuthStore();

  // Avatar Management State
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarUrl || null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.avatarUrl) {
      setAvatarUrl(user.avatarUrl);
    }
  }, [user?.avatarUrl]);

  // Form states
  const [fullName, setFullName] = useState(user?.name || "Swastika Roy");
  const [isSavingName, setIsSavingName] = useState(false);

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
      setIsUploadingAvatar(true);

      try {
        const res = await adminApi.updateAdminProfile({ avatarUrl: dataUrl });
        const finalUrl = res?.data?.avatarUrl || dataUrl;
        setAvatarUrl(finalUrl);
        if (user) {
          setUser({
            ...user,
            avatarUrl: finalUrl,
          });
        }
        toast.success("Administrator avatar synced with Cloudinary successfully!");
      } catch (err) {
        console.warn("Avatar sync notice:", err);
        toast.error("Failed to sync administrator avatar with cloud storage.");
      } finally {
        setIsUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = async () => {
    setIsUploadingAvatar(true);
    try {
      await adminApi.updateAdminProfile({ avatarUrl: null });
      setAvatarUrl(null);
      if (user) {
        setUser({
          ...user,
          avatarUrl: undefined,
        });
      }
      toast.success("Administrator profile picture removed.");
    } catch {
      toast.error("Failed to remove profile picture.");
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();

    const parseResult = adminUpdateProfileSchema.safeParse({ fullName });
    if (!parseResult.success) {
      toast.error(
        parseResult.error.errors[0]?.message || "Invalid name provided."
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-7 rounded-xl border-2 border-amber-300 bg-white shadow-sm">
        <div className="flex items-start gap-3 sm:gap-4 min-w-0">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-amber-400 text-stone-950 flex items-center justify-center font-serif font-black text-xl sm:text-2xl shadow-md shrink-0 select-none">
            ॐ
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-3xl font-extrabold font-serif text-stone-950 wrap-break-word">
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
      <div className="border-2 border-amber-300 bg-white rounded-xl p-4 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5">
          <div className="flex flex-col items-center sm:items-start gap-2 shrink-0">
            <div className="relative group shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                aria-label="Upload administrator avatar"
                className="relative cursor-pointer rounded-full overflow-hidden block focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-2 border-amber-400 shadow-md">
                  {avatarUrl ? (
                    <AvatarImage
                      src={avatarUrl}
                      alt={fullName}
                      className="object-cover"
                    />
                  ) : null}
                  <AvatarFallback className="bg-[#780016] text-white font-serif font-bold text-2xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-stone-950/40 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-5 h-5 mb-0.5" />
                  <span className="text-[9px] font-semibold">Change</span>
                </div>
              </button>
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-white/70 rounded-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-[#780016] animate-spin" />
                </div>
              )}
            </div>

            {avatarUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveAvatar}
                disabled={isUploadingAvatar}
                className="text-[10px] h-7 px-2 text-red-700 border-red-200 hover:bg-red-50 hover:text-red-800"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Remove
              </Button>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h2 className="text-lg sm:text-xl font-bold font-serif text-stone-900 truncate">
                {fullName}
              </h2>
              <Badge className="bg-amber-100 text-amber-900 border border-amber-300 font-semibold text-[10px] px-2 py-0.5">
                Super Administrator
              </Badge>
              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] px-2 py-0.5">
                Full RBAC Access
              </Badge>
            </div>
            <p className="text-xs text-stone-600 mb-3 truncate">
              {adminEmail}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-stone-600">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-600" />
                <span>{adminEmail}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-600" />
                <span>{adminPhone}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>Registered: {joinedDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Sections */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Personal Name Settings Card */}
        <div className="w-full md:w-1/2 border-2 border-amber-300 bg-white rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
            <User className="w-4 h-4 text-amber-600 shrink-0" />
            <h3 className="text-base font-bold font-serif text-stone-950">
              Administrator Identity
            </h3>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Update your public administrative signature shown on audit notes and
            system operations.
          </p>

          <form onSubmit={handleSaveName} className="space-y-4 pt-1">
            <div className="space-y-1">
              <Label
                htmlFor="admin-name"
                className="text-xs font-bold text-stone-800 block"
              >
                Full Name *
              </Label>
              <Input
                id="admin-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="text-xs h-10 rounded-md border-stone-300 focus:ring-amber-500 bg-white"
                placeholder="e.g. Swastika Roy"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-stone-800 block">
                Primary Email
              </Label>
              <Input
                type="email"
                value={adminEmail}
                disabled
                className="text-xs h-10 rounded-md bg-stone-100 border-stone-200 text-stone-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-stone-500">
                Primary system email cannot be edited from this console.
              </span>
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

        {/* Change Security Password Card (Shared DRY Component) */}
        <div className="w-full md:w-1/2">
          <ChangePasswordCard
            title="Security & Credentials"
            description="Update your administrator console login password regularly to protect system records."
            buttonLabel="Update Admin Password"
            onUpdatePassword={async ({ currentPassword, newPassword, confirmPassword }) => {
              return adminApi.updateAdminPassword({
                currentPassword,
                newPassword,
                confirmPassword,
              });
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;
