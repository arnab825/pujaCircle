import React, { useId } from "react";
import { cn } from "@/lib/utils";

export interface PujaCircleLogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
  withBackground?: boolean;
}

/**
 * PujaCircleLogo
 * Interactive bespoke Vedic logo emblem:
 * On hover, the outer saffron backdrop dissolves to 0 opacity,
 * and the outer circle ring transitions to a high-contrast saffron arc (#FF5500)
 * with a crisp dark defining boundary track that continuously spins around the black Diya disc.
 */
export const PujaCircleLogo: React.FC<PujaCircleLogoProps> = ({
  className,
  size = 32,
  withBackground = true,
  ...props
}) => {
  const gradientId = useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "shrink-0 select-none group/logo cursor-pointer overflow-visible transition-transform duration-300",
        className
      )}
      {...props}
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#E45314" />
          <stop offset="100%" stopColor="#BF400B" />
        </linearGradient>

        {/* Subtle drop shadow for spinning saffron halo on light backgrounds */}
        <filter id="haloGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="0.8" floodColor="#121214" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Saffron background container - Dissolves to 0 opacity on hover */}
      {withBackground && (
        <rect
          width="32"
          height="32"
          rx="6.5"
          fill={`url(#${gradientId})`}
          className="transition-all duration-300 ease-out origin-center group-hover:opacity-0 group-hover:scale-75 group-hover/logo:opacity-0 group-hover/logo:scale-75"
        />
      )}

      {/* Main Center Group */}
      <g className="transition-transform duration-300 ease-out origin-center group-hover:scale-105 group-hover/logo:scale-105 group-hover:drop-shadow-md group-hover/logo:drop-shadow-md">
        {/* Inner Dark Sacred Disc with Crisp Defining Border */}
        <circle
          cx="16"
          cy="16"
          r="11.5"
          fill="#121214"
          className="stroke-[#121214] stroke-[0.75px]"
        />

        {/* Outer Rotating Saffron / White Ring on Hover */}
        <g
          className="origin-center group-hover:animate-spin group-hover/logo:animate-spin"
          style={{ transformOrigin: "16px 16px", animationDuration: "3.2s" }}
        >
          {/* Base Guide Track: White when resting, dark slate/charcoal on hover for crisp contrast against white background */}
          <circle
            cx="16"
            cy="16"
            r="11.5"
            strokeWidth="1.4"
            className="stroke-white/30 group-hover:stroke-[#2A2A30] group-hover/logo:stroke-[#2A2A30] transition-colors duration-300"
          />

          {/* Saffron Contrast Under-Stroke (Dark Outline behind the Saffron Arc for 3D Contrast on light backgrounds) */}
          <circle
            cx="16"
            cy="16"
            r="11.5"
            stroke="#121214"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeDasharray="48 24"
            strokeDashoffset="10"
            className="opacity-0 group-hover:opacity-100 group-hover/logo:opacity-100 transition-opacity duration-300"
          />

          {/* Active Auspicious Saffron Arc (Vibrant, Bold & Crisp) */}
          <circle
            cx="16"
            cy="16"
            r="11.5"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeDasharray="48 24"
            strokeDashoffset="10"
            className="stroke-white group-hover:stroke-[#FF5500] group-hover/logo:stroke-[#FF5500] transition-colors duration-300"
          />
        </g>

        {/* Diya Base (Sacred Oil Lamp Bowl - Stays Upright & Static) */}
        <path
          d="M8.5 18C8.5 22 11.5 23.8 16 23.8C20.5 23.8 23.5 22 23.5 18H8.5Z"
          fill="#FFFFFF"
        />

        {/* Diya Lip Line */}
        <path
          d="M7.5 18H24.5"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Sacred Agni / Diya Flame */}
        <path
          d="M16 6.5C14 9.8 12 12.5 12 14.8C12 17 13.8 18.5 16 18.5C18.2 18.5 20 17 20 14.8C20 12.5 18 9.8 16 6.5Z"
          fill="#FFFFFF"
        />

        {/* Inner Flame Core (Golden Warmth Spark) */}
        <path
          d="M16 10.5C15 12.5 14 14 14 15.2C14 16.3 14.8 17.2 16 17.2C17.2 17.2 18 16.3 18 15.2C18 14 17 12.5 16 10.5Z"
          fill="#FAAD07"
        />
      </g>
    </svg>
  );
};

export default PujaCircleLogo;
