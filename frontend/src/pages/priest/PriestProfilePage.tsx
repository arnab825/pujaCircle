import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import {
  mockGetPriestById,
  mockUpdatePriestProfile,
  mockGetPriestServices,
  mockLookupPincode,
} from "@/mocks/mock-api";
import { Priest, PriestService } from "@/types/priest.types";
import { updatePriestProfileSchema } from "@/schemas/priest.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sparkles,
  ShieldCheck,
  Check,
  Plus,
  X,
  Star,
  MapPin,
  Languages as LanguagesIcon,
  BookOpen,
  Phone,
  Mail,
  User,
  Loader2,
  Camera,
  Trash2,
  Upload,
  Search,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { formatINR } from "@/lib/utils";

const POPULAR_LANGUAGES = [
  "Sanskrit",
  "Hindi",
  "Marathi",
  "Bengali",
  "Gujarati",
  "Kannada",
  "Telugu",
  "Tamil",
];

export const PriestProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const priestId =
    user?.id === "user-priest-1" ? "priest-1" : user?.id || "priest-1";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSearchingPin, setIsSearchingPin] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  // Form States
  const [priest, setPriest] = useState<Priest | null>(null);
  const [services, setServices] = useState<PriestService[]>([]);
  const [fullName, setFullName] = useState("");
  const [experienceYears, setExperienceYears] = useState<number>(10);
  const [pincode, setPincode] = useState("400050");
  const [city, setCity] = useState("Mumbai");
  const [state, setState] = useState("Maharashtra");
  const [bio, setBio] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);

  // Inputs for adding custom items
  const [customLanguage, setCustomLanguage] = useState("");
  const [newAreaInput, setNewAreaInput] = useState("");

  // 1. Fetch priest profile & active services on mount
  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const [priestRes, srvRes] = await Promise.all([
        mockGetPriestById(priestId),
        mockGetPriestServices(priestId),
      ]);

      if (priestRes.success && priestRes.data) {
        const p = priestRes.data;
        setPriest(p);
        setFullName(p.fullName || "");
        setExperienceYears(p.experienceYears || 0);
        setBio(p.bio || "");
        setCity(p.city || "Mumbai");
        setState(p.state || "Maharashtra");
        setProfileImageUrl(p.profileImageUrl || "");
        setLanguages(p.languages || []);
        setServiceAreas(p.serviceAreas || []);

        // Derive initial pincode based on city
        if (p.city === "Mumbai") setPincode("400050");
        else if (p.city === "Bengaluru") setPincode("560038");
        else if (p.city === "Kolkata") setPincode("700019");
        else if (p.city === "Gurugram") setPincode("122002");
      } else {
        toast.error(priestRes.message || "Failed to load priest profile.");
      }

      if (srvRes.success && srvRes.data) {
        setServices(srvRes.data);
      }
    } catch {
      toast.error("An error occurred while loading your profile.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [priestId]);

  // 2. PIN Code Lookup for City & State Auto-Detection using https://api.postalpincode.in/pincode/${pincode}
  const handlePincodeLookup = async (pinValue: string) => {
    const clean = pinValue.trim().replace(/\D/g, "");
    setPincode(clean);

    if (clean.length === 6) {
      setIsSearchingPin(true);
      try {
        let detectedCity = "";
        let detectedState = "";

        // 1. Primary: Live Postal PIN Code API
        try {
          const response = await fetch(
            `https://api.postalpincode.in/pincode/${clean}`,
          );
          if (response.ok) {
            const data = await response.json();
            if (
              Array.isArray(data) &&
              data[0]?.Status === "Success" &&
              Array.isArray(data[0]?.PostOffice) &&
              data[0].PostOffice.length > 0
            ) {
              const po = data[0].PostOffice[0];
              detectedCity = po.District || po.Block || po.Circle || "";
              detectedState = po.State || "";
            }
          }
        } catch (fetchErr) {
          console.warn(
            "Live postal API unavailable, trying local dataset:",
            fetchErr,
          );
        }

        // 2. Fallback: Local centralized directory if offline
        if (!detectedCity || !detectedState) {
          const fallbackRes = await mockLookupPincode(clean);
          if (fallbackRes.locations && fallbackRes.locations.length > 0) {
            detectedCity = fallbackRes.locations[0].city;
            detectedState = fallbackRes.locations[0].state;
          }
        }

        if (detectedCity && detectedState) {
          setCity(detectedCity);
          setState(detectedState);
          toast.success(`Location detected: ${detectedCity}, ${detectedState}`);
        } else {
          toast.error("PIN code not found. Please verify the 6-digit code.");
        }
      } catch {
        toast.error("Failed to lookup PIN code location.");
      } finally {
        setIsSearchingPin(false);
      }
    }
  };

  // 3. Avatar Upload & Remove Handlers
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setProfileImageUrl(result);
      setIsAvatarModalOpen(false);
      toast.success('Profile photo updated! Click "Save Changes" to persist.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setProfileImageUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsAvatarModalOpen(false);
    toast.success("Profile photo removed.");
  };

  // 4. Language toggles
  const toggleLanguage = (lang: string) => {
    if (languages.includes(lang)) {
      if (languages.length === 1) {
        toast.error("Please keep at least one language.");
        return;
      }
      setLanguages(languages.filter((l) => l !== lang));
    } else {
      setLanguages([...languages, lang]);
    }
  };

  const handleAddCustomLanguage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customLanguage.trim();
    if (!trimmed) return;
    if (languages.some((l) => l.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("Language already added.");
      return;
    }
    setLanguages([...languages, trimmed]);
    setCustomLanguage("");
  };

  // 5. Service Areas management
  const handleAddArea = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newAreaInput.trim();
    if (!trimmed) return;
    if (serviceAreas.some((a) => a.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("Service locality already added.");
      return;
    }
    setServiceAreas([...serviceAreas, trimmed]);
    setNewAreaInput("");
  };

  const handleRemoveArea = (area: string) => {
    if (serviceAreas.length === 1) {
      toast.error("Please keep at least one service locality.");
      return;
    }
    setServiceAreas(serviceAreas.filter((a) => a !== area));
  };

  // 6. Save Changes handler
  const handleSave = async () => {
    const parseResult = updatePriestProfileSchema.safeParse({
      fullName: fullName.trim(),
      displayName: fullName.trim(),
      experienceYears: Number(experienceYears) || 0,
      bio: bio.trim(),
      languages,
      serviceAreas,
      city: city.trim(),
      state: state.trim(),
      profileImageUrl: profileImageUrl.trim(),
    });

    if (!parseResult.success) {
      toast.error(
        parseResult.error.errors[0]?.message ||
          "Invalid priest profile information.",
      );
      return;
    }

    if (!pincode.trim() || pincode.length !== 6) {
      toast.error("Please enter a valid 6-digit PIN code.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await mockUpdatePriestProfile(priestId, parseResult.data);

      if (res.success && res.data) {
        setPriest(res.data);
        toast.success(res.message || "Profile saved successfully!");
      } else {
        toast.error(res.message || "Failed to update profile.");
      }
    } catch {
      toast.error("An error occurred while saving profile changes.");
    } finally {
      setIsSaving(false);
    }
  };

  // Fallback initials for Avatar
  const getInitials = (name: string) => {
    if (!name) return "PT";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 space-y-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground">
          Loading your Vedic credentials...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 pb-16">
      {/* Hidden File Input for Avatar */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarUpload}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />

      {/* Profile Picture Management Modal (Identical to Devotee Profile) */}
      <Dialog open={isAvatarModalOpen} onOpenChange={setIsAvatarModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              Profile Picture
            </DialogTitle>
            <DialogDescription className="text-xs">
              Upload a clear photo for your Priest profile or reset to default
              initials.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-6 gap-4">
            <div className="p-1 rounded-full bg-linear-to-tr from-primary via-brand-saffron to-amber-500 shadow-md">
              <Avatar className="w-28 h-28 border-2 border-background">
                {profileImageUrl ? (
                  <AvatarImage
                    src={profileImageUrl}
                    alt={fullName}
                    className="object-cover"
                  />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-primary font-serif text-3xl font-bold">
                  {getInitials(fullName)}
                </AvatarFallback>
              </Avatar>
            </div>
            <p className="text-xs text-muted-foreground">
              Supported formats: JPG, PNG, WEBP (Max 5MB)
            </p>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
            {profileImageUrl ? (
              <Button
                type="button"
                variant="destructive"
                onClick={handleRemoveAvatar}
                className="w-full sm:w-auto text-xs"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove Photo
              </Button>
            ) : (
              <div />
            )}

            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAvatarModalOpen(false)}
                className="flex-1 sm:flex-none text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 sm:flex-none text-xs gap-1.5"
              >
                <Upload className="w-4 h-4" />
                Upload New Photo
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 1. Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-primary border-primary/30 text-[11px]"
            >
              <Sparkles className="h-3 w-3 mr-1 text-primary" /> Priest
              Credentials
            </Badge>
            {priest?.approvalStatus === "APPROVED" ? (
              <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] gap-1">
                <ShieldCheck className="h-3 w-3" /> Verified Priest
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[11px]">
                {priest?.approvalStatus}
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-foreground mt-1">
            Vedic Profile & Qualifications
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage your credentials, Vedic lineage, languages, service
            localities, and puja offerings.
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          className="gap-2 text-xs font-semibold px-5 h-9 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs shrink-0 self-start sm:self-auto"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* 2. Top Summary Card with Interactive Avatar Trigger */}
      <div className="p-5 sm:p-6 rounded-lg bg-linear-to-r from-amber-500/10 via-brand-saffron/10 to-primary/5 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 w-full sm:w-auto text-center sm:text-left">
          {/* Clickable Avatar on Top for Mobile */}
          <div className="relative group shrink-0">
            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(true)}
              className="relative block p-1 rounded-full bg-linear-to-tr from-primary via-brand-saffron to-amber-500 shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-transform hover:scale-105"
              title="Click to change profile picture"
            >
              <Avatar className="w-24 h-24 sm:w-20 sm:h-20 border-2 border-background">
                {profileImageUrl ? (
                  <AvatarImage
                    src={profileImageUrl}
                    alt={fullName}
                    className="object-cover"
                  />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-primary font-serif text-2xl font-bold">
                  {getInitials(fullName)}
                </AvatarFallback>
              </Avatar>

              {/* Camera Overlay on Hover */}
              <div className="absolute inset-1 rounded-full bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                <Camera className="w-5 h-5 mb-0.5" />
                <span className="text-[9px] font-medium tracking-wide uppercase">
                  Edit
                </span>
              </div>
            </button>
          </div>

          {/* Details on Bottom for Mobile */}
          <div className="space-y-1.5 flex-1">
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-foreground">
              {fullName || "Pandit Ji"}
            </h2>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">
                {experienceYears} Years Vedic Experience
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-600 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {priest?.rating || 4.9} ({priest?.reviewCount || 0} reviews)
              </span>
              <span>•</span>
              <span>
                {city}, {state}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Tap avatar to upload a new profile photo or remove your picture.
            </p>
          </div>
        </div>

        {/* Locality Quick Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border shadow-2xs text-xs text-muted-foreground shrink-0">
          <MapPin className="w-4 h-4 text-primary" />
          <span>{serviceAreas.length} Active Localities</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 3. Basic Details & Experience */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <CardTitle className="text-base font-serif">
                Basic Profile & Experience
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Your name, Vedic experience, and PIN-code based home location.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">
                Full Legal Name *
              </label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Pandit Ramesh Shastri"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-primary" />
                Years of Vedic Experience *
              </label>
              <Input
                type="number"
                min="0"
                max="70"
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                placeholder="18"
                className="h-9 text-xs"
              />
            </div>

            {/* PIN Code with Auto-Detection */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-foreground">
                  6-Digit PIN Code *
                </label>
                {isSearchingPin && (
                  <span className="text-[11px] text-primary flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Detecting...
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={pincode}
                  maxLength={6}
                  onChange={(e) => handlePincodeLookup(e.target.value)}
                  placeholder="e.g. 400050"
                  className="h-9 text-xs font-mono tracking-wider"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handlePincodeLookup(pincode)}
                  disabled={isSearchingPin || pincode.length !== 6}
                  className="h-9 text-xs gap-1 shrink-0"
                >
                  <Search className="w-3.5 h-3.5" /> Lookup
                </Button>
              </div>
            </div>

            {/* Detected City & State (Auto-Populated) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="font-medium text-muted-foreground text-[11px]">
                  Detected City
                </span>
                <div className="p-2 rounded-md bg-muted/50 border text-foreground font-medium text-xs">
                  {city || "Enter PIN Code"}
                </div>
              </div>
              <div className="space-y-1">
                <span className="font-medium text-muted-foreground text-[11px]">
                  Detected State
                </span>
                <div className="p-2 rounded-md bg-muted/50 border text-foreground font-medium text-xs">
                  {state || "Enter PIN Code"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Verified Contact Information (Read-Only) */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <CardTitle className="text-base font-serif">
                Verified Contact Channels
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Primary communication channels verified via OTP authentication.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-muted/40 border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-primary" /> Registered
                  Mobile
                </span>
                <Badge
                  variant="outline"
                  className="text-emerald-700 bg-emerald-500/10 border-emerald-500/30 text-[10px] gap-1"
                >
                  <Check className="w-3 h-3" /> Phone Verified
                </Badge>
              </div>
              <p className="font-mono text-sm font-bold text-foreground">
                {priest?.phoneNumber || "+919876543211"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Devotees contact you on this verified number for ritual
                coordination.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/40 border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-primary" /> Registered Email
                </span>
                <Badge
                  variant="outline"
                  className="text-emerald-700 bg-emerald-500/10 border-emerald-500/30 text-[10px] gap-1"
                >
                  <Check className="w-3 h-3" /> Email Verified
                </Badge>
              </div>
              <p className="font-mono text-xs font-semibold text-foreground">
                {priest?.email || "priest@example.demo"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Booking updates, scheduling notifications, and platform alerts.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 5. Vedic Lineage & Bio (Full Width) */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <CardTitle className="text-base font-serif">
              Vedic Lineage & Bio
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Describe your Gurukul education, Veda shakha, training, and
            spiritual background.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 space-y-2 text-xs">
          <Textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Vedic scholar trained in Varanasi Gurukul. Specializes in Griha Pravesh, Vastu Shanti, and Satyanarayan Katha with over 18 years of ritual expertise..."
            className="text-xs leading-relaxed resize-y"
          />
          <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-1">
            <span>
              Minimum 20 characters. Authentic background helps devotees build
              trust.
            </span>
            <span>{bio.length} characters</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 6. Languages Spoken */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center gap-2">
              <LanguagesIcon className="w-4 h-4 text-primary" />
              <CardTitle className="text-base font-serif">
                Languages Spoken ({languages.length})
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Select all Vedic and regional languages you can perform mantras
              and katha in.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-4 text-xs">
            <div className="flex flex-wrap gap-2">
              {POPULAR_LANGUAGES.map((lang) => {
                const isSelected = languages.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-muted/40 text-muted-foreground hover:bg-muted border-border/70"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    {lang}
                  </button>
                );
              })}
            </div>

            {/* Custom Language Addition */}
            <form
              onSubmit={handleAddCustomLanguage}
              className="flex gap-2 pt-2 border-t border-border/60"
            >
              <Input
                placeholder="Add other language (e.g. Odia)..."
                value={customLanguage}
                onChange={(e) => setCustomLanguage(e.target.value)}
                className="h-8 text-xs flex-1"
              />
              <Button
                type="submit"
                size="sm"
                variant="outline"
                className="h-8 text-xs gap-1"
              >
                <Plus className="w-3 h-3" /> Add
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 7. Active Puja Services & Offerings (Catalog & Dakshina) */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="p-4 sm:p-5 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary shrink-0" />
                  <CardTitle className="text-base font-serif font-bold text-foreground">
                    Puja Services Provided (
                    {services.filter((s) => s.isActive).length})
                  </CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Ceremonies and rituals you currently offer to devotees.
                </CardDescription>
              </div>
              <Link to="/priest/services" className="self-start sm:self-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs text-primary hover:text-primary gap-1.5 h-8 px-2.5"
                >
                  Manage Services <ExternalLink className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-3 text-xs">
            {services.length > 0 ? (
              <div className="space-y-2">
                {services.map((srv) => (
                  <div
                    key={srv.id}
                    className="p-3 rounded-xl bg-muted/40 border border-border/80 flex items-center justify-between gap-3 hover:bg-muted/60 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="font-medium text-foreground text-xs truncate">
                        {srv.serviceName}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-xs text-primary shrink-0">
                      {formatINR(srv.price)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 space-y-2">
                <p className="text-muted-foreground text-xs">
                  No active ceremony offerings.
                </p>
                <Link to="/priest/services">
                  <Button size="sm" variant="outline" className="text-xs">
                    Add Services
                  </Button>
                </Link>
              </div>
            )}
            <p className="text-[11px] text-muted-foreground pt-1">
              To add or change rituals, prices, or activate/pause services, use
              the dedicated Services page.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 8. Service Areas / Localities */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <CardTitle className="text-base font-serif">
              Service Localities & Neighborhoods ({serviceAreas.length})
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Localities and sectors where you are available to travel for in-home
            pujas.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 space-y-4 text-xs">
          <div className="flex flex-wrap gap-2">
            {serviceAreas.map((area) => (
              <Badge
                key={area}
                variant="secondary"
                className="pl-3 pr-1.5 py-1 text-xs flex items-center gap-1.5 bg-muted/60 hover:bg-muted border text-foreground"
              >
                <span>{area}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveArea(area)}
                  className="rounded-full p-0.5 hover:bg-destructive hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>

          <form
            onSubmit={handleAddArea}
            className="flex gap-2 pt-2 border-t border-border/60 max-w-md"
          >
            <Input
              placeholder="Add locality (e.g. Bandra, Juhu, Powai)..."
              value={newAreaInput}
              onChange={(e) => setNewAreaInput(e.target.value)}
              className="h-8 text-xs flex-1"
            />
            <Button
              type="submit"
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1"
            >
              <Plus className="w-3 h-3" /> Add Area
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 9. Bottom Action Bar */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="gap-2 text-xs font-semibold px-6 h-10 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving Profile...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Save Profile Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PriestProfilePage;
