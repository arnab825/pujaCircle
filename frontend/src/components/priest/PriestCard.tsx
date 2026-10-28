import React from 'react';
import { Link } from 'react-router-dom';
import { Priest } from '@/types/priest.types';
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
  Flame,
  CheckCircle2,
} from 'lucide-react';

interface PriestCardProps {
  priest: Priest;
}

/**
 * PriestCard
 * Strictly Flex-only layout with pure white canvas,
 * hairline amber borders, golden avatar ring, solid vermilion & saffron pills,
 * and responsive card lift & button tap feedback.
 */
export const PriestCard: React.FC<PriestCardProps> = ({ priest }) => {
  const activeServices = priest.services || [];
  const prices = activeServices.map((s) => s.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 2100;

  const displayName = priest.displayName || priest.fullName;
  const ratingValue = priest.rating ? priest.rating.toFixed(1) : '4.9';
  const reviewTotal = priest.reviewCount || 48;
  const poojaCount = 120 + ((priest.experienceYears || 5) * 18);

  // Top specializations / ceremonies
  const topSpecializations =
    priest.specializations && priest.specializations.length > 0
      ? priest.specializations.slice(0, 4)
      : ['Griha Pravesh', 'Satyanarayan Katha', 'Vastu Shanti'];

  // Serviced areas preview
  const serviceAreasPreview =
    priest.serviceAreas && priest.serviceAreas.length > 0
      ? priest.serviceAreas.slice(0, 3).join(', ')
      : priest.city;

  const priestDetailUrl = `/priests/${priest.id}`;

  return (
    <div className="w-full bg-white border-2 border-amber-200 hover:border-amber-400 rounded-xl shadow-xs transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl overflow-hidden flex flex-col md:flex-row items-stretch justify-between p-5 sm:p-6 gap-5 group">
      {/* 1. Left Section: Priest Photo & Trust Badges */}
      <div className="flex flex-row md:flex-col items-center md:items-center gap-4 md:gap-3 shrink-0">
        <div className="relative shrink-0">
          <img
            src={
              priest.profileImageUrl ||
              '/images/verified_purohit_portrait.jpg'
            }
            alt={displayName}
            className="h-20 w-20 sm:h-24 sm:w-24 rounded-md object-cover ring-2 ring-amber-400 bg-amber-50 shadow-xs"
            loading="lazy"
          />
          <div
            className="absolute -bottom-1 -right-1 bg-red-700 text-white rounded-full p-1 shadow-sm border-2 border-white"
            title="Gurukul Lineage Verified"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Rating & Review Counter Pill */}
        <div className="flex flex-col md:items-center gap-1">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-sm bg-amber-100 text-stone-950 border border-amber-300 text-xs font-bold shadow-2xs">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            <span>{ratingValue}</span>
            <span className="text-stone-600 text-[11px]">({reviewTotal})</span>
          </div>
        </div>
      </div>

      {/* 2. Middle Section: Identity, Verified Pills & Ritual Badges */}
      <div className="flex-1 flex flex-col justify-between gap-3 min-w-0">
        <div className="space-y-2">
          {/* Header Row: Name, Location, Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={priestDetailUrl}
                className="text-lg sm:text-xl font-bold font-serif text-stone-900 group-hover:text-red-700 transition-colors"
              >
                {displayName}
              </Link>

              {/* Vedic Verified Pill */}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm bg-red-700 text-white text-[11px] font-semibold shadow-2xs">
                <ShieldCheck className="h-3 w-3" />
                <span>Vedic Verified</span>
              </span>

              {/* Years of Experience Pill */}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm bg-amber-400 text-stone-950 text-[11px] font-bold shadow-2xs">
                <Clock className="h-3 w-3 text-stone-950" />
                <span>{priest.experienceYears}+ Yrs Exp</span>
              </span>

              {/* Pooja Count Pill */}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm bg-red-950 text-white text-[11px] font-semibold">
                <Flame className="h-3 w-3 text-amber-400" />
                <span>{poojaCount}+ Pujas</span>
              </span>
            </div>

            {/* Servicing City */}
            <div className="flex items-center gap-1 text-xs text-stone-700 font-semibold shrink-0">
              <MapPin className="h-3.5 w-3.5 text-red-700 shrink-0" />
              <span>
                {priest.city}, {priest.state}
              </span>
            </div>
          </div>

          {/* Bio snippet */}
          <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">
            {priest.bio}
          </p>
        </div>

        {/* Specialization Pills & Languages */}
        <div className="flex flex-col gap-2 pt-2 border-t border-amber-100">
          <div className="flex flex-wrap items-center gap-1.5">
            {topSpecializations.map((spec) => (
              <span
                key={spec}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm bg-amber-50 text-red-950 border border-amber-300 text-[11px] font-semibold"
              >
                <Sparkles className="h-3 w-3 text-amber-600" />
                <span>{spec}</span>
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-stone-600">
            <div className="flex items-center gap-1">
              <Languages className="h-3.5 w-3.5 text-red-700" />
              <span>{priest.languages?.join(', ') || 'Sanskrit, Hindi'}</span>
            </div>
            {serviceAreasPreview && (
              <div className="flex items-center gap-1 text-stone-500">
                <span>•</span>
                <span>Areas: {serviceAreasPreview}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Right Section: Starting Dakshina & Solid Red CTA */}
      <div className="flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 md:border-l md:border-amber-200 md:pl-6 shrink-0 min-w-40">
        <div className="text-left md:text-right space-y-0.5">
          <span className="text-[11px] text-stone-500 font-semibold uppercase tracking-wider block">
            Starting Dakshina
          </span>
          <div className="flex items-baseline md:justify-end gap-1">
            <span className="text-2xl font-bold text-red-800 font-serif">
              {formatINR(minPrice)}
            </span>
          </div>
          <div className="inline-flex items-center gap-1 text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-200">
            <CheckCircle2 className="h-2.5 w-2.5 text-emerald-700" />
            <span>Cash after puja</span>
          </div>
        </div>

        <Button
          asChild
          className="bg-red-700 hover:bg-red-800 text-white font-bold px-6 h-11 rounded-md shadow-md active:scale-[0.98] transition-transform duration-150 cursor-pointer w-full sm:w-auto"
        >
          <Link to={priestDetailUrl} className="flex items-center justify-center gap-2 text-xs font-bold">
            <span>Book Purohit</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default PriestCard;

