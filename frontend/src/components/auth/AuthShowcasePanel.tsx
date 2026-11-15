import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface AuthShowcasePanelProps {
  role: 'USER' | 'PRIEST' | 'ADMIN';
  tag?: string;
  title?: string;
  description?: string;
  points?: string[];
  children?: React.ReactNode;
}

/**
 * ============================================================================
 * [COMPONENT: AUTH SHOWCASE PANEL]
 * Solid Sacred Vermilion (#780016) left panel for authentication pages.
 * Displays PujaCircle sacred branding, role-specific value propositions,
 * and classical Sanskrit shlokas.
 * ============================================================================
 */
export const AuthShowcasePanel: React.FC<AuthShowcasePanelProps> = ({
  role,
  tag,
  title,
  description,
  points,
  children,
}) => {
  const content = {
    USER: {
      sanctum: 'Devotee Sanctum',
      tag: 'Sacred Home Rituals',
      title: 'Authentic Vedic Ceremonies at Home',
      description:
        'Connect with verified Gurukul-trained Purohits with complete transparency, authentic samagri guidance, and zero advance fees.',
      points: [
        'Verified Gurukul Purohits across West Bengal',
        '100% Direct Cash Dakshina after ritual',
        'Transparent Samagri Lists & Vidhi Steps',
      ],
      shloka: '“यज्ञो वै श्रेष्ठतमं कर्म — Yajna is the highest auspicious deed.”',
      shlokaSource: '— Satapatha Brahmana',
    },
    PRIEST: {
      sanctum: 'Vedic Purohit Sanctum',
      tag: 'Vedic Purohit Service',
      title: 'Serve Devotees with Sacred Lineage',
      description:
        'Accept verified puja ceremony appointments in your locality across West Bengal and receive 100% direct cash dakshina without commissions.',
      points: [
        'Zero commission — 100% direct cash dakshina',
        'Manage custom puja pricing & Muhurat slots',
        'Direct communication with verified devotees',
      ],
      shloka: '“विद्वत्वं च नृपत्वं च नैव तुल्यं कदाचन — Sacred wisdom surpasses all royalty.”',
      shlokaSource: '— Chanakya Niti',
    },
    ADMIN: {
      sanctum: 'Administrative Command',
      tag: 'Platform Governance',
      title: 'Preserve Tradition & Integrity',
      description:
        'Oversee scholar onboarding, verify Vedic credentials, manage sacred ritual catalog, and ensure seamless devotee satisfaction.',
      points: [
        'Rigorous Gurukul credential verification',
        'Comprehensive ceremony lifecycle monitoring',
        'Transparent community feedback and dispute resolution',
      ],
      shloka: '“सत्यमेव जयते नानृतम् — Truth alone triumphs, not falsehood.”',
      shlokaSource: '— Mundaka Upanishad',
    },
  }[role];

  return (
    <div className="hidden lg:flex flex-col justify-between w-5/12 bg-[#780016] text-white p-8 sm:p-10 border-r-2 border-amber-400/40 relative">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-md bg-amber-400 text-stone-950 flex items-center justify-center font-serif font-black text-2xl shadow-md select-none">
            ॐ
          </div>
          <div>
            <div className="font-serif font-black text-lg tracking-wider text-amber-300">
              PUJACIRCLE
            </div>
            <div className="text-[10px] text-amber-100 uppercase tracking-widest font-semibold">
              {content.sanctum}
            </div>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="space-y-3 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{tag || content.tag}</span>
          </div>
          <h2 className="text-2xl font-bold font-serif text-white leading-snug">
            {title || content.title}
          </h2>
          <p className="text-xs text-amber-100/90 leading-relaxed">
            {description || content.description}
          </p>
        </div>

        {/* Benefits Checklist */}
        <div className="space-y-2.5 pt-2">
          {(points || content.points).map((point, index) => (
            <div key={index} className="flex items-center gap-2 text-xs text-amber-100">
              <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
              <span>{point}</span>
            </div>
          ))}
        </div>

        {/* Optional Slot (e.g. Stepper Progress) */}
        {children}
      </div>

      {/* Sanskrit Shloka Footer */}
      <div className="pt-6 border-t border-amber-400/30 space-y-1">
        <div className="text-xs font-serif text-amber-200 italic">
          {content.shloka}
        </div>
        <div className="text-[10px] text-amber-400 font-medium">
          {content.shlokaSource}
        </div>
      </div>
    </div>
  );
};
