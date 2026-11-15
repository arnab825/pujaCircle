import React from 'react';
import { Languages as LanguagesIcon, Check } from 'lucide-react';

export const AVAILABLE_LANGUAGES = [
  'Sanskrit',
  'Hindi',
  'Bengali',
  'English',
  'Marathi',
  'Gujarati',
  'Kannada',
  'Telugu',
  'Tamil',
  'Malayalam',
  'Odia',
  'Punjabi',
  'Maithili',
  'Bhojpuri',
  'Assamese',
  'Marwari',
];

interface PriestLanguagesSelectorProps {
  selectedLanguages: string[];
  onToggleLanguage: (lang: string) => void;
}

/**
 * ============================================================================
 * [COMPONENT: PRIEST LANGUAGES SELECTOR]
 * Interactive Vedic and regional language chips with instant auto-save.
 * ============================================================================
 */
export const PriestLanguagesSelector: React.FC<PriestLanguagesSelectorProps> = ({
  selectedLanguages,
  onToggleLanguage,
}) => {
  return (
    <div className="rounded-xl border-2 border-amber-300 bg-white p-4 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <LanguagesIcon className="w-4 h-4 text-red-700" />
          <h3 className="text-base font-serif font-bold text-stone-950">
            Languages Spoken ({selectedLanguages.length})
          </h3>
        </div>
        <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          Auto-saved
        </span>
      </div>

      <p className="text-xs text-stone-600">
        Select all languages in which you can recite Vedic mantras and communicate with devotees.
      </p>

      <div className="flex flex-wrap gap-2 pt-1">
        {AVAILABLE_LANGUAGES.map((lang) => {
          const isSelected = selectedLanguages.includes(lang);
          return (
            <button
              key={lang}
              type="button"
              onClick={() => onToggleLanguage(lang)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-[#780016] text-white border border-amber-400 shadow-2xs'
                  : 'bg-white hover:bg-amber-50 text-stone-700 border border-stone-300'
              }`}
            >
              {isSelected && <Check className="w-3.5 h-3.5 text-amber-300" />}
              <span>{lang}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
