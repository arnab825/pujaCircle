import React from 'react';
import { MapPin, Search, Loader2, Sparkles, AlertCircle, X, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatLocalityName } from '@/lib/utils';
import { LocalitySuggestion } from '@/types/priest.types';

interface PriestServiceAreasManagerProps {
  serviceAreas: string[];
  areaPinInput: string;
  isSearchingAreaPin: boolean;
  areaPinSuggestions: LocalitySuggestion[];
  districtWarning: string | null;
  onAreaPinInputChange: (val: string) => void;
  onSearchPinSubmit: (e: React.FormEvent) => void;
  onAddLocality: (loc: LocalitySuggestion) => void;
  onAddAllSuggestions: () => void;
  onRemoveServiceArea: (area: string) => void;
}

/**
 * ============================================================================
 * [COMPONENT: PRIEST SERVICE AREAS MANAGER]
 * Postal PIN code search, locality chips, and district restriction verification.
 * ============================================================================
 */
export const PriestServiceAreasManager: React.FC<PriestServiceAreasManagerProps> = ({
  serviceAreas,
  areaPinInput,
  isSearchingAreaPin,
  areaPinSuggestions,
  districtWarning,
  onAreaPinInputChange,
  onSearchPinSubmit,
  onAddLocality,
  onAddAllSuggestions,
  onRemoveServiceArea,
}) => {
  return (
    <div className="rounded-xl border-2 border-amber-300 bg-white p-4 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-red-700" />
          <h3 className="text-base font-serif font-bold text-stone-950">
            Service Localities & Neighborhoods ({serviceAreas.length})
          </h3>
        </div>
        <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          Auto-saved
        </span>
      </div>

      <p className="text-xs text-stone-600">
        Devotees in these neighborhoods will see your profile in ceremony search results. Purohits can serve any locality within their home district.
      </p>

      {/* Current Service Areas Chip List */}
      <div className="flex flex-wrap gap-2 min-h-12 p-3 rounded-lg border border-amber-200 bg-amber-50/40">
        {serviceAreas.length > 0 ? (
          serviceAreas.map((area) => {
            const cleanName = formatLocalityName(area);
            return (
              <span
                key={area}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-amber-300 text-stone-900 shadow-2xs"
              >
                <MapPin className="w-3 h-3 text-red-700 shrink-0" />
                <span>{cleanName}</span>
                <button
                  type="button"
                  onClick={() => onRemoveServiceArea(area)}
                  className="hover:bg-red-50 hover:text-red-700 p-0.5 rounded-full text-stone-400 cursor-pointer transition-colors"
                  title="Remove locality"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })
        ) : (
          <div className="text-xs text-stone-500 italic flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>No service localities added yet. Enter a 6-digit postal PIN code below to add areas.</span>
          </div>
        )}
      </div>

      {/* District Warning Banner */}
      {districtWarning && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">{districtWarning}</div>
        </div>
      )}

      {/* Add Localities Form */}
      <form onSubmit={onSearchPinSubmit} className="space-y-3 pt-2">
        <label className="text-xs font-bold text-stone-800 block">
          Add Localities via 6-Digit PIN Code
        </label>
        <div className="flex gap-2">
          <Input
            value={areaPinInput}
            maxLength={6}
            onChange={(e) => onAreaPinInputChange(e.target.value)}
            placeholder="e.g. 700019"
            className="h-10 text-xs font-mono tracking-wider rounded-md border-stone-300 focus:ring-amber-500 bg-white"
          />
          <Button
            type="submit"
            disabled={isSearchingAreaPin || areaPinInput.replace(/\D/g, '').length !== 6}
            className="h-10 text-xs gap-1.5 shrink-0 bg-[#780016] hover:bg-red-800 text-white font-bold border border-amber-400 rounded-md shadow-xs cursor-pointer"
          >
            {isSearchingAreaPin ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                Find Localities
              </>
            )}
          </Button>
        </div>

        {/* Search Results / Suggestions */}
        {areaPinSuggestions.length > 0 && (
          <div className="p-3 bg-amber-50/70 border border-amber-300 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                Found {areaPinSuggestions.length} Localities for PIN {areaPinInput}:
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddAllSuggestions}
                className="text-[11px] h-7 px-2.5 bg-white border-amber-400 text-amber-900 font-bold hover:bg-amber-100"
              >
                + Add All
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pt-1">
              {areaPinSuggestions.map((loc, idx) => {
                const isAlreadyAdded = serviceAreas.some(
                  (a) => formatLocalityName(a).toLowerCase() === loc.name.toLowerCase()
                );
                return (
                  <button
                    key={`${loc.name}-${idx}`}
                    type="button"
                    onClick={() => onAddLocality(loc)}
                    disabled={isAlreadyAdded}
                    className={`px-2.5 py-1 rounded text-xs font-medium border flex items-center gap-1 transition-all ${
                      isAlreadyAdded
                        ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                        : 'bg-white hover:bg-amber-100 text-stone-800 border-amber-300 cursor-pointer shadow-2xs'
                    }`}
                  >
                    <Plus className="w-3 h-3 text-amber-700" />
                    <span>{loc.name}</span>
                    {isAlreadyAdded && <span className="text-[10px] text-stone-400 ml-1">(Added)</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
