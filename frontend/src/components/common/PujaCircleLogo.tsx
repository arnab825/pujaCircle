import React, { useId } from "react";
import { cn } from "@/lib/utils";

export interface PujaCircleLogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
  withBackground?: boolean;
}

/**
 * PujaCircleLogo
 * Exact vector replica of the sacred PujaCircle favicon emblem.
 * Features the saffron gradient backdrop, deep charcoal inner circle disc,
 * crisp white outer ring arc, white Diya bowl, and rising Agni flame with golden warmth spark.
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
      className={cn("shrink-0 select-none", className)}
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
      </defs>

      {/* Background container with crisp modern rounding */}
      {withBackground && (
        <rect
          width="32"
          height="32"
          rx="6.5"
          fill={`url(#${gradientId})`}
        />
      )}

      {/* Inner Dark Sacred Disc for High Contrast */}
      <circle
        cx="16"
        cy="16"
        r="11.5"
        fill="#121214"
      />

      {/* Outer Sacred Circle Ring */}
      <circle
        cx="16"
        cy="16"
        r="11.5"
        stroke="#FFFFFF"
        strokeOpacity={0.3}
        strokeWidth="1.2"
      />
      <circle
        cx="16"
        cy="16"
        r="11.5"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeDasharray="48 24"
        strokeDashoffset="10"
      />

      {/* Diya Base (Sacred Oil Lamp Bowl) */}
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
    </svg>
  );
};

export default PujaCircleLogo;
