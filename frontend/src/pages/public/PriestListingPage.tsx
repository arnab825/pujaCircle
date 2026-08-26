import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { mockGetPriests } from '@/mocks/mock-api';
import { Priest } from '@/types/priest.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  MapPin,
  Star,
  Sparkles,
  SlidersHorizontal,
  Calendar,
  CheckCircle2,
  ArrowRight,
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
          {priests.map((priest) => {
            const activeServices = priest.services || [];
            const prices = activeServices.map((s) => s.price);
            const minPrice = prices.length > 0 ? Math.min(...prices) : 2100;

            return (
              <Card
                key={priest.id}
                className="border-border/80 hover:border-primary/40 transition-colors shadow-xs"
              >
                <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5 items-start">
                  {/* Avatar / Photo */}
                  <img
                    src={priest.profileImageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'}
                    alt={priest.fullName}
                    className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover border border-border/80 shrink-0 bg-muted"
                  />

                  {/* Main Info */}
                  <div className="flex-1 space-y-2.5 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-bold font-serif text-foreground">
                            {priest.displayName || priest.fullName}
                          </h2>
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 gap-1 text-[10px] py-0"
                          >
                            <CheckCircle2 className="h-3 w-3" /> Verified
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 font-semibold text-amber-600">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            {priest.rating ? priest.rating.toFixed(1) : '5.0'} ({priest.reviewCount || 10}+ reviews)
                          </span>
                          <span>•</span>
                          <span>{priest.experienceYears} Years Experience</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-primary" /> {priest.city}, {priest.state}
                          </span>
                        </div>
                      </div>

                      {/* Starting Price Pill */}
                      <div className="text-right shrink-0">
                        <span className="text-[11px] text-muted-foreground block">Starting from</span>
                        <span className="text-lg font-bold text-foreground font-mono">
                          ₹{minPrice.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-muted-foreground block">(Offline Cash)</span>
                      </div>
                    </div>

                    {/* Bio Snippet */}
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {priest.bio}
                    </p>

                    {/* Services Offered Tags */}
                    {activeServices.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] font-medium text-muted-foreground mr-1">
                          Key Ceremonies:
                        </span>
                        {activeServices.slice(0, 3).map((srv) => (
                          <Badge key={srv.id} variant="secondary" className="text-[11px] font-normal py-0">
                            {srv.serviceName} (₹{srv.price})
                          </Badge>
                        ))}
                        {activeServices.length > 3 && (
                          <span className="text-[11px] text-muted-foreground">
                            +{activeServices.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border/40">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        <span>Languages: <strong>{priest.languages?.join(', ') || 'Hindi, Sanskrit'}</strong></span>
                      </div>

                      <Link to={`/user/priests/${priest.id}`}>
                        <Button size="sm" className="gap-1.5 text-xs h-8">
                          <span>View Profile & Book</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PriestListingPage;
