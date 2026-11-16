import React from 'react';
import { ShieldCheck, CheckCircle2, Star, Award, Flame, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Priest } from '@/types/priest.types';
import { getInitials, formatLocalityName } from '@/lib/utils';

interface PriestPublicHeaderProps {
  priest: Priest;
  onBookClick: () => void;
}

/**
 * ============================================================================
 * [COMPONENT: PRIEST PUBLIC HEADER]
 * Public profile showcase banner for devotees browsing purohit services.
 * ============================================================================
 */
export const PriestPublicHeader: React.FC<PriestPublicHeaderProps> = ({ priest, onBookClick }) => {
  return (
    <div className="bg-white border-2 border-amber-300 rounded-xl p-4 sm:p-7 shadow-xs flex flex-col md:flex-row gap-4 sm:gap-6 items-start relative">
      <div className="relative shrink-0 mx-auto md:mx-0">
        {priest.profileImageUrl ? (
          <img
            src={priest.profileImageUrl}
            alt={priest.fullName}
            className="h-24 w-24 sm:h-32 sm:w-32 rounded-lg object-cover ring-2 ring-amber-400 ring-offset-2 shrink-0 bg-amber-50 shadow-xs"
          />
        ) : (
          <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-lg bg-[#780016] text-amber-100 flex items-center justify-center font-serif text-2xl sm:text-4xl font-bold ring-2 ring-amber-400 ring-offset-2 shadow-xs select-none">
            {getInitials(priest.displayName || priest.fullName)}
          </div>
        )}
        <div
          className="absolute -bottom-1 -right-1 bg-red-700 text-white rounded-full p-1.5 shadow-sm border-2 border-white"
          title="Gurukul Lineage Verified"
        >
          <ShieldCheck className="h-4 w-4" />
        </div>
      </div>

      <div className="space-y-3 flex-1 min-w-0 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-3xl font-bold font-serif text-stone-900 wrap-break-words">
                {priest.displayName || priest.fullName}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm bg-red-700 text-white text-[11px] font-semibold shadow-2xs shrink-0">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Vedic Verified</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600 mt-2">
              <span className="inline-flex items-center gap-1 font-bold text-stone-900 bg-amber-100 px-2.5 py-0.5 rounded-sm border border-amber-300">
                <Star
                  className={`h-3.5 w-3.5 ${
                    priest.reviewCount && priest.rating && Number(priest.rating) > 0
                      ? 'fill-amber-500 text-amber-500'
                      : 'text-stone-400'
                  }`}
                />
                {priest.reviewCount && priest.rating && Number(priest.rating) > 0
                  ? `${Number(priest.rating).toFixed(1)} (${priest.reviewCount} ${
                      priest.reviewCount === 1 ? 'Review' : 'Reviews'
                    })`
                  : 'No ratings yet'}
              </span>
              <span className="inline-flex items-center gap-1 font-bold text-stone-900 bg-amber-400 px-2.5 py-0.5 rounded-sm">
                <Award className="h-3 w-3 text-stone-950" />
                {priest.experienceYears}+ Yrs Shastric Exp
              </span>
              <span className="inline-flex items-center gap-1 font-bold text-white bg-red-950 px-2.5 py-0.5 rounded-sm">
                <Flame className="h-3 w-3 text-amber-400" />
                {priest.completedPujas ?? 0}{' '}
                {(priest.completedPujas ?? 0) === 1 ? 'Puja Conducted' : 'Pujas Conducted'}
              </span>
              <span className="flex items-center gap-1 font-semibold text-stone-700">
                <MapPin className="h-3.5 w-3.5 text-red-700 shrink-0" /> {priest.city}, {priest.state}
              </span>
            </div>
          </div>

          <Button
            onClick={onBookClick}
            className="gap-2 text-xs font-bold bg-[#780016] hover:bg-red-800 text-white rounded-md shadow-xs h-10 px-5 cursor-pointer shrink-0 w-full sm:w-auto"
          >
            <Calendar className="h-4 w-4" />
            <span>Book Ceremony</span>
          </Button>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed font-sans">
          {priest.bio ||
            'Experienced Purohit offering authentic Vedic Vidhi rituals and sacred mantra chanting across Kolkata.'}
        </p>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs pt-2 border-t border-amber-100">
          <div>
            <span className="text-stone-500 font-medium">Languages: </span>
            <strong className="text-stone-900">
              {priest.languages?.join(', ') || 'Bengali, Sanskrit, Hindi'}
            </strong>
          </div>
          <span>•</span>
          <div>
            <span className="text-stone-500 font-medium">Serving Localities: </span>
            <strong className="text-stone-900">
              {priest.serviceAreas?.map(formatLocalityName).filter(Boolean).join(', ') || priest.city}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
