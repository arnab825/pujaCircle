import React from 'react';
import { User, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AuthRoleTabsProps {
  activeRole: 'USER' | 'PRIEST';
  onChange: (role: 'USER' | 'PRIEST') => void;
  className?: string;
}

/**
 * AuthRoleTabs
 * Premium segmented role-switcher pill for Auth cards (Devotee vs Purohit).
 * Features solid saffron active state, smooth easing, and clear iconography.
 */
export const AuthRoleTabs: React.FC<AuthRoleTabsProps> = ({
  activeRole,
  onChange,
  className,
}) => {
  return (
    <div
      className={cn(
        'w-full bg-card p-1.5 rounded-lg border border-border/80 shadow-xs mb-4',
        className
      )}
    >
      <div className="grid grid-cols-2 gap-1.5">
        {/* 1. Devotee Tab */}
        <button
          type="button"
          onClick={() => onChange('USER')}
          className={cn(
            'flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-xs transition-all duration-200 select-none cursor-pointer',
            activeRole === 'USER'
              ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium'
          )}
          aria-pressed={activeRole === 'USER'}
        >
          <User
            className={cn(
              'h-4 w-4 shrink-0 transition-transform duration-200',
              activeRole === 'USER'
                ? 'text-primary-foreground scale-105'
                : 'text-muted-foreground'
            )}
          />
          <span>Devotee</span>
        </button>

        {/* 2. Purohit (Priest) Tab */}
        <button
          type="button"
          onClick={() => onChange('PRIEST')}
          className={cn(
            'flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-xs transition-all duration-200 select-none cursor-pointer',
            activeRole === 'PRIEST'
              ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium'
          )}
          aria-pressed={activeRole === 'PRIEST'}
        >
          <Flame
            className={cn(
              'h-4 w-4 shrink-0 transition-transform duration-200',
              activeRole === 'PRIEST'
                ? 'text-primary-foreground scale-105'
                : 'text-primary'
            )}
          />
          <span>Purohit (Priest)</span>
        </button>
      </div>
    </div>
  );
};

export default AuthRoleTabs;
