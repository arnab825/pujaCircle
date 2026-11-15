import React from 'react';
import { BookOpen, Sparkles, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface PriestVedicBioCardProps {
  bio: string;
  setBio: (bio: string) => void;
  isSaving: boolean;
  onSave: () => void;
}

/**
 * ============================================================================
 * [COMPONENT: PRIEST VEDIC BIO CARD]
 * Gurukul lineage description and sacred spiritual bio.
 * ============================================================================
 */
export const PriestVedicBioCard: React.FC<PriestVedicBioCardProps> = ({
  bio,
  setBio,
  isSaving,
  onSave,
}) => {
  return (
    <div className="rounded-xl border-2 border-amber-300 bg-white p-4 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
        <BookOpen className="w-4 h-4 text-red-700" />
        <h3 className="text-base font-serif font-bold text-stone-950">
          Vedic Lineage & Bio
        </h3>
      </div>

      <div className="space-y-2 text-xs">
        <label className="text-stone-600 block">
          Describe your Gurukul training, Vedic parampara, and ritual specializations for devotees.
        </label>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={1000}
          rows={5}
          placeholder="e.g. Trained under Nabadwip Gurukul with 15+ years conducting Shanti Havans, Griha Pravesh, and Vivah rituals across West Bengal..."
          className="rounded-md border-stone-300 focus:ring-amber-500 bg-white text-xs leading-relaxed"
        />
        <div className="flex justify-between items-center text-[11px] text-stone-400">
          <span>Keep your bio authentic, concise, and reverent.</span>
          <span className="font-mono">{bio.length}/1000</span>
        </div>
      </div>

      <div className="pt-2">
        <Button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="bg-[#780016] hover:bg-red-800 text-white font-bold border border-amber-400 text-xs px-5 h-9 rounded-md shadow-xs cursor-pointer"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              Saving Profile...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
              Save Profile Details
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
