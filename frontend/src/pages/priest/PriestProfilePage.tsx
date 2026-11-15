import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { priestApi } from "@/api/priest.api";
import { Priest, PriestService } from "@/types/priest.types";
import { updatePriestProfileSchema } from "@/schemas/priest.schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Phone,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { formatINR, formatLocalityName, areDistrictsEquivalent } from "@/lib/utils";

// Modular Subcomponents
import { PriestProfileHeaderCard } from "@/components/priest/profile/PriestProfileHeaderCard";
import { PriestBasicInfoForm } from "@/components/priest/profile/PriestBasicInfoForm";
import { PriestVedicBioCard } from "@/components/priest/profile/PriestVedicBioCard";
import { PriestLanguagesSelector } from "@/components/priest/profile/PriestLanguagesSelector";
import { PriestServiceAreasManager } from "@/components/priest/profile/PriestServiceAreasManager";
import { ChangePasswordCard } from "@/components/common/ChangePasswordCard";

/**
 * ============================================================================
 * [PAGE: PRIEST PROFILE & CREDENTIALS]
 * Modular Vedic scholar profile, Gurukul lineage, languages, localities,
 * and offerings coordinator.
 * 100% Flexbox, zero CSS grids, pure solid white canvas, Haldi gold trims.
 * ============================================================================
 */
export const PriestProfilePage: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const priestId = user?.id || "";
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

  // Postal PIN Code Search States
  const [areaPinInput, setAreaPinInput] = useState("");
  const [areaPinSuggestions, setAreaPinSuggestions] = useState<
    Array<{ name: string; city: string; state: string; district?: string; pincode: string }>
  >([]);
  const [residingPinSuggestions, setResidingPinSuggestions] = useState<
    Array<{ name: string; city: string; state: string; district?: string; pincode: string }>
  >([]);
  const [isHomeSuggestionsDismissed, setIsHomeSuggestionsDismissed] = useState(false);
  const [isSearchingAreaPin, setIsSearchingAreaPin] = useState(false);
  const [districtWarning, setDistrictWarning] = useState<string | null>(null);

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
        setPincode(p.pincode || "");
        setCity(p.city || "");
        setDistrict((p as any).district || p.city || "");
        setState(p.state || "West Bengal");
        setBio(p.bio || "");
        setProfileImageUrl(p.profileImageUrl || "");
        setLanguages(p.languages || ["Sanskrit", "Hindi", "Bengali"]);
        setServiceAreas(p.serviceAreas || []);
      }
      setServices(srvList || []);
    } catch {
      toast.error("Failed to load priest profile.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [priestId]);

  // Synchronize partial profile updates (languages, localities)
  const syncProfileField = async (partialUpdates: { languages?: string[]; serviceAreas?: string[] }) => {
    try {
      const sanitizedAreas = partialUpdates.serviceAreas
        ? Array.from(new Set(partialUpdates.serviceAreas.map(formatLocalityName).filter(Boolean)))
        : Array.from(new Set(serviceAreas.map(formatLocalityName).filter(Boolean)));

      const payload = {
        fullName: fullName.trim() || priest?.fullName || user?.name || "Purohit",
        displayName: fullName.trim() || priest?.displayName || user?.name || "Purohit",
        experienceYears: Number(experienceYears) || priest?.experienceYears || 0,
        bio: bio.trim() || priest?.bio || "",
        languages: partialUpdates.languages ?? languages,
        serviceAreas: sanitizedAreas,
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

  // Language management
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

  // Residing PIN code lookup
  const handlePincodeLookup = async (pinValue: string) => {
    const cleanDigits = pinValue.replace(/\D/g, "");
    setPincode(cleanDigits);

    if (cleanDigits.length === 6) {
      setIsSearchingPin(true);
      try {
        const res = await priestApi.lookupPincode(cleanDigits);
        if (res?.locations && res.locations.length > 0) {
          const loc = res.locations[0];
          const detectedCity = loc.city || loc.district || "";
          const detectedDistrict = loc.district || loc.city || "";
          const detectedState = loc.state || "";

          setCity(detectedCity);
          setDistrict(detectedDistrict);
          setState(detectedState);

          const unique = new Map<string, { name: string; city: string; state: string; district: string; pincode: string }>();
          res.locations.forEach((item: any) => {
            const name = item.locality || item.villageTown || item.postOffice;
            if (name && !unique.has(name)) {
              unique.set(name, {
                name,
                city: item.city || item.district || "",
                district: item.district || detectedDistrict,
                state: item.state || "",
                pincode: cleanDigits,
              });
            }
          });
          setResidingPinSuggestions(Array.from(unique.values()));
          setIsHomeSuggestionsDismissed(false);
          toast.success(`PIN detected: ${detectedCity} (${detectedDistrict}), ${detectedState}`);
        }
      } catch {
        toast.error("Failed to detect location from PIN code.");
      } finally {
        setIsSearchingPin(false);
      }
    }
  };

  // Service Localities PIN code search
  const triggerServiceAreaLookup = async (cleanDigits: string) => {
    if (cleanDigits.length !== 6) {
      toast.error("Please enter a valid 6-digit PIN code.");
      return;
    }

    setIsSearchingAreaPin(true);
    setDistrictWarning(null);

    try {
      const res = await priestApi.lookupPincode(cleanDigits);
      if (res?.locations && res.locations.length > 0) {
        const primaryLocation = res.locations[0];
        const candidateDistrict = primaryLocation.district || primaryLocation.city || "";
        const residingDistrict = district || city;

        if (residingDistrict && candidateDistrict && !areDistrictsEquivalent(candidateDistrict, residingDistrict)) {
          const warningMsg = `PIN ${cleanDigits} is in ${candidateDistrict} (${primaryLocation.state}), which is outside your residing district (${residingDistrict}). Purohits can only serve localities within their home district.`;
          setDistrictWarning(warningMsg);
          toast.error(warningMsg);
          setAreaPinSuggestions([]);
          return;
        }

        const unique = new Map<string, { name: string; city: string; state: string; district: string; pincode: string }>();
        res.locations.forEach((item: any) => {
          const name = item.locality || item.villageTown || item.postOffice;
          if (name && !unique.has(name)) {
            unique.set(name, {
              name,
              city: item.city || item.district || "",
              district: item.district || candidateDistrict,
              state: item.state || "",
              pincode: cleanDigits,
            });
          }
        });
        setAreaPinSuggestions(Array.from(unique.values()));
      } else {
        setAreaPinSuggestions([]);
        toast.error(`No postal localities found for PIN ${cleanDigits}.`);
      }
    } catch {
      setAreaPinSuggestions([]);
      toast.error("Failed to lookup PIN code. Please try again.");
    } finally {
      setIsSearchingAreaPin(false);
    }
  };

  const handleAddLocality = (loc: { name: string }) => {
    const localityName = formatLocalityName(loc.name);
    if (!serviceAreas.some((a) => formatLocalityName(a).toLowerCase() === localityName.toLowerCase())) {
      const updated = [...serviceAreas, localityName];
      setServiceAreas(updated);
      setDistrictWarning(null);
      toast.success(`Added ${localityName} to your service areas.`);
      syncProfileField({ serviceAreas: updated });
    }
  };

  const handleAddAllSuggestions = () => {
    let addedCount = 0;
    const toAdd: string[] = [];
    areaPinSuggestions.forEach((s) => {
      const localityName = formatLocalityName(s.name);
      if (
        !serviceAreas.some((a) => formatLocalityName(a).toLowerCase() === localityName.toLowerCase()) &&
        !toAdd.includes(localityName)
      ) {
        toAdd.push(localityName);
        addedCount++;
      }
    });
    if (addedCount > 0) {
      const updated = [...serviceAreas, ...toAdd];
      setServiceAreas(updated);
      setDistrictWarning(null);
      toast.success(`Added ${addedCount} localities.`);
      syncProfileField({ serviceAreas: updated });
    }
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

  // Profile Save
  const handleSaveProfile = async () => {
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
      toast.error(parseResult.error.errors[0]?.message || "Invalid profile information.");
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

  // Avatar upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      setProfileImageUrl(dataUrl);

      try {
        const res = await priestApi.updatePriestProfile(priestId, {
          profileImageUrl: dataUrl,
        });

        if (res.success && res.data?.profileImageUrl) {
          setProfileImageUrl(res.data.profileImageUrl);
          if (user) {
            setUser({ ...user, avatarUrl: res.data.profileImageUrl });
          }
          toast.success("Profile photo uploaded successfully!");
        }
      } catch {
        toast.error("Failed to upload profile photo.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = async () => {
    setProfileImageUrl("");
    if (user) {
      setUser({ ...user, avatarUrl: undefined });
    }
    try {
      await priestApi.updatePriestProfile(priestId, { profileImageUrl: "" });
      toast.success("Profile picture removed.");
    } catch {
      toast.error("Failed to remove profile picture.");
    }
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

      {/* 1. Header Banner */}
      <div className="p-4 sm:p-6 lg:p-7 rounded-xl border-2 border-amber-300 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
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
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-serif text-stone-950 mt-1">
          Vedic Profile & Credentials
        </h1>
        <p className="text-xs text-stone-600">
          Manage your credentials, Gurukul lineage, languages, service localities, and puja offerings.
        </p>
      </div>

      {/* 2. Top Summary Card */}
      <PriestProfileHeaderCard
        priest={priest}
        fullName={fullName}
        experienceYears={experienceYears}
        city={city}
        state={state}
        profileImageUrl={profileImageUrl}
        serviceAreasCount={serviceAreas.length}
        onAvatarClick={() => fileInputRef.current?.click()}
        onRemoveAvatar={handleRemoveAvatar}
      />

      {/* 3. Core Profile & Lineage Form */}
      <div className="flex flex-col lg:flex-row items-start gap-4 sm:gap-6 w-full">
        {/* Left Column */}
        <div className="flex-1 w-full flex flex-col gap-4 sm:gap-6">
          <PriestBasicInfoForm
            fullName={fullName}
            setFullName={setFullName}
            experienceYears={experienceYears}
            setExperienceYears={setExperienceYears}
            pincode={pincode}
            city={city}
            district={district}
            state={state}
            isSearchingPin={isSearchingPin}
            onPincodeChange={(val) => {
              const digits = val.replace(/\D/g, "").slice(0, 6);
              setPincode(digits);
              if (digits.length === 6) handlePincodeLookup(digits);
            }}
            onPincodeLookup={handlePincodeLookup}
            residingPinSuggestions={residingPinSuggestions}
            isHomeSuggestionsDismissed={isHomeSuggestionsDismissed}
            onSelectNeighborhood={handleAddLocality}
            onDismissHomeSuggestions={() => setIsHomeSuggestionsDismissed(true)}
          />

          <PriestVedicBioCard
            bio={bio}
            setBio={setBio}
            isSaving={isSaving}
            onSave={handleSaveProfile}
          />
        </div>

        {/* Right Column: Contact Channels, Security & Credentials */}
        <div className="w-full lg:w-96 flex flex-col gap-4 sm:gap-6">
          {/* Verified Contact Channels */}
          <div className="rounded-xl border-2 border-amber-300 bg-white p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
              <Phone className="w-4 h-4 text-emerald-700" />
              <h3 className="text-base font-serif font-bold text-stone-950">
                Verified Communication Channels
              </h3>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-md">
                <span className="text-stone-500 font-bold block mb-1">
                  Registered Mobile
                </span>
                <span className="font-mono font-bold text-stone-900">
                  {user?.phoneNumber || priest?.phoneNumber || "Phone Not Registered"}
                </span>
              </div>
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-md">
                <span className="text-stone-500 font-bold block mb-1">
                  Registered Email
                </span>
                <span className="font-bold text-stone-900 break-all">
                  {user?.email || priest?.email || "Email Not Registered"}
                </span>
              </div>
            </div>
          </div>

          {/* Security & Credentials (Shared ChangePasswordCard) */}
          <ChangePasswordCard
            title="Security & Credentials"
            description="Update your password regularly to protect your booking appointments."
            buttonLabel="Update Purohit Password"
            onUpdatePassword={async ({ currentPassword, newPassword, confirmPassword }) => {
              return priestApi.changePassword({
                currentPassword,
                newPassword,
                confirmPassword,
              });
            }}
          />
        </div>
      </div>

      {/* 4. Languages Selector */}
      <PriestLanguagesSelector
        selectedLanguages={languages}
        onToggleLanguage={toggleLanguage}
      />

      {/* 5. Puja Services Offerings Summary */}
      <div className="rounded-xl border-2 border-amber-300 bg-white p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <h3 className="text-base font-serif font-bold text-stone-950">
              Puja Services ({services.length})
            </h3>
          </div>
          <Link to="/priest/services">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs gap-1.5 border-amber-300 text-stone-800 font-bold hover:bg-amber-50"
            >
              Manage Services
              <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
            </Button>
          </Link>
        </div>

        {services.length > 0 ? (
          <div className="flex flex-col gap-2">
            {services.map((srv) => (
              <div
                key={srv.id}
                className="p-3 rounded-lg border border-amber-200 bg-amber-50/30 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-xs font-bold text-stone-900">
                    {srv.serviceName}
                  </span>
                </div>
                <span className="text-xs font-serif font-black text-amber-900">
                  {formatINR(srv.price)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-stone-500 italic">
            No ceremony offerings configured yet. Click "Manage Services" to select pujas you conduct.
          </p>
        )}
      </div>

      {/* 6. Service Localities & Neighborhoods */}
      <PriestServiceAreasManager
        serviceAreas={serviceAreas}
        areaPinInput={areaPinInput}
        isSearchingAreaPin={isSearchingAreaPin}
        areaPinSuggestions={areaPinSuggestions}
        districtWarning={districtWarning}
        onAreaPinInputChange={(val) => {
          const cleanDigits = val.replace(/\D/g, "").slice(0, 6);
          setAreaPinInput(cleanDigits);
          setDistrictWarning(null);
          if (cleanDigits.length === 6) triggerServiceAreaLookup(cleanDigits);
        }}
        onSearchPinSubmit={(e) => {
          e.preventDefault();
          triggerServiceAreaLookup(areaPinInput);
        }}
        onAddLocality={handleAddLocality}
        onAddAllSuggestions={handleAddAllSuggestions}
        onRemoveServiceArea={handleRemoveArea}
      />
    </div>
  );
};

export default PriestProfilePage;
