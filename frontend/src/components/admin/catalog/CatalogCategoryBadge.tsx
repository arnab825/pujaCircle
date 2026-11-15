import React from 'react';

interface CatalogCategoryBadgeProps {
  category: string;
}

export const getCategoryBadgeConfig = (category: string) => {
  const norm = (category || '').toLowerCase().replace(/[\s_-]+/g, '');
  switch (norm) {
    case 'lifeevent':
      return {
        label: 'Life Event',
        icon: '🌟',
        className: 'bg-amber-100 text-amber-950 border-amber-300',
      };
    case 'doshanivaran':
      return {
        label: 'Dosha Nivaran',
        icon: '🛡️',
        className: 'bg-purple-100 text-purple-950 border-purple-300',
      };
    case 'festival':
      return {
        label: 'Festival & Vrat',
        icon: '🪔',
        className: 'bg-emerald-100 text-emerald-950 border-emerald-300',
      };
    case 'business':
      return {
        label: 'Business & Trade',
        icon: '💼',
        className: 'bg-blue-100 text-blue-950 border-blue-300',
      };
    case 'ancestral':
      return {
        label: 'Ancestral & Pitru',
        icon: '🕊️',
        className: 'bg-stone-200 text-stone-900 border-stone-300',
      };
    default:
      return {
        label: category,
        icon: '✨',
        className: 'bg-amber-50 text-amber-900 border-amber-200',
      };
  }
};

/**
 * ============================================================================
 * [COMPONENT: CATALOG CATEGORY BADGE]
 * Visual category tag with icon and themed color coding.
 * ============================================================================
 */
export const CatalogCategoryBadge: React.FC<CatalogCategoryBadgeProps> = ({ category }) => {
  const config = getCategoryBadgeConfig(category);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border shadow-2xs ${config.className}`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
};
