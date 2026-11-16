import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { userApi } from "@/api/user.api";
import { addressApi } from "@/api/address.api";
import { bookingApi } from "@/api/booking.api";
import { updateUserProfileSchema } from "@/schemas/user.schema";
import { ChangePasswordCard } from "@/components/common/ChangePasswordCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Phone,
  Mail,
  CheckCircle2,
  MapPin,
  Calendar,
  Save,
  ChevronRight,
  BookOpen,
  Camera,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { formatDisplayPhone } from "@/lib/utils";

/**
 * ============================================================================
 * [PAGE: DEVOTEE PROFILE]
 * Devotee spiritual profile, verified contacts, and security credentials.
 * 100% Flexbox, pure solid white canvas, radiant Haldi gold trims, deep vermilion accents.
 * ============================================================================
 */
export const ProfilePage: React.FC = () => {
  const { user, setUser } = useAuthStore();

  const devoteeId = user?.id || "user-devotee-1";

  const [addressCount, setAddressCount] = useState<number>(0);
  const [bookingCount, setBookingCount] = useState<number>(0);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState<string>(user?.name || "Devotee");
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);

  const email = user?.email || "devotee@pujacircle.com";
  const phoneNumber = formatDisplayPhone(user?.phoneNumber) || "+91 98765 43210";

  useEffect(() => {
    if (user?.name) {
      setFullName(user.name);
    }
    if (user?.avatarUrl) {
      setAvatarUrl(user.avatarUrl);
    }
  }, [user]);

  useEffect(() => {
    async function loadDevoteeStats() {
      try {
        const [addrList, bookList] = await Promise.all([
          addressApi.getAddresses(devoteeId),
          bookingApi.getBookings(devoteeId),
        ]);
        setAddressCount(addrList ? addrList.length : 0);
        setBookingCount(bookList ? bookList.length : 0);
      } catch {
        setAddressCount(0);
        setBookingCount(0);
      }
    }

    loadDevoteeStats();
  }, [devoteeId]);

  const initials =
    fullName
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "DV";

  const memberSince = (user as any)?.createdAt
    ? new Date((user as any).createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "January 2026";

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
      if (user) {
        setUser({ ...user, avatarUrl: dataUrl });
      }
      try {
        const res = await userApi.updateProfile(devoteeId, { avatarUrl: dataUrl });
        const finalUrl = res?.data?.avatarUrl || dataUrl;
        setAvatarUrl(finalUrl);
        if (user) {
          setUser({ ...user, avatarUrl: finalUrl });
        }
        toast.success("Sacred profile photo updated successfully!");
      } catch (err) {
        console.warn("Devotee avatar sync notice:", err);
        toast.error("Failed to update profile photo.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = async () => {
    setAvatarUrl(null);
    if (user) {
      setUser({ ...user, avatarUrl: undefined });
    }
    try {
      await userApi.updateProfile(devoteeId, { avatarUrl: "" });
    } catch (err) {
      console.warn("Devotee avatar remove notice:", err);
    }
    toast.success("Profile picture removed successfully.");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    const parseResult = updateUserProfileSchema.safeParse({
      fullName: fullName.trim(),
      email: email.trim(),
    });

    if (!parseResult.success) {
      toast.error(
        parseResult.error.errors[0]?.message || "Invalid profile information.",
      );
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await userApi.updateProfile(devoteeId, { name: parseResult.data.fullName });

      if (res.success && res.data) {
        setUser({
          ...user!,
          name: res.data.name,
        });
        toast.success("Your profile name has been updated successfully!");
      } else {
        toast.error(res.message || "Failed to update profile.");
      }
    } catch {
      toast.error("An error occurred while updating profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="w-full text-stone-900 py-6 sm:py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Hidden File Input for Avatar */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
        />

        {/* Top Header & Quick Links (100% Flexbox Responsive) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 p-5 sm:p-7 rounded-xl border-2 border-amber-300 bg-white shadow-sm">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold">
              <span className="text-sm font-serif font-black leading-none">
                ॐ
              </span>
              <span>Devotee Sanctuary Profile</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-stone-950">
              Devotee Settings
            </h1>
            <p className="text-xs sm:text-sm text-stone-600">
              Manage your personal information, verified communication channels,
              and security credentials.
            </p>
          </div>

          {/* Quick Action Navigation Links - Fully Responsive */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto shrink-0">
            <Link to="/user/addresses" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto border-stone-300 hover:border-amber-400 hover:bg-amber-50 h-11 px-4 text-xs font-bold rounded-md shadow-2xs transition-all flex items-center justify-center cursor-pointer"
              >
                <MapPin className="w-4 h-4 mr-1.5 text-amber-600" />
                <span>Manage Addresses</span>
              </Button>
            </Link>
            <Link to="/user/bookings" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-[#780016] hover:bg-red-800 text-white border border-amber-400 h-11 px-4 text-xs font-bold rounded-md shadow-xs transition-all flex items-center justify-center cursor-pointer">
                <BookOpen className="w-4 h-4 mr-1.5 text-amber-300" />
                <span>Puja Bookings</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero User Profile Card (Pure White, Zero Gradients, Zero Blurs) */}
        <div className="rounded-xl border-2 border-amber-300 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 w-full">
            {/* Clickable Avatar to Change Photo */}
            <div className="flex flex-col items-center sm:items-start gap-2 shrink-0">
              <div className="relative group shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative block p-1 rounded-full ring-4 ring-amber-400 bg-amber-100 shadow-sm focus:outline-none focus:ring-offset-2 focus:ring-offset-white transition-transform hover:scale-105 cursor-pointer"
                  title="Click to choose a new profile photo"
                >
                  <Avatar className="w-24 h-24 sm:w-20 sm:h-20 border-2 border-white">
                    {avatarUrl ? (
                      <AvatarImage
                        src={avatarUrl}
                        alt={fullName}
                        className="object-cover"
                      />
                    ) : null}
                    <AvatarFallback className="bg-[#780016] text-white font-serif text-2xl font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  {/* Camera Overlay on Hover */}
                  <div className="absolute inset-1 rounded-full bg-stone-950/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-5 h-5 mb-0.5" />
                    <span className="text-[9px] font-bold tracking-wide uppercase">
                      Change
                    </span>
                  </div>
                </button>

                <div
                  className="absolute bottom-0 right-0 bg-emerald-600 text-white rounded-full p-1 border-2 border-white shadow-xs pointer-events-none"
                  title="Active Devotee"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
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

            {/* User Meta Information */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-950">
                  {fullName}
                </h2>
                <Badge className="bg-amber-100 text-amber-900 border border-amber-300 font-semibold text-xs px-2.5 py-0.5">
                  Verified Devotee
                </Badge>
              </div>

              <p className="text-xs text-stone-600">
                Registered platform user with access to Vedic purohits across
                Bengal.
              </p>

              {/* Status Chips Row */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 pt-1 text-xs text-stone-600">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-700" />
                  <span>{email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-700" />
                  <span>{phoneNumber}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-700" />
                  <span>Member since {memberSince}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Profile & Security Sections */}
        <Tabs defaultValue="general" className="w-full space-y-6">
          <TabsList className="bg-amber-100/60 p-1 rounded-lg border border-amber-300 w-full sm:w-auto inline-flex">
            <TabsTrigger
              value="general"
              className="text-xs font-bold py-2 px-4 rounded-md data-[state=active]:bg-white data-[state=active]:text-[#780016] data-[state=active]:shadow-xs text-stone-700 cursor-pointer"
            >
              General Information
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="text-xs font-bold py-2 px-4 rounded-md data-[state=active]:bg-white data-[state=active]:text-[#780016] data-[state=active]:shadow-xs text-stone-700 cursor-pointer"
            >
              Security & Credentials
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: General Profile Details */}
          <TabsContent value="general" className="space-y-6">
            <div className="border-2 border-amber-300 bg-white rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
                  Personal Information
                </h3>
                <p className="text-xs text-stone-600">
                  Update your contact signature for ceremony arrangements and
                  communication.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5 max-w-xl">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="fullName"
                      className="text-xs font-bold text-stone-800"
                    >
                      Full Name
                    </Label>
                    <div className="relative">
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your full name"
                        className="pl-3.5 h-10 rounded-md border-stone-300 focus:ring-amber-500 bg-white text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="email"
                      className="text-xs font-bold text-stone-800"
                    >
                      Email Address
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        disabled
                        className="pl-3.5 h-10 rounded-md border-stone-200 bg-stone-100 text-stone-500 text-xs cursor-not-allowed"
                      />
                    </div>
                    <p className="text-[11px] text-stone-500">
                      Primary email address is verified and permanently linked to
                      your account.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="phone"
                      className="text-xs font-bold text-stone-800"
                    >
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Input
                        id="phone"
                        type="text"
                        value={phoneNumber}
                        disabled
                        className="pl-3.5 h-10 rounded-md border-stone-200 bg-stone-100 text-stone-500 text-xs cursor-not-allowed"
                      />
                    </div>
                    <p className="text-[11px] text-stone-500">
                      Primary phone is used for OTP verifications and ritual
                      updates.
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSavingProfile}
                  className="bg-[#780016] hover:bg-red-800 text-white font-bold border border-amber-400 w-full sm:w-auto h-11 px-6 text-xs rounded-md shadow-xs cursor-pointer puja-btn-tap"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSavingProfile ? "Saving Changes..." : "Save Profile Details"}
                </Button>
              </form>
            </div>
          </TabsContent>

          {/* TAB 2: Security & Password Update (Unified Shared Component) */}
          <TabsContent value="security" className="space-y-6">
            <ChangePasswordCard
              title="Account Security & Credentials"
              description="Update your devotee account password and ensure your sacred reservation records remain protected."
              buttonLabel="Update Devotee Password"
              onUpdatePassword={async ({ currentPassword, newPassword, confirmPassword }) => {
                return userApi.changePassword({
                  currentPassword,
                  newPassword,
                  confirmPassword,
                });
              }}
            />
          </TabsContent>
        </Tabs>

        {/* Quick Navigation Cards (100% Flexbox) */}
        <div className="flex flex-col sm:flex-row items-stretch gap-4 pt-2 w-full">
          <Link to="/user/addresses" className="flex-1 group">
            <div className="p-6 rounded-xl border-2 border-amber-300 hover:border-amber-500 bg-white shadow-xs hover:shadow-md transition-all flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-md bg-amber-100 text-amber-800 border border-amber-300 group-hover:scale-105 transition-transform">
                  <MapPin className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-bold font-serif text-base text-stone-900 group-hover:text-red-700 transition-colors">
                    Manage Puja Locations
                  </h3>
                  <p className="text-xs text-stone-600">
                    {addressCount} saved location{addressCount !== 1 ? "s" : ""}{" "}
                    for home ceremonies
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-red-700 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          <Link to="/user/bookings" className="flex-1 group">
            <div className="p-6 rounded-xl border-2 border-amber-300 hover:border-amber-500 bg-white shadow-xs hover:shadow-md transition-all flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-md bg-red-100 text-red-800 border border-red-200 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-6 h-6 text-red-700" />
                </div>
                <div>
                  <h3 className="font-bold font-serif text-base text-stone-900 group-hover:text-red-700 transition-colors">
                    Ceremony Bookings & History
                  </h3>
                  <p className="text-xs text-stone-600">
                    {bookingCount} past & upcoming Vedic ritual
                    {bookingCount !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-red-700 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
