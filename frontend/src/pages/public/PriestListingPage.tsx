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
  MapPin,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';

export const PriestListingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('searchQuery') || '';

  const [priests, setPriests] = useState<Priest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search Filters
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [cityFilter, setCityFilter] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [languageFilter, setLanguageFilter] = useState('');
  const [minExpFilter, setMinExpFilter] = useState<number>(0);

  const fetchPriests = async () => {
    setIsLoading(true);
    try {
      const res = await mockGetPriests({
        searchQuery: searchQuery || undefined,
        city: cityFilter || undefined,
        language: languageFilter || undefined,
        minExperience: minExpFilter > 0 ? minExpFilter : undefined,
        status: 'ALL', // mockGetPriests already filters to APPROVED for public
      });
      if (res.success) {
        setPriests(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPriests();
  }, [cityFilter, languageFilter, minExpFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery) {
      setSearchParams({ searchQuery });
    } else {
      setSearchParams({});
    }
    fetchPriests();
  };

  return (
    <div className="container py-8 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Verified Vedic Scholars</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-foreground">
          Find a Purohit for Your Ceremony
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Browse verified Vedic priests, view priest-specific ritual prices, and schedule in-home ceremonies with direct offline cash Dakshina.
        </p>
      </div>

      {/* Search Toolbar */}
      <Card className="border-border/80 shadow-xs">
        <CardContent className="p-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search priest name or ceremony (e.g. Griha Pravesh)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            {/* City Filter */}
            <div className="sm:col-span-4 relative">
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="City (e.g. Mumbai, Bengaluru)..."
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            {/* Search Button */}
            <div className="sm:col-span-2 flex gap-2">
              <Button type="submit" size="sm" className="w-full text-xs h-9">
                Search
              </Button>
            </div>
          </form>

          {/* Advanced Filters Toggle */}
          <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>{showAdvanced ? 'Hide Filters' : 'More Filters (Language, Experience)'}</span>
            </button>
            <span className="text-[11px] text-muted-foreground">
              {priests.length} {priests.length === 1 ? 'Purohit found' : 'Purohits found'}
            </span>
          </div>

          {/* Collapsible Advanced Filters */}
          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border/40">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Language Spoken</label>
                <Input
                  placeholder="e.g. Hindi, Sanskrit, Marathi, Kannada"
                  value={languageFilter}
                  onChange={(e) => setLanguageFilter(e.target.value)}
                  className="text-xs h-8"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Min. Experience (Years)</label>
                <Input
                  type="number"
                  placeholder="e.g. 5"
                  value={minExpFilter || ''}
                  onChange={(e) => setMinExpFilter(Number(e.target.value))}
                  className="text-xs h-8"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Priest Cards Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-xs text-muted-foreground">
          Finding verified Purohits...
        </div>
      ) : priests.length === 0 ? (
        <Card className="border-border/80 text-center py-12 px-4 shadow-xs">
          <div className="max-w-md mx-auto space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Search className="h-6 w-6" />
            </div>
            <h2 className="text-base font-bold font-serif text-foreground">No Priests Found</h2>
            <p className="text-xs text-muted-foreground">
              No verified priests matched your search criteria. Try broadening your location or ceremony search.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setCityFilter('');
                setLanguageFilter('');
                setMinExpFilter(0);
                setSearchParams({});
              }}
              className="text-xs"
            >
              Reset Filters
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
