import React from 'react';
import { User, BookOpen, Search, Loader2, Sparkles, MapPin, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface LocalitySuggestion {
  name: string;
  city: string;
  state: string;
  district?: string;
  pincode: string;
}

interface PriestBasicInfoFormProps {
  fullName: string;
  setFullName: (name: string) => void;
  experienceYears: number;
  setExperienceYears: (years: number) => void;
  pincode: string;
  city: string;
  district: string;
  state: string;
  isSearchingPin: boolean;
  onPincodeChange: (pin: string) => void;
  onPincodeLookup: (pin: string) => void;
  residingPinSuggestions: LocalitySuggestion[];
  isHomeSuggestionsDismissed: boolean;
  onSelectNeighborhood: (loc: LocalitySuggestion) => void;
  onDismissHomeSuggestions: () => void;
}

/**
 * ============================================================================
 * [COMPONENT: PRIEST BASIC INFO FORM]
 * Purohit legal identity, experience years, and residing PIN code directory lookup.
 * ============================================================================
 */
export const PriestBasicInfoForm: React.FC<PriestBasicInfoFormProps> = ({
  fullName,
  setFullName,
  experienceYears,
  setExperienceYears,
  pincode,
  city,
  district,
  state,
  isSearchingPin,
  onPincodeChange,
  onPincodeLookup,
  residingPinSuggestions,
  isHomeSuggestionsDismissed,
  onSelectNeighborhood,
  onDismissHomeSuggestions,
}) => {
  return (
    <div className="rounded-xl border-2 border-amber-300 bg-white p-4 sm:p-6 shadow-sm space-y-4">
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
              6-Digit Residing PIN Code *
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
              onChange={(e) => onPincodeChange(e.target.value)}
              placeholder="e.g. 700001"
              className="h-10 text-xs font-mono tracking-wider rounded-md border-stone-300 focus:ring-amber-500 bg-white"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onPincodeLookup(pincode)}
              disabled={isSearchingPin || pincode.length !== 6}
              className="h-10 text-xs gap-1 shrink-0 rounded-md border-amber-300 font-bold"
            >
              <Search className="w-3.5 h-3.5 text-amber-600" /> Lookup
            </Button>
          </div>

          {/* Quick Select from Post Office localities */}
          {residingPinSuggestions.length > 0 && !isHomeSuggestionsDismissed && (
            <div className="mt-2 p-2.5 rounded-lg border border-amber-300 bg-amber-50/70 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-700" />
                  Select your exact home neighborhood:
                </div>
                <button
                  type="button"
                  onClick={onDismissHomeSuggestions}
                  className="text-stone-400 hover:text-stone-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {residingPinSuggestions.map((loc, idx) => (
                  <button
                    key={`${loc.name}-${idx}`}
                    type="button"
                    onClick={() => onSelectNeighborhood(loc)}
                    className="px-2 py-1 rounded bg-white hover:bg-amber-100 border border-amber-300 text-[11px] text-stone-800 font-medium transition-colors flex items-center gap-1"
                  >
                    <MapPin className="w-3 h-3 text-amber-700 shrink-0" />
                    <span>{loc.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Location Summary Pill */}
          {(city || state) && (
            <div className="p-3 bg-amber-50/60 rounded-md border border-amber-200 mt-2 space-y-1">
              <div className="font-bold text-amber-950 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-700" />
                Detected Jurisdiction:
              </div>
              <p className="text-stone-700 text-[11px]">
                <span className="font-semibold text-stone-900">
                  {city || district || 'City'}
                </span>
                {district && district !== city ? ` (${district} District)` : ''}
                {state ? `, ${state}` : ''}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
