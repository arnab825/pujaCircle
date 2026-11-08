import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { priestApi } from '@/api/priest.api';
import { addressApi } from '@/api/address.api';
import { Address } from '@/types/address.types';
import { useAuthStore } from '@/store/auth.store';
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

  const { user } = useAuthStore();
  const [priests, setPriests] = useState<Priest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Devotee Saved Address State for automatic locality & PIN matching
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isFilterByAddress, setIsFilterByAddress] = useState<boolean>(true);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState<boolean>(false);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeCatalogId, setActiveCatalogId] = useState<string>(catalogIdParam);
  const [activeServiceName, setActiveServiceName] = useState<string>(serviceParam);
  const [activeLanguage, setActiveLanguage] = useState<string>('All');
  const [activeMinExp, setActiveMinExp] = useState<number>(0);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Load devotee's registered addresses on mount (or when updated)
  useEffect(() => {
    async function loadDevoteeAddresses() {
      if (!user?.id || user.role !== 'USER') return;
      setIsLoadingAddresses(true);
      try {
        const addrs = await addressApi.getAddresses(user.id);
        setUserAddresses(addrs || []);
        if (addrs && addrs.length > 0) {
          const defaultAddr = addrs.find((a) => a.isDefault) || addrs[0];
          setSelectedAddressId(defaultAddr.id);
        }
      } catch (err) {
        console.warn('Failed to load devotee addresses:', err);
      } finally {
        setIsLoadingAddresses(false);
      }
    }
    loadDevoteeAddresses();
  }, [user?.id, user?.role]);

  const activeAddress = userAddresses.find((a) => a.id === selectedAddressId) || userAddresses[0] || null;
  const activeDevoteePin = activeAddress
    ? (activeAddress.pincode || activeAddress.pinCode || '').trim().replace(/\D/g, '')
    : '';
  const effectivePincode = isFilterByAddress && activeDevoteePin.length === 6 ? activeDevoteePin : undefined;

  const appliedFiltersCount =
    (activeLanguage !== 'All' ? 1 : 0) +
    (activeMinExp > 0 ? 1 : 0) +
    (activeCatalogId ? 1 : 0) +
    (effectivePincode ? 1 : 0);
  const hasActiveFilters = searchQuery !== '' || appliedFiltersCount > 0 || activeCatalogId !== '';

  // Live debounced search & filter reaction with AbortController to eliminate race conditions
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoading(true);
      try {
        const data = await priestApi.getPriests({
          searchQuery: searchQuery || undefined,
          pincode: effectivePincode,
          catalogId: activeCatalogId || undefined,
          serviceName: activeServiceName || undefined,
          language: activeLanguage !== 'All' ? activeLanguage : undefined,
          minExperience: activeMinExp > 0 ? activeMinExp : undefined,
        });

        if (!controller.signal.aborted) {
          setPriests(data || []);
        }
      } catch (err: any) {
        if (err?.name !== 'CanceledError' && err?.name !== 'AbortError') {
          console.error(err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }

      const newParams: Record<string, string> = {};
      if (searchQuery) newParams.searchQuery = searchQuery;
      if (activeCatalogId) newParams.catalogId = activeCatalogId;
      if (activeServiceName) newParams.service = activeServiceName;
      setSearchParams(newParams);
    }, 250);

    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [searchQuery, effectivePincode, activeCatalogId, activeServiceName, activeLanguage, activeMinExp]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveCatalogId('');
    setActiveServiceName('');
    setActiveLanguage('All');
    setActiveMinExp(0);
    setIsFilterByAddress(false);
    setSearchParams({});
  };

  return (
    <div className="max-w-6xl mx-auto px-2.5 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
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
        {/* 1. Live Search Bar & Filters Toggle */}
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

        {/* 2. Devotee Address-Based Local Purohit Matching Banner */}
        {activeAddress && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 bg-amber-50/90 border border-amber-300 rounded-md text-xs">
            <div className="flex items-center gap-2 text-stone-800 min-w-0">
              <MapPin className="h-4 w-4 text-red-700 shrink-0" />
              <span className="truncate">
                {isFilterByAddress && effectivePincode ? (
                  <>
                    Matching Purohits serving your location PIN:{" "}
                    <strong className="text-stone-950 font-bold font-mono">
                      {activeDevoteePin}
                    </strong>
                    {activeAddress.city
                      ? ` (${[
                          activeAddress.villageTown && activeAddress.villageTown.toLowerCase() !== activeAddress.city.toLowerCase()
                            ? activeAddress.villageTown
                            : activeAddress.locality && !activeAddress.locality.includes("Post Office") && activeAddress.locality.toLowerCase() !== activeAddress.city.toLowerCase()
                            ? activeAddress.locality
                            : null,
                          activeAddress.city,
                          activeAddress.state,
                        ].filter(Boolean).join(", ")})`
                      : activeAddress.state
                      ? ` (${activeAddress.state})`
                      : ""}
                    {activeAddress.label && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] bg-amber-200 text-stone-800 font-bold uppercase">
                        {activeAddress.label}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    Showing <strong className="text-stone-900 font-bold">all regions</strong> (Outside your saved address)
                  </>
                )}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {userAddresses.length > 1 && (
                <select
                  value={selectedAddressId}
                  onChange={(e) => {
                    setSelectedAddressId(e.target.value);
                    setIsFilterByAddress(true);
                  }}
                  className="text-xs h-7 px-2 py-0.5 rounded border border-amber-300 bg-white font-medium text-stone-800 cursor-pointer"
                  title="Switch Puja Location"
                >
                  {userAddresses.map((addr) => (
                    <option key={addr.id} value={addr.id}>
                      {addr.label || "Address"}: {addr.pincode || addr.pinCode} - {addr.locality || addr.city}
                    </option>
                  ))}
                </select>
              )}
              <button
                type="button"
                onClick={() => setIsFilterByAddress(!isFilterByAddress)}
                className="text-xs font-bold text-red-700 hover:text-red-900 underline underline-offset-2 cursor-pointer"
              >
                {isFilterByAddress ? "Show all Purohits" : `Filter by my PIN (${activeDevoteePin})`}
              </button>
              <Link
                to="/user/addresses"
                className="text-xs font-semibold text-stone-600 hover:text-stone-900 ml-1"
              >
                Manage Addresses
              </Link>
            </div>
          </div>
        )}

        {/* Prompt to add address if logged-in devotee has no addresses */}
        {user?.role === 'USER' && userAddresses.length === 0 && !isLoadingAddresses && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-stone-50 border border-stone-200 rounded-md text-xs text-stone-700">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-stone-500 shrink-0" />
              <span>
                Save your puja venue address to automatically match verified Purohits serving your PIN code and local area.
              </span>
            </div>
            <Link
              to="/user/addresses"
              className="font-bold text-red-700 hover:underline shrink-0"
            >
              + Add Puja Location
            </Link>
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
      {isLoading && priests.length === 0 ? (
        <div className="text-center py-16 text-xs text-stone-500 font-medium">
          Connecting to Vedic scholar directory...
        </div>
      ) : !isLoading && priests.length === 0 ? (
        <div className="border-2 border-amber-300 bg-white text-center py-14 px-4 shadow-xs rounded-xl">
          <div className="max-w-md mx-auto space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-amber-100 text-red-700 border-2 border-amber-300">
              <Search className="h-6 w-6" />
            </div>
            <h2 className="text-base font-bold font-serif text-stone-900">
              {effectivePincode ? `No Purohits Currently Serving PIN ${effectivePincode}` : 'No Priests Found'}
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              {effectivePincode
                ? `No verified Acharyas currently list PIN code ${effectivePincode} in their active service areas. You can view all available Purohits across regions or update your saved puja venue address.`
                : 'No verified priests matched your search criteria. Try selecting another ceremony or resetting your filters.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {effectivePincode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFilterByAddress(false)}
                  className="text-xs gap-1.5 border-2 border-amber-300 rounded-md cursor-pointer bg-white text-stone-800"
                >
                  <span>View All Available Purohits</span>
                </Button>
              )}
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
        </div>
      ) : (
        <div className={`flex flex-col gap-4 w-full relative transition-opacity duration-200 ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}>
          {isLoading && (
            <div className="absolute top-2 right-2 bg-amber-100/90 text-amber-900 border border-amber-300 text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-xs z-10 flex items-center gap-1.5 animate-pulse">
              <Sparkles className="w-3 h-3 text-amber-700" />
              <span>Updating scholars...</span>
            </div>
          )}
          {priests.map((priest) => (
            <PriestCard key={priest.id} priest={priest} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PriestListingPage;

