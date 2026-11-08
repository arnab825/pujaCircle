import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { priestApi } from "@/api/priest.api";
import { Priest, PriestService } from "@/types/priest.types";
import { updatePriestProfileSchema } from "@/schemas/priest.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
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
  Lock,
  Loader2,
  Camera,
  Trash2,
  Search,
  ExternalLink,
  Sparkles,
  AlertCircle,
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

/**
 * PriestProfilePage
 * Vedic Scholar profile, qualifications, languages, localities, and offerings editor.
 * 100% Flexbox, zero CSS grids, zero gradients, pure solid white canvas, Haldi gold trims.
 */
export const PriestProfilePage: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const priestId = user?.id || '';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSearchingPin, setIsSearchingPin] = useState(false);

  // Form States
  const [priest, setPriest] = useState<Priest | null>(null);
  const [services, setServices] = useState<PriestService[]>([]);
  const [fullName, setFullName] = useState("");
  const [experienceYears, setExperienceYears] = useState<number>(0);
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [bio, setBio] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);

  // Inputs for adding custom items
  const [customLanguage, setCustomLanguage] = useState("");
  const [newAreaInput, setNewAreaInput] = useState("");
  const [areaPinSuggestions, setAreaPinSuggestions] = useState<
    Array<{ name: string; city: string; state: string; district?: string; pincode: string }>
  >([]);
  const [residingPinSuggestions, setResidingPinSuggestions] = useState<
    Array<{ name: string; city: string; state: string; district?: string; pincode: string }>
  >([]);
  const [isHomeSuggestionsDismissed, setIsHomeSuggestionsDismissed] = useState(false);
  const [isSearchingAreaPin, setIsSearchingAreaPin] = useState(false);
  const [areaPinQuery, setAreaPinQuery] = useState("");
  const [districtWarning, setDistrictWarning] = useState<string | null>(null);

  const loadResidingLocalities = (
    pin: string,
    homeDistrict: string,
    locations: any[],
  ) => {
    const unique = new Map<
      string,
      { name: string; city: string; state: string; district: string; pincode: string }
    >();
    locations.forEach((loc) => {
      const name = loc.locality || loc.villageTown || loc.postOffice;
      if (name && !unique.has(name)) {
        unique.set(name, {
          name,
          city: loc.city || loc.district || "",
          district: loc.district || homeDistrict,
          state: loc.state || "",
          pincode: pin,
        });
      }
    });
    setResidingPinSuggestions(Array.from(unique.values()));
  };

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const [p, srvList] = await Promise.all([
        priestApi.getPriestById(priestId),
        priestApi.getPriestServices(priestId),
      ]);

      if (p) {
        setPriest(p);
        setFullName(p.fullName || user?.name || "");
        setExperienceYears(p.experienceYears || 0);
        setBio(p.bio || "");
        setCity(p.city || "");
        setState(p.state || "");
        setProfileImageUrl(p.profileImageUrl || "");
        setLanguages(p.languages || []);
        setServiceAreas(p.serviceAreas || []);
        setPincode(p.pincode || "");

        if (p.pincode && p.pincode.length === 6) {
          priestApi.lookupPincode(p.pincode).then((res) => {
            if (res?.locations && res.locations.length > 0) {
              const loc = res.locations[0];
              const resolvedDistrict = loc.district || loc.city || p.city || "";
              setDistrict(resolvedDistrict);
              loadResidingLocalities(p.pincode!, resolvedDistrict, res.locations);
            }
          });
        }
      } else if (user) {
        setFullName(user.name || "");
      }

      setServices(srvList || []);
    } catch {
      toast.error("An error occurred while loading your profile.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [priestId]);

  const handlePincodeLookup = async (pinValue: string) => {
    const clean = pinValue.trim().replace(/\D/g, "");
    setPincode(clean);

    if (clean.length === 6) {
      setIsSearchingPin(true);
      try {
        const res = await priestApi.lookupPincode(clean);
        if (res && res.locations && res.locations.length > 0) {
          const loc = res.locations[0];
          const resolvedCity = loc.city || loc.district || "";
          const resolvedDistrict = loc.district || loc.city || "";
          setCity(resolvedCity);
          setDistrict(resolvedDistrict);
          setState(loc.state);
          toast.success(
            `Detected location: ${loc.locality ? `${loc.locality}, ` : ""}${resolvedCity} (${resolvedDistrict}), ${loc.state}`,
          );
          loadResidingLocalities(clean, resolvedDistrict, res.locations);
        } else {
          toast.error("Could not resolve location for this PIN code.");
        }
      } catch {
        toast.error("Failed to lookup PIN code.");
      } finally {
        setIsSearchingPin(false);
      }
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setProfileImageUrl(dataUrl);
      toast.success("Profile photo updated! Remember to save changes.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setProfileImageUrl("");
    toast.success("Profile photo removed.");
  };

  const syncProfileField = async (partialUpdates: { languages?: string[]; serviceAreas?: string[] }) => {
    try {
      const payload = {
        fullName: fullName.trim() || priest?.fullName || user?.name || "Purohit",
        displayName: fullName.trim() || priest?.displayName || user?.name || "Purohit",
        experienceYears: Number(experienceYears) || priest?.experienceYears || 0,
        bio: bio.trim() || priest?.bio || "",
        languages: partialUpdates.languages ?? languages,
        serviceAreas: partialUpdates.serviceAreas ?? serviceAreas,
        city: city.trim() || priest?.city || "",
        state: state.trim() || priest?.state || "",
        pincode: pincode.trim() || priest?.pincode || "",
      };

      const res = await priestApi.updatePriestProfile(priestId, payload);
      if (res && res.success && res.data) {
        setPriest(res.data);
      } else if (res && !res.success) {
        toast.error(res.message || "Failed to sync changes to database.");
      }
    } catch (err: any) {
      console.warn("Auto-sync notice:", err);
    }
  };

  const toggleLanguage = (lang: string) => {
    let updated: string[];
    if (languages.includes(lang)) {
      if (languages.length === 1) {
        toast.error("Please keep at least one primary language.");
        return;
      }
      updated = languages.filter((l) => l !== lang);
    } else {
      updated = [...languages, lang];
    }
    setLanguages(updated);
    syncProfileField({ languages: updated });
  };

  const handleAddCustomLanguage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customLanguage.trim();
    if (!trimmed) return;
    if (languages.some((l) => l.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("Language already added.");
      return;
    }
    const updated = [...languages, trimmed];
    setLanguages(updated);
    setCustomLanguage("");
    syncProfileField({ languages: updated });
  };

  // Dynamic district equivalence comparison
  const normalizeDistrictTokens = (value: string): string => {
    return value
      .toLowerCase()
      .replace(/twenty\s*four/g, "24")
      .replace(/twentyfour/g, "24")
      .replace(/\bgurgaon\b/g, "gurugram")
      .replace(/\bbangalore\b/g, "bengaluru")
      .replace(/\bcalcutta\b/g, "kolkata")
      .replace(/\bbombay\b/g, "mumbai")
      .replace(/\bmadras\b/g, "chennai")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\b(district|city|urban|rural|division|corporation)\b/g, "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .sort()
      .join("");
  };

  const areDistrictsEquivalent = (firstDistrict: string, secondDistrict: string): boolean => {
    if (!firstDistrict || !secondDistrict) return true;
    const n1 = normalizeDistrictTokens(firstDistrict);
    const n2 = normalizeDistrictTokens(secondDistrict);
    if (!n1 || !n2) return true;
    return n1 === n2 || n1.includes(n2) || n2.includes(n1);
  };

  const handleAreaInputChange = (value: string) => {
    setNewAreaInput(value);
    setDistrictWarning(null);
    const cleanDigits = value.trim().replace(/\D/g, "");

    if (cleanDigits.length === 6 && cleanDigits !== areaPinQuery) {
      setAreaPinQuery(cleanDigits);
      setIsSearchingAreaPin(true);
      priestApi
        .lookupPincode(cleanDigits)
        .then((res) => {
          if (res?.locations && res.locations.length > 0) {
            const primaryLocation = res.locations[0];
            const candidateDistrict = primaryLocation.district || primaryLocation.city || "";
            const residingDistrict = district || city;

            // Dynamic district restriction based on live postal lookup
            if (residingDistrict && candidateDistrict && !areDistrictsEquivalent(candidateDistrict, residingDistrict)) {
              const warningMsg = `PIN ${cleanDigits} is in ${candidateDistrict} (${primaryLocation.state}), which is outside your residing district (${residingDistrict}). Purohits can only serve localities within their home district.`;
              setDistrictWarning(warningMsg);
              toast.error(warningMsg);
              setAreaPinSuggestions([]);
              return;
            }

            const unique = new Map<
              string,
              { name: string; city: string; state: string; district: string; pincode: string }
            >();
            res.locations.forEach((loc) => {
              const name = loc.locality || loc.villageTown || loc.postOffice;
              if (name && !unique.has(name)) {
                unique.set(name, {
                  name,
                  city: loc.city || loc.district || "",
                  district: loc.district || candidateDistrict,
                  state: loc.state || "",
                  pincode: cleanDigits,
                });
              }
            });
            setAreaPinSuggestions(Array.from(unique.values()));
          } else {
            setAreaPinSuggestions([]);
          }
        })
        .catch(() => {
          setAreaPinSuggestions([]);
        })
        .finally(() => {
          setIsSearchingAreaPin(false);
        });
    } else if (cleanDigits.length < 6) {
      if (areaPinSuggestions.length > 0) setAreaPinSuggestions([]);
      setAreaPinQuery("");
    }
  };

  const handleSelectAreaSuggestion = (item: {
    name: string;
    city: string;
    district?: string;
    state: string;
    pincode: string;
  }) => {
    const residingDistrict = district || city;
    const targetDistrict = item.district || item.city;
    if (residingDistrict && targetDistrict && !areDistrictsEquivalent(targetDistrict, residingDistrict)) {
      const warningMsg = `Cannot add ${item.name}: It is in ${targetDistrict}, which is outside your residing district (${residingDistrict}).`;
      setDistrictWarning(warningMsg);
      toast.error(warningMsg);
      return;
    }

    const formatted = `${item.pincode} - ${item.name}`;
    if (!serviceAreas.includes(formatted) && !serviceAreas.includes(item.name)) {
      const updated = [...serviceAreas, formatted];
      setServiceAreas(updated);
      setDistrictWarning(null);
      toast.success(`Added ${formatted} to service localities.`);
      syncProfileField({ serviceAreas: updated });
    } else {
      toast.info(`${formatted} is already in your service areas.`);
    }
  };

  const handleAddAllSuggestions = () => {
    let addedCount = 0;
    const toAdd: string[] = [];
    const residingDistrict = district || city;

    areaPinSuggestions.forEach((s) => {
      const targetDistrict = s.district || s.city;
      if (residingDistrict && targetDistrict && !areDistrictsEquivalent(targetDistrict, residingDistrict)) {
        return;
      }
      const formatted = `${s.pincode} - ${s.name}`;
      if (
        !serviceAreas.includes(formatted) &&
        !serviceAreas.includes(s.name) &&
        !toAdd.includes(formatted)
      ) {
        toAdd.push(formatted);
        addedCount++;
      }
    });
    if (addedCount > 0) {
      const updated = [...serviceAreas, ...toAdd];
      setServiceAreas(updated);
      setDistrictWarning(null);
      toast.success(`Added ${addedCount} localities for PIN ${areaPinQuery}.`);
      syncProfileField({ serviceAreas: updated });
    } else {
      toast.info("All suggested localities are already in your service areas.");
    }
  };

  const handleAddAllResidingSuggestions = () => {
    let addedCount = 0;
    const toAdd: string[] = [];
    residingPinSuggestions.forEach((s) => {
      const formatted = `${s.pincode} - ${s.name}`;
      if (
        !serviceAreas.includes(formatted) &&
        !serviceAreas.includes(s.name) &&
        !toAdd.includes(formatted)
      ) {
        toAdd.push(formatted);
        addedCount++;
      }
    });
    if (addedCount > 0) {
      const updated = [...serviceAreas, ...toAdd];
      setServiceAreas(updated);
      setDistrictWarning(null);
      toast.success(`Added ${addedCount} home localities for PIN ${pincode}.`);
      syncProfileField({ serviceAreas: updated });
    } else {
      toast.info("All residing localities are already in your service areas.");
    }
  };

  const handleAddArea = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newAreaInput.trim();
    if (!trimmed) return;

    const residingDistrict = district || city;
    const cleanDigits = trimmed.replace(/\D/g, "");

    // 1. If 6-digit PIN code was entered, verify its postal district dynamically
    if (cleanDigits.length === 6) {
      setIsSearchingAreaPin(true);
      try {
        const res = await priestApi.lookupPincode(cleanDigits);
        if (res?.locations && res.locations.length > 0) {
          const primaryLocation = res.locations[0];
          const targetDistrict = primaryLocation.district || primaryLocation.city || "";
          if (residingDistrict && targetDistrict && !areDistrictsEquivalent(targetDistrict, residingDistrict)) {
            const warningMsg = `PIN ${cleanDigits} is in ${targetDistrict}, which is outside your residing district (${residingDistrict}). Purohits can only serve localities within their home district.`;
            setDistrictWarning(warningMsg);
            toast.error(warningMsg);
            return;
          }
        }
      } finally {
        setIsSearchingAreaPin(false);
      }
    }

    if (serviceAreas.some((a) => a.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("Service locality already added.");
      return;
    }

    const updated = [...serviceAreas, trimmed];
    setServiceAreas(updated);
    setNewAreaInput("");
    setAreaPinSuggestions([]);
    setAreaPinQuery("");
    setDistrictWarning(null);
    toast.success(`Added "${trimmed}" to service localities.`);
    syncProfileField({ serviceAreas: updated });
  };

  const handleRemoveArea = (area: string) => {
    if (serviceAreas.length === 1) {
      toast.error("Please keep at least one service locality.");
      return;
    }
    const updated = serviceAreas.filter((a) => a !== area);
    setServiceAreas(updated);
    syncProfileField({ serviceAreas: updated });
  };

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
      pincode: pincode.trim(),
      profileImageUrl: profileImageUrl.trim(),
    });

    if (!parseResult.success) {
      toast.error(
        parseResult.error.errors[0]?.message ||
          "Invalid priest profile information.",
      );
      return;
    }

    if (pincode.trim() && pincode.trim().length !== 6) {
      toast.error("Please enter a valid 6-digit PIN code.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await priestApi.updatePriestProfile(priestId, {
        ...parseResult.data,
        fullName: fullName.trim(),
        pincode: pincode.trim(),
      });

      if (res.success && res.data) {
        setPriest(res.data);
        const resolvedImage = res.data.profileImageUrl || "";
        setProfileImageUrl(resolvedImage);
        if (user) {
          setUser({
            ...user,
            name: res.data.fullName || fullName.trim(),
            avatarUrl: resolvedImage || undefined,
          });
        }
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

  const getInitials = (name: string) => {
    if (!name) return "PT";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center bg-white space-y-3">
        <div className="h-12 w-12 rounded-md bg-amber-400 text-stone-950 flex items-center justify-center font-serif font-black text-2xl shadow-sm animate-pulse">
          ॐ
        </div>
        <p className="text-xs text-stone-600 font-medium">
          Loading your Vedic credentials...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl space-y-6 pb-16 text-stone-900">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarUpload}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />

      {/* 1. Header Banner (100% Flexbox) */}
      <div className="p-6 sm:p-7 rounded-xl border-2 border-amber-300 bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="text-amber-900 border-amber-400 bg-amber-100 text-[11px] font-bold"
          >
            Vedic Acharya Dossier
          </Badge>
          {priest?.approvalStatus === "APPROVED" ? (
            <Badge className="bg-emerald-600 text-white text-[11px] font-bold gap-1">
              <ShieldCheck className="h-3 w-3" /> Verified Purohit
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[11px] font-bold">
              {priest?.approvalStatus}
            </Badge>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-stone-950 mt-1">
          Vedic Profile & Credentials
        </h1>
        <p className="text-xs text-stone-600">
          Manage your credentials, Gurukul lineage, languages, service
          localities, and puja offerings.
        </p>
      </div>

      {/* 2. Top Summary Card with Interactive Avatar Trigger (Pure White, Haldi Gold Border) */}
      <div className="p-6 sm:p-8 rounded-xl border-2 border-amber-300 bg-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto text-center sm:text-left">
          <div className="flex flex-col items-center sm:items-start gap-2 shrink-0">
            <div className="relative group shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative block p-1 rounded-full ring-4 ring-amber-400 bg-amber-100 shadow-sm focus:outline-none focus:ring-offset-2 focus:ring-offset-white transition-transform hover:scale-105 cursor-pointer"
                title="Click to choose a new profile photo"
              >
                <Avatar className="w-24 h-24 sm:w-20 sm:h-20 border-2 border-white">
                  {profileImageUrl ? (
                    <AvatarImage
                      src={profileImageUrl}
                      alt={fullName}
                      className="object-cover"
                    />
                  ) : null}
                  <AvatarFallback className="bg-[#780016] text-white font-serif text-2xl font-bold">
                    {getInitials(fullName)}
                  </AvatarFallback>
                </Avatar>

                <div className="absolute inset-1 rounded-full bg-stone-950/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-5 h-5 mb-0.5" />
                  <span className="text-[9px] font-bold tracking-wide uppercase">
                    Change
                  </span>
                </div>
              </button>
            </div>

            {profileImageUrl && (
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
            <h2 className="text-xl sm:text-2xl font-extrabold font-serif text-stone-950">
              {fullName || user?.name || "Acharya Pandit Ji"}
            </h2>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-stone-600">
              <span className="font-bold text-stone-900">
                {experienceYears} Years Vedic Experience
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-700 font-bold">
                <Star className={`w-3.5 h-3.5 ${priest?.reviewCount && Number(priest?.rating) > 0 ? "fill-amber-500 text-amber-500" : "text-stone-400"}`} />
                {priest?.reviewCount && Number(priest?.rating) > 0
                  ? `${Number(priest.rating).toFixed(1)} (${priest.reviewCount} ${priest.reviewCount === 1 ? "review" : "reviews"})`
                  : `0.0 (${priest?.reviewCount || 0} reviews)`}
              </span>
              <span>•</span>
              <span className="font-medium text-stone-800">
                {city || "Location not set"}{state ? `, ${state}` : ""}
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Tap avatar to upload a new profile picture.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-amber-50/70 border border-amber-300 text-xs text-stone-800 font-bold shrink-0">
          <MapPin className="w-4 h-4 text-red-700" />
          <span>{serviceAreas.length} Active Localities</span>
        </div>
      </div>

      {/* 3 & 4. Details Deck (100% Flexbox, Zero CSS Grids) */}
      <div className="flex flex-col md:flex-row items-stretch gap-6 w-full">
        {/* Basic Details & Experience */}
        <div className="flex-1 rounded-xl border-2 border-amber-300 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
            <User className="w-4 h-4 text-red-700" />
            <h3 className="text-base font-serif font-bold text-stone-950">
              Basic Profile & Experience
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-stone-800 block">
                Full Legal Name *
              </label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Pandit Ramesh Shastri"
                className="h-10 rounded-md border-stone-300 focus:ring-amber-500 bg-white text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-stone-800 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                Years of Vedic Experience *
              </label>
              <Input
                type="number"
                min="0"
                max="70"
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                placeholder="18"
                className="h-10 rounded-md border-stone-300 focus:ring-amber-500 bg-white text-xs"
              />
            </div>

            {/* PIN Code with Auto-Detection */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between">
                <label className="font-bold text-stone-800 block">
                  6-Digit PIN Code *
                </label>
                {isSearchingPin && (
                  <span className="text-[11px] text-amber-700 flex items-center gap-1 font-bold">
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
                  className="h-10 text-xs font-mono tracking-wider rounded-md border-stone-300 focus:ring-amber-500 bg-white"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handlePincodeLookup(pincode)}
                  disabled={isSearchingPin || pincode.length !== 6}
                  className="h-10 text-xs gap-1 shrink-0 rounded-md border-amber-300 font-bold"
                >
                  <Search className="w-3.5 h-3.5 text-amber-600" /> Lookup
                </Button>
              </div>
            </div>

            {/* Detected City, District & State (100% Flexbox) */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <div className="flex-1 space-y-1">
                <span className="font-bold text-stone-500 text-[10px] uppercase">
                  Detected City / Area
                </span>
                <div className="p-3 rounded-md bg-amber-50/60 border border-amber-200 text-stone-900 font-bold text-xs truncate">
                  {city || "Enter PIN Code"}
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <span className="font-bold text-stone-500 text-[10px] uppercase">
                  Home District
                </span>
                <div className="p-3 rounded-md bg-amber-50/60 border border-amber-200 text-stone-900 font-bold text-xs truncate">
                  {district || city || "Enter PIN Code"}
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <span className="font-bold text-stone-500 text-[10px] uppercase">
                  Detected State
                </span>
                <div className="p-3 rounded-md bg-amber-50/60 border border-amber-200 text-stone-900 font-bold text-xs truncate">
                  {state || "Enter PIN Code"}
                </div>
              </div>
            </div>

            {pincode.length === 6 && (district || city) && (
              <div className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-md flex items-center gap-1.5 mt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  Authorized Residing Jurisdiction: <strong>{district || city} District</strong> (Purohits serve within this district)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Verified Contact Information */}
        <div className="flex-1 rounded-xl border-2 border-amber-300 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-base font-serif font-bold text-stone-950">
              Verified Contact Channels
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-md bg-amber-50/50 border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-red-700" /> Registered
                  Mobile
                </span>
                <Badge
                  variant="outline"
                  className="text-stone-700 bg-stone-100 border-stone-300 text-[10px] font-bold gap-1"
                >
                  <Lock className="w-3 h-3 text-stone-500" /> Registered
                </Badge>
              </div>
              <p className="font-mono text-sm font-bold text-stone-950">
                {priest?.phoneNumber || user?.phoneNumber || "Phone pending"}
              </p>
              <p className="text-[11px] text-stone-600">
                Devotees contact you on this registered number for ritual
                coordination.
              </p>
            </div>

            <div className="p-4 rounded-md bg-amber-50/50 border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-600" /> Registered
                  Email
                </span>
                <Badge
                  variant="outline"
                  className="text-emerald-800 bg-emerald-100 border-emerald-300 text-[10px] font-bold gap-1"
                >
                  <Check className="w-3 h-3 text-emerald-700" /> Email Verified
                </Badge>
              </div>
              <p className="font-medium text-xs text-stone-950">
                {priest?.email || user?.email || "Email pending"}
              </p>
              <p className="text-[11px] text-stone-600">
                Booking updates, scheduling notifications, and platform alerts.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Vedic Lineage & Bio */}
      <div className="rounded-xl border-2 border-amber-300 bg-white p-6 sm:p-8 shadow-sm space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
          <BookOpen className="w-4 h-4 text-red-700" />
          <h3 className="text-base font-serif font-bold text-stone-950">
            Vedic Lineage & Bio
          </h3>
        </div>
        <p className="text-xs text-stone-600">
          Describe your Gurukul education, Veda shakha, training, and spiritual
          background.
        </p>
        <Textarea
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Vedic scholar trained in Varanasi Gurukul. Specializes in Griha Pravesh, Vastu Shanti, and Satyanarayan Katha with over 18 years of ritual expertise..."
          className="text-xs leading-relaxed resize-y rounded-md border-stone-300 focus:ring-amber-500 bg-white"
        />
        <div className="flex justify-between items-center text-[11px] text-stone-500 pt-1 font-medium">
          <span>
            Minimum 20 characters. Authentic background helps devotees build
            trust.
          </span>
          <span>{bio.length} characters</span>
        </div>
      </div>

      {/* 6 & 7. Languages & Offerings Deck (100% Flexbox, Zero CSS Grids) */}
      <div className="flex flex-col md:flex-row items-stretch gap-6 w-full">
        {/* Languages Spoken */}
        <div className="flex-1 rounded-xl border-2 border-amber-300 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <div className="flex items-center gap-2">
              <LanguagesIcon className="w-4 h-4 text-red-700" />
              <h3 className="text-base font-serif font-bold text-stone-950">
                Languages Spoken ({languages.length})
              </h3>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSave}
              disabled={isSaving}
              className="text-xs h-8 px-3 border-amber-300 text-stone-800 hover:bg-amber-50 cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />}
              Save Languages
            </Button>
          </div>
          <p className="text-xs text-stone-600">
            Select all Vedic and regional languages you can perform mantras and
            katha in.
          </p>

          <div className="flex flex-wrap gap-2">
            {POPULAR_LANGUAGES.map((lang) => {
              const isSelected = languages.includes(lang);
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={`px-3.5 py-1.5 rounded-sm text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-[#780016] text-white border-amber-400 shadow-xs"
                      : "bg-white text-stone-700 hover:bg-amber-50 border-stone-300"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-amber-300" />}
                  {lang}
                </button>
              );
            })}
          </div>

          <form
            onSubmit={handleAddCustomLanguage}
            className="flex gap-2 pt-2 border-t border-stone-200"
          >
            <Input
              placeholder="Add other language (e.g. Odia)..."
              value={customLanguage}
              onChange={(e) => setCustomLanguage(e.target.value)}
              className="h-10 text-xs flex-1 rounded-md border-stone-300 focus:ring-amber-500 bg-white"
            />
            <Button
              type="submit"
              size="sm"
              variant="outline"
              className="h-10 text-xs gap-1 rounded-md border-amber-300 font-bold"
            >
              <Plus className="w-3.5 h-3.5 text-amber-600" /> Add
            </Button>
          </form>
        </div>

        {/* Active Puja Services */}
        <div className="flex-1 rounded-xl border-2 border-amber-300 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-stone-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <h3 className="text-base font-serif font-bold text-stone-950">
                Puja Services ({services.filter((s) => s.isActive).length})
              </h3>
            </div>
            <Link to="/priest/services">
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-red-700 hover:text-red-800 border-amber-300 gap-1.5 h-8 px-3 rounded-md font-bold"
              >
                Manage All <ExternalLink className="w-3 h-3" />
              </Button>
            </Link>
          </div>

          <div className="space-y-2.5 text-xs">
            {services.length > 0 ? (
              <div className="space-y-2">
                {services.map((srv) => (
                  <div
                    key={srv.id}
                    className="p-3 rounded-md bg-amber-50/40 border border-amber-200 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                      <span className="font-bold text-stone-900 text-xs truncate">
                        {srv.serviceName}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-xs text-red-800 shrink-0">
                      {formatINR(srv.price)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-stone-500 text-xs">
                No active ceremony offerings.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 8. Service Areas / Localities */}
      <div className="rounded-xl border-2 border-amber-300 bg-white p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-700" />
            <h3 className="text-base font-serif font-bold text-stone-950">
              Service Localities & Neighborhoods ({serviceAreas.length})
            </h3>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleSave}
            disabled={isSaving}
            className="text-xs h-8 px-3 border-amber-300 text-stone-800 hover:bg-amber-50 cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />}
            Save Localities
          </Button>
        </div>
        <p className="text-xs text-stone-600">
          Localities and sectors where you are available to travel for in-home
          pujas.
        </p>

        {/* District Warning Banner if outside */}
        {districtWarning && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-300 text-xs text-red-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-0.5">
              <span className="font-bold block text-red-800">Out of Residing District</span>
              <p className="leading-relaxed">{districtWarning}</p>
            </div>
            <button
              type="button"
              onClick={() => setDistrictWarning(null)}
              className="text-red-700 hover:text-red-950 p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {serviceAreas.map((area) => (
            <Badge
              key={area}
              variant="outline"
              className="pl-3 pr-1.5 py-1 text-xs flex items-center gap-1.5 bg-amber-50/60 border-amber-300 font-bold text-stone-900 rounded-sm"
            >
              <span>{area}</span>
              <button
                type="button"
                onClick={() => handleRemoveArea(area)}
                className="rounded-xs p-0.5 hover:bg-red-700 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>

        <form
          onSubmit={handleAddArea}
          className="flex gap-2 pt-2 border-t border-stone-200 max-w-md"
        >
          <div className="relative flex-1">
            <Input
              placeholder="Add locality or 6-digit PIN (e.g. 700020, Bandra)..."
              value={newAreaInput}
              onChange={(e) => handleAreaInputChange(e.target.value)}
              className="h-10 text-xs rounded-md border-stone-300 focus:ring-amber-500 bg-white pr-8"
            />
            {isSearchingAreaPin && (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600 absolute right-2.5 top-1/2 -translate-y-1/2" />
            )}
          </div>
          <Button
            type="submit"
            size="sm"
            variant="outline"
            className="h-10 text-xs gap-1 rounded-md border-amber-300 font-bold shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-amber-600" /> Add Area
          </Button>
        </form>

        {/* Residing Home PIN Neighborhood Suggestions (hidden when actively searching or dismissed) */}
        {!isHomeSuggestionsDismissed &&
          areaPinSuggestions.length === 0 &&
          !newAreaInput.trim() &&
          residingPinSuggestions.length > 0 && (
            <div className="p-3.5 rounded-lg bg-emerald-50/80 border border-emerald-300 space-y-2.5 max-w-xl transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  Home District Neighborhoods for PIN {pincode} ({residingPinSuggestions[0]?.city || district || ""}):
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddAllResidingSuggestions}
                    className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                  >
                    + Add All ({residingPinSuggestions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsHomeSuggestionsDismissed(true)}
                    className="text-emerald-800 hover:text-emerald-950 p-0.5 rounded cursor-pointer"
                    title="Dismiss suggestions"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {residingPinSuggestions.map((homeLocality) => {
                  const formatted = `${homeLocality.pincode} - ${homeLocality.name}`;
                  const isAlreadyAdded =
                    serviceAreas.includes(formatted) || serviceAreas.includes(homeLocality.name);
                  return (
                    <button
                      key={homeLocality.name}
                      type="button"
                      disabled={isAlreadyAdded}
                      onClick={() => handleSelectAreaSuggestion(homeLocality)}
                      className={`text-xs px-2.5 py-1 rounded-md border transition-all flex items-center gap-1 cursor-pointer ${
                        isAlreadyAdded
                          ? "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed"
                          : "bg-white text-stone-900 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400 shadow-2xs font-semibold"
                      }`}
                    >
                      <span>{isAlreadyAdded ? "✓" : "+"}</span>
                      <span>{homeLocality.name}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-stone-500">
                Localities automatically matched to your home PIN address in {district || city}.
              </p>
            </div>
          )}

        {/* Dynamic PIN Code Suggestions Panel */}
        {areaPinSuggestions.length > 0 && (
          <div className="p-3.5 rounded-lg bg-amber-50/80 border border-amber-300 space-y-2.5 max-w-xl transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-700" />
                Localities for PIN {areaPinQuery} ({areaPinSuggestions[0]?.city || ""}, {areaPinSuggestions[0]?.state || ""}):
              </span>
              <button
                type="button"
                onClick={handleAddAllSuggestions}
                className="text-[11px] font-bold text-red-800 hover:text-red-950 underline cursor-pointer"
              >
                + Add All ({areaPinSuggestions.length})
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {areaPinSuggestions.map((localitySuggestion) => {
                const formatted = `${localitySuggestion.pincode} - ${localitySuggestion.name}`;
                const isAlreadyAdded =
                  serviceAreas.includes(formatted) || serviceAreas.includes(localitySuggestion.name);
                return (
                  <button
                    key={localitySuggestion.name}
                    type="button"
                    disabled={isAlreadyAdded}
                    onClick={() => handleSelectAreaSuggestion(localitySuggestion)}
                    className={`text-xs px-2.5 py-1 rounded-md border transition-all flex items-center gap-1 cursor-pointer ${
                      isAlreadyAdded
                        ? "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed"
                        : "bg-white text-stone-900 border-amber-300 hover:bg-amber-100 hover:border-amber-400 shadow-2xs"
                    }`}
                  >
                    <span>{isAlreadyAdded ? "✓" : "+"}</span>
                    <span className="font-semibold">{localitySuggestion.name}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-stone-500">
              Click any locality suggestion to add it to your travel-eligible puja service areas.
            </p>
          </div>
        )}
      </div>

      {/* 9. Bottom Action Bar */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="gap-2 text-xs font-bold px-7 h-11 bg-[#780016] hover:bg-red-800 text-white border border-amber-400 rounded-md shadow-xs cursor-pointer puja-btn-tap"
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
