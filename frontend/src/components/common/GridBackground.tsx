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
 * Standardized Vedic grid background with a left-to-right glowing shimmer beam
 * powered by framer-motion.
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
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-70" />

      {/* 2. Left-to-Right Glowing Shimmer Beam */}
      {shimmer && (
        <>
          {/* Luminous Glowing Grid Beam moving Left to Right */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 w-[45%] bg-grid z-0"
            style={{
              filter: 'drop-shadow(0 0 12px hsl(var(--primary) / 0.7)) drop-shadow(0 0 24px hsl(var(--primary) / 0.4))',
              maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,1) 50%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,1) 50%, transparent 100%)',
            }}
            animate={{
              left: ['-50%', '115%'],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
              repeatDelay: 1.5,
            }}
          />

          {/* Soft warm light glow band travelling along with the grid beam */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 w-[40%] bg-linear-to-r from-transparent via-primary/8 to-transparent blur-xl z-0"
            animate={{
              left: ['-50%', '115%'],
            }}
            transition={{
              duration: 6,
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
