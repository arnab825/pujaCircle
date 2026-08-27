import React from "react";
import { cn } from "@/lib/utils";

export interface GridBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  /** Optional container to wrap inner content */
  container?: boolean;
  /** Optional ambient sacred glow */
  ambientGlow?: boolean;
}

/**
 * GridBackground
 * Minimalist sacred Vedic background with a soft, serene morning dawn ambient aura
 * and an ultra-clean feathered structural grid.
 */
export const GridBackground: React.FC<GridBackgroundProps> = ({
  children,
  className,
  container = false,
  ambientGlow = true,
  ...props
}) => {
  return (
    <div
      className={cn(
        "relative min-h-[calc(100vh-4rem)] w-full bg-background overflow-hidden",
        className,
      )}
      {...props}
    >
      {/* 1. Subtle Structural Grid with Feathered Edge Mask */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid opacity-75 mask-[radial-gradient(ellipse_80%_80%_at_50%_35%,black_40%,transparent_100%)]"
      />

      {/* 2. Sacred Dawn Ambient Lighting */}
      {ambientGlow && (
        <>
          {/* Top-center soft auspicious dawn glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,hsl(var(--primary)/0.06),transparent_70%)]"
          />

          {/* Gentle secondary gold ambient warmth */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_400px_at_85%_15%,hsl(var(--brand-gold)/0.04),transparent)]"
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
