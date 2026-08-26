import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface GridBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  /** Optional container to wrap inner content */
  container?: boolean;
  /** Enable dynamic shimmering wave effect */
  shimmer?: boolean;
}

/**
 * GridBackground
 * Refined 40px Vedic grid background with an elegant, soft left-to-right glowing shimmer beam.
 */
export const GridBackground: React.FC<GridBackgroundProps> = ({
  children,
  className,
  container = false,
  shimmer = true,
  ...props
}) => {
  return (
    <div
      className={cn(
        'relative min-h-[calc(100vh-4rem)] w-full bg-background overflow-hidden',
        className
      )}
      {...props}
    >
      {/* 1. Base Static Grid Layer */}
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-60" />

      {/* 2. Left-to-Right Glowing Shimmer Beam */}
      {shimmer && (
        <>
          {/* Luminous Glowing Grid Beam moving Left to Right */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 w-[40%] bg-grid z-0"
            style={{
              filter: 'drop-shadow(0 0 8px hsl(var(--primary) / 0.5)) drop-shadow(0 0 16px hsl(var(--primary) / 0.25))',
              maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,1) 50%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,1) 50%, transparent 100%)',
            }}
            animate={{
              left: ['-45%', '110%'],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: 'easeInOut',
              repeatDelay: 1.5,
            }}
          />

          {/* Soft ambient radiance moving alongside the grid shimmer */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 w-[35%] bg-linear-to-r from-transparent via-primary/6 to-transparent blur-2xl z-0"
            animate={{
              left: ['-45%', '110%'],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: 'easeInOut',
              repeatDelay: 1.5,
            }}
          />
        </>
      )}

      {/* 3. Foreground Content */}
      <div className="relative z-10">
        {container ? (
          <div className="container py-8 sm:py-12 md:py-16 px-4">
            {children}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default GridBackground;
