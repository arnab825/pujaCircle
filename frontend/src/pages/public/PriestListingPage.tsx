import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mockGetPriests } from '@/mocks/mock-api';
import { Priest } from '@/types/priest.types';
import { PriestCard } from '@/components/priest/PriestCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

const POPULAR_LANGUAGES = [
  'All',
  'Sanskrit',
  'Hindi',
  'Marathi',
  'Bengali',
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
  { label: '20+ Yrs', value: 20 },
];

export const PriestListingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('searchQuery') || '';

  const [priests, setPriests] = useState<Priest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeLanguage, setActiveLanguage] = useState<string>('All');
  const [activeMinExp, setActiveMinExp] = useState<number>(0);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const appliedFiltersCount =
    (activeLanguage !== 'All' ? 1 : 0) + (activeMinExp > 0 ? 1 : 0);
  const hasActiveFilters = searchQuery !== '' || appliedFiltersCount > 0;

  const fetchPriests = async (query = searchQuery) => {
    setIsLoading(true);
    try {
      const res = await mockGetPriests({
        searchQuery: query || undefined,
        language: activeLanguage !== 'All' ? activeLanguage : undefined,
        minExperience: activeMinExp > 0 ? activeMinExp : undefined,
        status: 'ALL',
      });
      if (res.success) {
        setPriests(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Live debounced search & filter reaction
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPriests(searchQuery);
      if (searchQuery) {
        setSearchParams({ searchQuery });
      } else {
        setSearchParams({});
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, activeLanguage, activeMinExp]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveLanguage('All');
    setActiveMinExp(0);
    setSearchParams({});
  };

  return (
    <div className="container py-8 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Verified Vedic Scholars</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-foreground">
          Find a Purohit for Your Ceremony
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
          Browse verified Vedic priests serving your city, view transparent ritual Dakshina, and schedule in-home ceremonies with direct offline honorarium.
        </p>
      </div>

      {/* Search & Filter Control Hub */}
      <Card className="border-border/80 shadow-xs overflow-hidden">
        <CardContent className="p-4 sm:p-5 space-y-3.5">
          {/* 1. Live Search Bar & Filters Toggle */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Type ceremony name or priest (e.g. Griha Pravesh, Satyanarayan, Rudrabhishek)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9 text-xs h-10 rounded-lg"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground cursor-pointer"
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
              className="h-10 text-xs gap-1.5 px-3.5 sm:px-4 font-semibold shrink-0 cursor-pointer shadow-xs"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Filters</span>
              {appliedFiltersCount > 0 && (
                <span className="h-4 min-w-4 px-1 rounded-full bg-primary-foreground text-primary text-[10px] font-bold flex items-center justify-center">
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

          {/* 2. Collapsible Filter Chips Tray */}
          {isFiltersOpen && (
            <div className="space-y-3.5 pt-3 border-t border-border/50 animate-in fade-in-50 duration-150">
              {/* Language Filter Pills */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/85">
                  <Languages className="h-3.5 w-3.5 text-primary" />
                  <span>Preferred Language</span>
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
                          'px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer select-none',
                          isSelected
                            ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                            : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted border border-border/50'
                        )}
                      >
                        {lang}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Experience Level Segmented Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/85">
                  <Award className="h-3.5 w-3.5 text-amber-600" />
                  <span>Vedic Experience</span>
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
                          'px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer select-none',
                          isSelected
                            ? 'bg-primary/15 text-primary font-semibold border border-primary/40 shadow-xs'
                            : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted border border-border/50'
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
          <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-muted-foreground font-medium">
                {priests.length} {priests.length === 1 ? 'Purohit available' : 'Purohits available'}
              </span>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 text-primary hover:underline font-semibold ml-1 cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset all</span>
                </button>
              )}
            </div>

            {appliedFiltersCount > 0 && !isFiltersOpen && (
              <button
                type="button"
                onClick={() => setIsFiltersOpen(true)}
                className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
              >
                {activeLanguage !== 'All' ? `${activeLanguage}` : ''}
                {activeLanguage !== 'All' && activeMinExp > 0 ? ' • ' : ''}
                {activeMinExp > 0 ? `${activeMinExp}+ Yrs Exp` : ''} (Edit)
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Priest Cards Grid */}
      {isLoading ? (
        <div className="text-center py-16 text-xs text-muted-foreground">
          Finding verified Purohits...
        </div>
      ) : priests.length === 0 ? (
        <Card className="border-border/80 text-center py-14 px-4 shadow-xs">
          <div className="max-w-md mx-auto space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Search className="h-6 w-6" />
            </div>
            <h2 className="text-base font-bold font-serif text-foreground">No Priests Found</h2>
            <p className="text-xs text-muted-foreground">
              No verified priests matched your query. Try searching for another ceremony or clearing your filters.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="text-xs gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Clear Filters</span>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {priests.map((priest) => (
            <PriestCard key={priest.id} priest={priest} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PriestListingPage;
