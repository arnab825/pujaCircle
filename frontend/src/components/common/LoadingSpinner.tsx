import React, { useId } from 'react';
import { cn } from '@/lib/utils';

export interface LoadingSpinnerProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'vedic' | 'minimal' | 'dots';
  label?: string;
  sublabel?: string;
  fullscreen?: boolean;
}

/**
 * LoadingSpinner
 * Bespoke Vedic ritual platform loader.
 * Features an orbiting sacred saffron ring with an authentic center Diya lamp
 * and golden Agni flame spark matching the brand logo.
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  className,
  size = 'md',
  variant = 'vedic',
  label,
  sublabel,
  fullscreen = false,
}) => {
  const gradientId = useId();

  // Dimension mappings (in pixels)
  const sizeMap = {
    xs: { px: 22, stroke: 1.5, text: 'text-[10px]', diya: 14 },
    sm: { px: 30, stroke: 1.8, text: 'text-xs', diya: 18 },
    md: { px: 42, stroke: 2.2, text: 'text-xs', diya: 24 },
    lg: { px: 58, stroke: 2.6, text: 'text-sm', diya: 34 },
    xl: { px: 78, stroke: 3.0, text: 'text-base', diya: 46 },
  }[size];

  // 1. Dots Variant (For inline buttons and text chips)
  if (variant === 'dots') {
    return (
      <div className={cn('inline-flex items-center gap-1.5', className)}>
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-brand-saffron animate-bounce [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-bounce" />
        {label && <span className={cn('ml-1 text-muted-foreground font-medium', sizeMap.text)}>{label}</span>}
      </div>
    );
  }

  // 2. Minimal Dual-Track Conic Spinner
  if (variant === 'minimal') {
    const spinner = (
      <div className={cn('flex flex-col items-center justify-center gap-2.5', className)}>
        <div
          className="relative rounded-full animate-spin border-2 border-primary/20 border-t-primary"
          style={{ width: sizeMap.px, height: sizeMap.px }}
        />
        {label && <p className={cn('font-medium text-foreground text-center', sizeMap.text)}>{label}</p>}
        {sublabel && <p className="text-[11px] text-muted-foreground text-center">{sublabel}</p>}
      </div>
    );

    if (fullscreen) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs">
          {spinner}
        </div>
      );
    }
    return spinner;
  }

  // 3. Default 'vedic' Variant: Sacred Orbiting Saffron Ring + Center Sacred Diya Lamp
  const vedicSpinner = (
    <div className={cn('flex flex-col items-center justify-center text-center gap-3 select-none', className)}>
      <div
        className="relative flex items-center justify-center"
        style={{ width: sizeMap.px, height: sizeMap.px }}
      >
        {/* Ambient Soft Sacred Glow Background */}
        <div
          className="absolute inset-0 rounded-full bg-primary/10 blur-xs animate-pulse"
          style={{ animationDuration: '2s' }}
        />

        {/* Orbiting Sacred Saffron Arc SVG */}
        <svg
          width={sizeMap.px}
          height={sizeMap.px}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="animate-spin"
          style={{ animationDuration: '1.4s' }}
        >
          {/* Base Guide Track */}
          <circle
            cx="18"
            cy="18"
            r="14.5"
            stroke="currentColor"
            strokeWidth={sizeMap.stroke}
            className="text-primary/15"
          />

          {/* Active Saffron Auspicious Arc */}
          <circle
            cx="18"
            cy="18"
            r="14.5"
            stroke={`url(#${gradientId})`}
            strokeWidth={sizeMap.stroke}
            strokeLinecap="round"
            strokeDasharray="60 32"
            strokeDashoffset="12"
          />

          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E45314" />
              <stop offset="100%" stopColor="#FAAD07" />
            </linearGradient>
          </defs>
        </svg>

        {/* Central Sacred Diya & Flame Lamp (Static & Upright with Golden Spark) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg
            width={sizeMap.diya}
            height={sizeMap.diya}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-xs"
          >
            {/* Diya Base (Sacred Oil Lamp Bowl) */}
            <path
              d="M8.5 18C8.5 22 11.5 23.8 16 23.8C20.5 23.8 23.5 22 23.5 18H8.5Z"
              fill="#E45314"
            />
            {/* Diya Lip Line */}
            <path
              d="M7.5 18H24.5"
              stroke="#E45314"
              strokeWidth="1.2"
              strokeLinecap="round"
            />

            {/* Sacred Agni / Diya Flame */}
            <path
              d="M16 6.5C14 9.8 12 12.5 12 14.8C12 17 13.8 18.5 16 18.5C18.2 18.5 20 17 20 14.8C20 12.5 18 9.8 16 6.5Z"
              fill="#E45314"
            />

            {/* Inner Flame Core (Golden Warmth Spark - Gentle Pulse) */}
            <path
              d="M16 10.5C15 12.5 14 14 14 15.2C14 16.3 14.8 17.2 16 17.2C17.2 17.2 18 16.3 18 15.2C18 14 17 12.5 16 10.5Z"
              fill="#FAAD07"
              className="animate-pulse"
              style={{ animationDuration: '1.5s' }}
            />
          </svg>
        </div>
      </div>

      {/* Optional Typography */}
      {(label || sublabel) && (
        <div className="space-y-0.5 max-w-xs">
          {label && (
            <p className={cn('font-semibold font-serif text-foreground tracking-tight', sizeMap.text)}>
              {label}
            </p>
          )}
          {sublabel && (
            <p className="text-[11px] text-muted-foreground leading-snug">
              {sublabel}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-xs">
        {vedicSpinner}
      </div>
    );
  }

  return vedicSpinner;
};

export default LoadingSpinner;
