import React from 'react';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AuthRoleTabsProps {
  activeRole: 'USER' | 'PRIEST';
  onChange?: (role: 'USER' | 'PRIEST') => void;
  onRoleChange?: (role: 'USER' | 'PRIEST') => void;
  className?: string;
}

/**
 * AuthRoleTabs
 * Fluid segmented role-switcher pill for Auth forms (Devotee vs Purohit).
 * 100% Flexbox, pure solid white background, radiant Haldi gold trims,
 * deep temple vermilion active fill, and sacred Om insignia.
 */
export const AuthRoleTabs: React.FC<AuthRoleTabsProps> = ({
  activeRole,
  onChange,
  onRoleChange,
  className,
}) => {
  const triggerChange = (role: 'USER' | 'PRIEST') => {
    if (onChange) onChange(role);
    if (onRoleChange) onRoleChange(role);
  };

  return (
    <div
      className={cn(
        'inline-flex p-1 rounded-md bg-amber-100/70 border border-amber-300 w-full sm:w-auto max-w-full',
        className
      )}
    >
      {/* 1. Devotee Tab */}
      <button
        type="button"
        onClick={() => triggerChange('USER')}
        className={cn(
          'flex-1 sm:flex-initial px-3 sm:px-5 py-1.5 sm:py-2 rounded-sm text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer select-none whitespace-nowrap min-w-0',
          activeRole === 'USER'
            ? 'bg-white text-[#780016] shadow-xs'
            : 'text-stone-700 hover:text-stone-950'
        )}
        aria-pressed={activeRole === 'USER'}
      >
        <User className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">Devotee</span>
      </button>

      {/* 2. Priest Tab */}
      <button
        type="button"
        onClick={() => triggerChange('PRIEST')}
        className={cn(
          'flex-1 sm:flex-initial px-3 sm:px-5 py-1.5 sm:py-2 rounded-sm text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer select-none whitespace-nowrap min-w-0',
          activeRole === 'PRIEST'
            ? 'bg-white text-[#780016] shadow-xs'
            : 'text-stone-700 hover:text-stone-950'
        )}
        aria-pressed={activeRole === 'PRIEST'}
      >
        <span className="text-amber-800 font-serif font-black text-sm leading-none shrink-0">ॐ</span>
        <span className="truncate">Vedic Purohit</span>
      </button>
    </div>
  );
};

export default AuthRoleTabs;
