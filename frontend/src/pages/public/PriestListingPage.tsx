import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { priestApi } from '@/api/priest.api';
import { addressApi, PincodeLocation } from '@/api/address.api';
import { Priest } from '@/types/priest.types';
import { PriestCard } from '@/components/priest/PriestCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Sparkles,
  Award,
  Languages,
  X,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Flame,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const POPULAR_LANGUAGES = [
  'All',
  'Sanskrit',
  'Hindi',
  'Bengali',
  'Marathi',
  'Gujarati',
  'Kannada',
  'Tamil',
  'Telugu',
];

const EXPERIENCE_TIERS = [
  { label: 'Any Exp', value: 0 },
  { label: '5+ Yrs', value: 5 },
  { label: '10+ Yrs', value: 10 },
  { label: '15+ Yrs', value: 15 },
  { label: '20+ Yrs Acharyas', value: 20 },
];

const QUICK_CEREMONY_TAGS = [
  'Griha Pravesh',
  'Satyanarayan Katha',
  'Rudrabhishek',
  'Navagraha Shanti',
  'Ganapati Havan',
  'Vastu Shanti',
];

export const PriestListingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const catalogIdParam = searchParams.get('catalogId') || '';
  const serviceParam = searchParams.get('service') || '';
  const initialQuery = searchParams.get('searchQuery') || serviceParam || '';

  const [priests, setPriests] = useState<Priest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeCatalogId, setActiveCatalogId] = useState<string>(catalogIdParam);
  const [activeServiceName, setActiveServiceName] = useState<string>(serviceParam);
  const [activeLanguage, setActiveLanguage] = useState<string>('All');
  const pincodeParam = searchParams.get('pincode') || '';
  const [pincode, setPincode] = useState<string>(pincodeParam);
  const [pincodeLocation, setPincodeLocation] = useState<PincodeLocation | null>(null);
  const [activeMinExp, setActiveMinExp] = useState<number>(0);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const appliedFiltersCount =
    (activeLanguage !== 'All' ? 1 : 0) + (activeMinExp > 0 ? 1 : 0) + (activeCatalogId ? 1 : 0) + (pincode ? 1 : 0);
  const hasActiveFilters = searchQuery !== '' || appliedFiltersCount > 0 || activeCatalogId !== '' || pincode !== '';

  const fetchPriests = async (query = searchQuery) => {
    setIsLoading(true);
    try {
      // Devotee discovery: Only approved and active priests appear (status 'ALL' omitted)
      const cleanPin = pincode.trim().replace(/\D/g, '');
      const data = await priestApi.getPriests({
        searchQuery: query || undefined,
        pincode: cleanPin.length === 6 ? cleanPin : undefined,
        catalogId: activeCatalogId || undefined,
        serviceName: activeServiceName || undefined,
        language: activeLanguage !== 'All' ? activeLanguage : undefined,
        minExperience: activeMinExp > 0 ? activeMinExp : undefined,
      });
      setPriests(data || []);
    } finally {
      setIsLoading(false);
    }
  };

  // Postal lookup effect when user enters a 6-digit PINCODE
  useEffect(() => {
    const cleanPin = pincode.trim().replace(/\D/g, '');
    if (cleanPin.length === 6) {
      addressApi.lookupPincode(cleanPin).then((res) => {
        if (res.locations && res.locations.length > 0) {
          setPincodeLocation(res.locations[0]);
        } else {
          setPincodeLocation(null);
        }
      });
    } else {
      setPincodeLocation(null);
    }
  }, [pincode]);

  // Live debounced search & filter reaction
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPriests(searchQuery);
      const newParams: Record<string, string> = {};
      if (searchQuery) newParams.searchQuery = searchQuery;
      if (pincode) newParams.pincode = pincode;
      if (activeCatalogId) newParams.catalogId = activeCatalogId;
      if (activeServiceName) newParams.service = activeServiceName;
      setSearchParams(newParams);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, pincode, activeCatalogId, activeServiceName, activeLanguage, activeMinExp]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setPincode('');
    setPincodeLocation(null);
    setActiveCatalogId('');
    setActiveServiceName('');
    setActiveLanguage('All');
    setActiveMinExp(0);
    setSearchParams({});
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header Banner */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-sm bg-amber-100 border border-amber-300 text-stone-900 text-xs font-bold">
          <Sparkles className="h-3.5 w-3.5 text-amber-700" />
          <span>Vedic Purohit Directory • Gurukul Acharyas</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
          Find an Accredited Priest for Your Puja
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-3xl leading-relaxed">
          Discover verified Gurukul scholars and Acharyas across all Vedic traditions. Transparent dakshina with direct cash payment after puja completion.
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm bg-red-100 text-red-900 font-semibold">
            <ShieldCheck className="h-3.5 w-3.5 text-red-700" /> 100% Lineage Verified
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm bg-amber-100 text-amber-900 font-semibold">
            <Flame className="h-3.5 w-3.5 text-amber-700" /> Complete Vidhi & Samagri List
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-900 font-semibold">
            ✓ Zero Online Advance
          </span>
        </div>
      </div>

      {/* Search & Filter Control Hub */}
      <div className="bg-white border-2 border-amber-300 rounded-lg shadow-xs overflow-hidden p-4 sm:p-5 space-y-4">
        {/* 1. Live Search Bar, Indian PINCODE & Filters Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-stone-500" />
            <Input
              placeholder="Search ceremony or priest (e.g. Satyanarayan, Rudrabhishek)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9 text-xs sm:text-sm h-10 rounded-md border-amber-300 focus-visible:ring-2 focus-visible:ring-red-700"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-stone-400 hover:text-stone-700 cursor-pointer"
                aria-label="Clear search query"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* 6-Digit Indian Postal PINCODE Filter */}
          <div className="relative w-full sm:w-44 shrink-0">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-red-700" />
            <Input
              placeholder="PIN Code (e.g. 700019)"
              maxLength={6}
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="pl-9 pr-8 text-xs sm:text-sm h-10 rounded-md border-amber-300 focus-visible:ring-2 focus-visible:ring-red-700 font-mono font-bold"
            />
            {pincode && (
              <button
                type="button"
                onClick={() => setPincode('')}
                className="absolute right-2.5 top-3 text-stone-400 hover:text-stone-700 cursor-pointer"
                aria-label="Clear PIN code"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Collapsible Filter Button */}
          <Button
            type="button"
            variant={isFiltersOpen || appliedFiltersCount > 0 ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className={`h-10 text-xs gap-1.5 px-3.5 sm:px-4 font-bold shrink-0 cursor-pointer rounded-md ${
              isFiltersOpen || appliedFiltersCount > 0
                ? 'bg-red-700 hover:bg-red-800 text-white'
                : 'border-2 border-amber-300 text-stone-800 hover:bg-amber-50'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {appliedFiltersCount > 0 && (
              <span className="h-4 min-w-4 px-1 rounded-sm bg-white text-red-700 text-[10px] font-bold flex items-center justify-center">
                {appliedFiltersCount}
              </span>
            )}
            {isFiltersOpen ? (
              <ChevronUp className="h-3.5 w-3.5 opacity-75" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 opacity-75" />
            )}
          </Button>
        </div>

        {/* Verified Postal PIN Locality Match Badge */}
        {pincode.length === 6 && (
          <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-300 rounded-md text-xs text-emerald-950 font-medium">
            <MapPin className="h-4 w-4 text-emerald-700 shrink-0" />
            <span className="flex-1">
              Matching priests serving PIN <strong>{pincode}</strong>
              {pincodeLocation ? ` (${pincodeLocation.locality || pincodeLocation.city}, ${pincodeLocation.district}, ${pincodeLocation.state})` : ''}
            </span>
            <button
              type="button"
              onClick={() => setPincode('')}
              className="text-stone-500 hover:text-stone-800 p-1 rounded-sm cursor-pointer flex items-center gap-1 font-semibold"
              title="Clear PIN code"
            >
              <span>Clear</span>
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Active Ceremony Filter Badge */}
        {activeServiceName && (
          <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-950">
            <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
            <span className="flex-1">
              Filtering priests for ceremony: <strong>{activeServiceName}</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                setActiveCatalogId('');
                setActiveServiceName('');
                setSearchQuery('');
              }}
              className="text-stone-500 hover:text-stone-800 p-1 rounded-sm cursor-pointer flex items-center gap-1 font-semibold"
              title="Remove filter"
            >
              <span>Clear</span>
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Quick Ceremony Suggestion Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider mr-1">
            Popular:
          </span>
          {QUICK_CEREMONY_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSearchQuery(tag)}
              className={cn(
                'px-2.5 py-1 rounded-sm text-xs transition-colors cursor-pointer',
                searchQuery.toLowerCase().includes(tag.toLowerCase())
                  ? 'bg-red-700 text-white font-bold'
                  : 'bg-stone-100 hover:bg-amber-100 text-stone-700 border border-stone-200'
              )}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* 2. Collapsible Filter Chips Tray */}
        {isFiltersOpen && (
          <div className="space-y-4 pt-3 border-t border-amber-200">
            {/* Language Filter Pills */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                <Languages className="h-3.5 w-3.5 text-red-700" />
                <span>Preferred Vedic / Regional Language</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {POPULAR_LANGUAGES.map((lang) => {
                  const isSelected = activeLanguage.toLowerCase() === lang.toLowerCase();
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setActiveLanguage(lang)}
                      className={cn(
                        'px-3 py-1 rounded-sm text-xs transition-all cursor-pointer select-none font-semibold',
                        isSelected
                          ? 'bg-red-700 text-white shadow-xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-amber-100 border border-stone-200'
                      )}
                    >
                      {lang}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Experience Level Segmented Selector */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                <Award className="h-3.5 w-3.5 text-amber-600" />
                <span>Minimum Shastric Experience</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {EXPERIENCE_TIERS.map((tier) => {
                  const isSelected = activeMinExp === tier.value;
                  return (
                    <button
                      key={tier.value}
                      type="button"
                      onClick={() => setActiveMinExp(tier.value)}
                      className={cn(
                        'px-3 py-1 rounded-sm text-xs transition-all cursor-pointer select-none font-semibold',
                        isSelected
                          ? 'bg-amber-500 text-stone-950 shadow-xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-amber-100 border border-stone-200'
                      )}
                    >
                      {tier.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 3. Filter Status Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-amber-100 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-stone-700 font-bold">
              {priests.length} {priests.length === 1 ? 'Verified Purohit available' : 'Verified Purohits available'}
            </span>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-red-700 hover:underline font-bold ml-1 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset filters</span>
              </button>
            )}
          </div>

          {appliedFiltersCount > 0 && !isFiltersOpen && (
            <button
              type="button"
              onClick={() => setIsFiltersOpen(true)}
              className="text-[11px] text-red-700 hover:underline font-bold cursor-pointer"
            >
              {activeLanguage !== 'All' ? `${activeLanguage}` : ''}
              {activeLanguage !== 'All' && activeMinExp > 0 ? ' • ' : ''}
              {activeMinExp > 0 ? `${activeMinExp}+ Yrs Exp` : ''} (Edit)
            </button>
          )}
        </div>
      </div>

      {/* Priest Cards Flex Container (Zero Grids) */}
      {isLoading ? (
        <div className="text-center py-16 text-xs text-stone-500 font-medium">
          Connecting to Vedic scholar directory...
        </div>
      ) : priests.length === 0 ? (
        <div className="border-2 border-amber-300 bg-white text-center py-14 px-4 shadow-xs rounded-xl">
          <div className="max-w-md mx-auto space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-amber-100 text-red-700 border-2 border-amber-300">
              <Search className="h-6 w-6" />
            </div>
            <h2 className="text-base font-bold font-serif text-stone-900">
              {pincode.length === 6 ? `No Purohits Currently Serving PIN ${pincode}` : 'No Priests Found'}
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              {pincode.length === 6
                ? `We could not find any active verified priests serving PIN ${pincode}${pincodeLocation ? ` in ${pincodeLocation.locality || pincodeLocation.district}` : ''}. Try searching a nearby PIN code or reset your location filter.`
                : 'No verified priests matched your search criteria. Try selecting another ceremony or resetting your filters.'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="text-xs gap-1.5 border-2 border-amber-300 rounded-md cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Clear All Filters</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 w-full">
          {priests.map((priest) => (
            <PriestCard key={priest.id} priest={priest} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PriestListingPage;

