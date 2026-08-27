import React from 'react';
import { Link } from 'react-router-dom';
import { Priest } from '@/types/priest.types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/lib/utils';
import {
  Star,
  MapPin,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Languages,
  Clock,
} from 'lucide-react';

interface PriestCardProps {
  priest: Priest;
}

export const PriestCard: React.FC<PriestCardProps> = ({ priest }) => {
  const activeServices = priest.services || [];
  const prices = activeServices.map((s) => s.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 2100;

  const displayName = priest.displayName || priest.fullName;
  const ratingValue = priest.rating ? priest.rating.toFixed(1) : '4.9';
  const reviewTotal = priest.reviewCount || 48;

  // Display top specializations / ceremonies
  const topSpecializations = priest.specializations && priest.specializations.length > 0
    ? priest.specializations.slice(0, 3)
    : ['Griha Pravesh', 'Satyanarayan Katha', 'Vastu Shanti'];

  // Top serviced areas
  const serviceAreasPreview = priest.serviceAreas && priest.serviceAreas.length > 0
    ? priest.serviceAreas.slice(0, 3).join(', ')
    : priest.city;

  return (
    <Card className="group relative border border-border/80 bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200 rounded-xl overflow-hidden">
      <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row gap-4 sm:gap-5 items-stretch">
        
        {/* 1. Left Column: Priest Photo & Trust Badge */}
        <div className="flex sm:flex-col items-center gap-3 sm:gap-2.5 shrink-0">
          <div className="relative">
            <img
              src={priest.profileImageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'}
              alt={displayName}
              className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl object-cover border-2 border-primary/20 bg-muted shadow-xs transition-transform duration-200 group-hover:scale-102"
              loading="lazy"
            />
            <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-1 shadow-xs border-2 border-background" title="Verified Priest">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Quick Rating & Exp Badge (Mobile Stacked / Desktop Below Photo) */}
          <div className="flex flex-col sm:items-center gap-1 sm:text-center">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 text-xs font-semibold">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              <span>{ratingValue}</span>
              <span className="text-muted-foreground text-[10px]">({reviewTotal})</span>
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
              <Clock className="h-3 w-3 text-primary/70" />
              <span>{priest.experienceYears}+ Yrs Exp</span>
            </div>
          </div>
        </div>

        {/* 2. Middle Column: Identity, Bio & Service Tags */}
        <div className="flex-1 space-y-2.5 min-w-0 flex flex-col justify-between">
          <div className="space-y-1.5">
            {/* Header: Name + Verified Pill */}
            <div className="flex flex-wrap items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <Link
                  to={`/user/priests/${priest.id}`}
                  className="text-base sm:text-lg font-bold font-serif text-foreground group-hover:text-primary transition-colors hover:underline"
                >
                  {displayName}
                </Link>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-[10px] font-semibold border border-emerald-500/20">
                  <ShieldCheck className="h-2.5 w-2.5" /> Verified
                </span>
              </div>

              {/* Servicing Location Pill */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate max-w-44 sm:max-w-60 font-medium">
                  {priest.city}, {priest.state}
                </span>
              </div>
            </div>

            {/* Bio snippet */}
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {priest.bio}
            </p>
          </div>

          {/* Tag Badges: Specializations & Languages */}
          <div className="space-y-1.5 pt-1">
            {/* Puja Specializations */}
            <div className="flex flex-wrap items-center gap-1.5">
              {topSpecializations.map((spec) => (
                <span
                  key={spec}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-primary/8 text-primary text-[11px] font-medium border border-primary/15"
                >
                  <Sparkles className="h-2.5 w-2.5 opacity-80" />
                  <span>{spec}</span>
                </span>
              ))}
            </div>

            {/* Spoken Languages & Service Areas */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1">
                <Languages className="h-3 w-3 text-muted-foreground/80" />
                <span>{priest.languages?.join(', ') || 'Sanskrit, Hindi'}</span>
              </div>
              {serviceAreasPreview && (
                <div className="flex items-center gap-1 text-muted-foreground/80">
                  <span>•</span>
                  <span>Areas: {serviceAreasPreview}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Right Column: Pricing & Action Button */}
        <div className="pt-3 md:pt-0 border-t md:border-t-0 md:border-l md:border-border/60 md:pl-5 flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end gap-3 shrink-0 min-w-36">
          <div className="text-left md:text-right">
            <span className="text-[11px] text-muted-foreground font-medium block">
              Starting Price
            </span>
            <div className="flex items-baseline md:justify-end gap-1">
              <span className="text-lg sm:text-xl font-bold text-primary font-serif">
                {formatINR(minPrice)}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground/80 hidden sm:block">
              Pay cash after puja
            </span>
          </div>

          <Button
            asChild
            size="sm"
            className="px-4 text-xs font-semibold gap-1.5 h-9 shadow-xs hover:gap-2 transition-all cursor-pointer"
          >
            <Link to={`/user/priests/${priest.id}`}>
              <span>Book Puja</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

      </CardContent>
    </Card>
  );
};

export default PriestCard;
