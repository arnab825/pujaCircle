import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, Camera, Trash2 } from 'lucide-react';
import { Priest } from '@/types/priest.types';
import { getInitials } from '@/lib/utils';

interface PriestProfileHeaderCardProps {
  priest: Priest | null;
  fullName: string;
  experienceYears: number;
  city: string;
  state: string;
  profileImageUrl: string;
  serviceAreasCount: number;
  onAvatarClick: () => void;
  onRemoveAvatar: () => void;
}

/**
 * ============================================================================
 * [COMPONENT: PRIEST PROFILE HEADER CARD]
 * Displays purohit summary, verification status, experience, rating, and avatar.
 * ============================================================================
 */
export const PriestProfileHeaderCard: React.FC<PriestProfileHeaderCardProps> = ({
  priest,
  fullName,
  experienceYears,
  city,
  state,
  profileImageUrl,
  serviceAreasCount,
  onAvatarClick,
  onRemoveAvatar,
}) => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 rounded-xl border-2 border-amber-300 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 w-full sm:w-auto text-center sm:text-left">
        <div className="flex flex-col items-center sm:items-start gap-2 shrink-0">
          <div className="relative group shrink-0">
            <button
              type="button"
              onClick={onAvatarClick}
              className="relative block p-1 rounded-full ring-4 ring-amber-400 bg-amber-100 shadow-sm focus:outline-none focus:ring-offset-2 focus:ring-offset-white transition-transform hover:scale-105 cursor-pointer"
              title="Click to choose a new profile photo"
            >
              <Avatar className="w-20 h-20 border-2 border-white">
                {profileImageUrl ? (
                  <AvatarImage
                    src={profileImageUrl}
                    alt={fullName}
                    className="object-cover"
                  />
                ) : null}
                <AvatarFallback className="bg-[#780016] text-white font-serif text-2xl font-bold">
                  {getInitials(fullName)}
                </AvatarFallback>
              </Avatar>

              <div className="absolute inset-1 rounded-full bg-stone-950/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 mb-0.5" />
                <span className="text-[9px] font-bold tracking-wide uppercase">
                  Change
                </span>
              </div>
            </button>
          </div>

          {profileImageUrl && (
            <button
              type="button"
              onClick={onRemoveAvatar}
              className="text-[11px] text-stone-500 hover:text-red-700 font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
              title="Remove custom profile photo"
            >
              <Trash2 className="w-3 h-3 text-red-600" />
              <span>Remove Photo</span>
            </button>
          )}
        </div>

        <div className="space-y-1.5 flex-1">
          <h2 className="text-xl sm:text-2xl font-extrabold font-serif text-stone-950">
            {fullName || 'Acharya Pandit Ji'}
          </h2>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 text-xs text-stone-600">
            <span className="font-bold text-stone-900">
              {experienceYears} Years Vedic Experience
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-amber-700 font-bold">
              <Star
                className={`w-3.5 h-3.5 ${
                  priest?.reviewCount && Number(priest?.rating) > 0
                    ? 'fill-amber-500 text-amber-500'
                    : 'text-stone-400'
                }`}
              />
              {priest?.reviewCount && Number(priest?.rating) > 0
                ? `${Number(priest.rating).toFixed(1)} (${priest.reviewCount} ${
                    priest.reviewCount === 1 ? 'review' : 'reviews'
                  })`
                : `0.0 (${priest?.reviewCount || 0} reviews)`}
            </span>
            <span>•</span>
            <span className="font-medium text-stone-800">
              {city || 'Location not set'}
              {state ? `, ${state}` : ''}
            </span>
          </div>
          <p className="text-xs text-stone-500">
            Tap avatar to upload a new profile picture.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-md bg-amber-50/70 border border-amber-300 text-xs text-stone-800 font-bold w-full sm:w-auto shrink-0">
        <MapPin className="w-4 h-4 text-red-700" />
        <span>{serviceAreasCount} Active Localities</span>
      </div>
    </div>
  );
};
