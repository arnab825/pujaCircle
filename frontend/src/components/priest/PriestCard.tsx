import React from 'react';
import { Link } from 'react-router-dom';
import { Priest } from '@/types/priest.types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/lib/utils';
import { Star, MapPin, CheckCircle2, ChevronRight } from 'lucide-react';

interface PriestCardProps {
  priest: Priest;
}

export const PriestCard: React.FC<PriestCardProps> = ({ priest }) => {
  const activeServices = priest.services || [];
  const prices = activeServices.map((s) => s.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 2100;

  return (
    <Card className="border-border/80 hover:border-primary/40 transition-colors shadow-xs">
      <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5 items-start">
        {/* Avatar / Photo */}
        <img
          src={priest.profileImageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'}
          alt={priest.fullName}
          className="h-20 w-20 sm:h-24 sm:w-24 rounded-md object-cover border border-border/80 shrink-0 bg-muted"
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
              <span className="text-base font-bold text-primary font-serif">{formatINR(minPrice)}</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {priest.bio}
          </p>

          {/* Languages & Locality Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {priest.languages?.map((lang) => (
              <span
                key={lang}
                className="px-2 py-0.5 rounded-md bg-muted text-[11px] text-muted-foreground"
              >
                {lang}
              </span>
            ))}
            {priest.serviceAreas?.slice(0, 3).map((area) => (
              <span
                key={area}
                className="px-2 py-0.5 rounded-md bg-primary/5 text-[11px] text-primary"
              >
                {area}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full sm:w-auto self-stretch sm:self-center shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-border/40">
          <Button asChild size="sm" className="w-full text-xs gap-1.5 h-9">
            <Link to={`/user/priests/${priest.id}`}>
              Book Pooja <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
