import React, { useMemo } from 'react';

/**
 * SacredBackground
 * Eye-pleasing, light, and graceful Vedic Sanctum canvas:
 * - Serene, warm silk foundation (#FCF9F2 / Chandan Ivory)
 * - Harmonious Solar Lotus Chakras styled with the beloved clean radiating geometry of the second chakra
 * - Refined, light opacity (matching the second chakra's light, airy, and eye-pleasing aesthetic)
 * - Delicate royal temple gold strokes (#B45309) with soft ethereal drop-shadow
 * - Rising sacred Havan & Diya golden embers with peaceful meditative drift
 * - Full Dark Mode compatibility (deep meditative Temple Twilight with glowing amber chakras)
 */
export const SacredBackground: React.FC = () => {
  // Balanced deterministic particles for sacred golden diya sparks / havan embers
  const particles = useMemo(() => {
    return [
      { id: 1, left: '5%', size: 3, duration: 20, delay: 0, opacity: 0.55 },
      { id: 2, left: '12%', size: 3.5, duration: 24, delay: 3, opacity: 0.65 },
      { id: 3, left: '20%', size: 2.5, duration: 18, delay: 1, opacity: 0.5 },
      { id: 4, left: '28%', size: 4, duration: 26, delay: 6, opacity: 0.7 },
      { id: 5, left: '37%', size: 3, duration: 22, delay: 4, opacity: 0.55 },
      { id: 6, left: '47%', size: 3.5, duration: 23, delay: 2, opacity: 0.65 },
      { id: 7, left: '55%', size: 2.5, duration: 19, delay: 7, opacity: 0.55 },
      { id: 8, left: '64%', size: 4.5, duration: 28, delay: 5, opacity: 0.7 },
      { id: 9, left: '73%', size: 3, duration: 20, delay: 8, opacity: 0.6 },
      { id: 10, left: '82%', size: 3.5, duration: 25, delay: 10, opacity: 0.7 },
      { id: 11, left: '90%', size: 2.5, duration: 17, delay: 12, opacity: 0.5 },
      { id: 12, left: '96%', size: 3, duration: 22, delay: 11, opacity: 0.6 },
      { id: 13, left: '16%', size: 3, duration: 23, delay: 9, opacity: 0.55 },
      { id: 14, left: '77%', size: 3.5, duration: 19, delay: 4, opacity: 0.65 },
    ];
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden select-none -z-10 bg-[#FCF9F2] dark:bg-[#0C0A10] transition-colors duration-500"
    >
      {/* 1. Divine Golden Aarti Ambient Aura (Top-center gentle morning sanctum glow) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 85% 60% at 50% -8%, rgba(251, 191, 36, 0.16) 0%, rgba(245, 158, 11, 0.05) 45%, transparent 75%)',
        }}
      />

      {/* 2. Soft Rosy Kumkum & Sandalwood Ambient Aura (Flanks and bottom) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 0% 0%, rgba(254, 215, 170, 0.14) 0%, transparent 45%), radial-gradient(circle at 100% 0%, rgba(253, 230, 138, 0.12) 0%, transparent 45%), radial-gradient(ellipse at 50% 100%, rgba(245, 158, 11, 0.05) 0%, transparent 50%)',
        }}
      />

      {/* 3. Soft Ambient Backlights behind Top Chakras for gentle, eye-pleasing depth */}
      <div
        className="absolute -top-16 -right-16 md:-top-24 md:-right-24 w-110 h-110 md:w-160 md:h-160 rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at center, rgba(245, 158, 11, 0.14) 0%, rgba(217, 119, 6, 0.04) 50%, transparent 75%)',
        }}
      />
      <div
        className="absolute -top-14 -left-14 md:-top-20 md:-left-20 w-100 h-100 md:w-150 md:h-150 rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at center, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.04) 50%, transparent 75%)',
        }}
      />

      {/* 4. Top-Right Grand Solar Lotus Chakra (First Chakra - Made light, radiating & graceful like the Second Chakra) */}
      <div
        className="absolute -top-24 -right-24 md:-top-32 md:-right-32 w-105 h-105 md:w-150 md:h-150 opacity-[0.24] md:opacity-[0.28] dark:opacity-[0.20] text-[#B45309] dark:text-[#FBBF24] animate-spin-mandala-cw transition-all duration-500 drop-shadow-[0_0_10px_rgba(217,119,6,0.18)]"
      >
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full stroke-current fill-none"
          strokeWidth="1.35"
        >
          {/* Central Bindu and Sacred Core */}
          <circle cx="200" cy="200" r="5" className="fill-current" />
          <circle cx="200" cy="200" r="16" strokeWidth="1.3" />
          <circle cx="200" cy="200" r="32" strokeWidth="1.3" />
          <circle cx="200" cy="200" r="52" strokeDasharray="3 4" strokeWidth="1.2" />

          {/* 16 Radiating Lotus Petals / Chakra Spokes with clean, light geometry */}
          {Array.from({ length: 16 }).map((_, i) => (
            <g key={`top-right-lotus-${i}`} transform={`rotate(${i * 22.5} 200 200)`}>
              <path
                d="M 200 62 C 220 105 214 155 200 200 C 186 155 180 105 200 62 Z"
                strokeWidth="1.35"
                fill="currentColor"
                fillOpacity="0.035"
              />
              <path
                d="M 200 200 L 200 62"
                strokeWidth="0.8"
                strokeDasharray="2 3"
              />
              <circle cx="200" cy="54" r="2.5" className="fill-current" />
            </g>
          ))}

          {/* Auspicious Concentric Chakra Outer Rings */}
          <circle cx="200" cy="200" r="162" strokeWidth="1.3" />
          <circle cx="200" cy="200" r="172" strokeDasharray="3 4" strokeWidth="1.3" />
          <circle cx="200" cy="200" r="182" strokeWidth="1.4" />

          {/* Outer Auspicious Pearls */}
          {Array.from({ length: 32 }).map((_, i) => (
            <circle
              key={`pearl-top-r-${i}`}
              cx="200"
              cy="18"
              r="2"
              transform={`rotate(${i * 11.25} 200 200)`}
              className="fill-current"
            />
          ))}
        </svg>
      </div>

      {/* 5. Top-Left Sacred Temple Kolam / Mangal Alpana Chakra (Counter-Clockwise - Light & Eye-Pleasing) */}
      <div
        className="absolute -top-20 -left-20 md:-top-28 md:-left-28 w-96 h-96 md:w-140 md:h-140 opacity-[0.23] md:opacity-[0.27] dark:opacity-[0.19] text-[#B45309] dark:text-[#FBBF24] animate-spin-mandala-ccw transition-all duration-500 drop-shadow-[0_0_10px_rgba(217,119,6,0.18)]"
      >
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full stroke-current fill-none"
          strokeWidth="1.35"
        >
          {/* Central Sacred Core */}
          <circle cx="200" cy="200" r="4.5" className="fill-current" />
          <circle cx="200" cy="200" r="18" strokeWidth="1.3" />
          <circle cx="200" cy="200" r="36" strokeDasharray="3 4" strokeWidth="1.3" />

          {/* 8-Fold Interlocking Sacred Kolam Curves with light translucent fill */}
          {Array.from({ length: 8 }).map((_, i) => (
            <g key={`kolam-loop-${i}`} transform={`rotate(${i * 45} 200 200)`}>
              <path
                d="M 200 130 C 230 115 238 158 200 200 C 162 158 170 115 200 130 Z"
                strokeWidth="1.35"
                fill="currentColor"
                fillOpacity="0.035"
              />
              <circle cx="200" cy="122" r="2.5" className="fill-current" />
            </g>
          ))}

          {/* 8-Fold Radiating Paisley / Mango Motif Outlines */}
          {Array.from({ length: 8 }).map((_, i) => (
            <g key={`kolam-paisley-${i}`} transform={`rotate(${i * 45 + 22.5} 200 200)`}>
              <path
                d="M 200 75 C 232 112 226 158 200 200 C 174 158 168 112 200 75 Z"
                strokeWidth="1.35"
                fill="currentColor"
                fillOpacity="0.03"
              />
              <path
                d="M 200 75 Q 214 54 200 42 Q 186 54 200 75"
                strokeWidth="1.0"
              />
            </g>
          ))}

          {/* Dainty Sacred Concentric Rings */}
          <circle cx="200" cy="200" r="162" strokeWidth="1.3" />
          <circle cx="200" cy="200" r="172" strokeDasharray="3 5" strokeWidth="1.3" />
          <circle cx="200" cy="200" r="182" strokeWidth="1.4" />

          {/* Kolam Edge Pearls */}
          {Array.from({ length: 24 }).map((_, i) => (
            <circle
              key={`kolam-pearl-${i}`}
              cx="200"
              cy="18"
              r="2.5"
              transform={`rotate(${i * 15} 200 200)`}
              className="fill-current"
            />
          ))}
        </svg>
      </div>

      {/* 6. Middle-Right Auspicious Solar Lotus Wheel (Second Chakra) */}
      <div
        className="hidden md:block absolute top-1/2 -right-28 md:-right-36 w-88 h-88 md:w-120 md:h-120 opacity-[0.24] md:opacity-[0.28] dark:opacity-[0.20] text-[#B45309] dark:text-[#FBBF24] animate-spin-mandala-cw transition-all duration-500 drop-shadow-[0_0_10px_rgba(217,119,6,0.18)]"
      >
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full stroke-current fill-none"
          strokeWidth="1.35"
        >
          <circle cx="200" cy="200" r="4.5" className="fill-current" />
          <circle cx="200" cy="200" r="28" strokeWidth="1.3" />
          <circle cx="200" cy="200" r="50" strokeDasharray="3 4" strokeWidth="1.2" />
          <circle cx="200" cy="200" r="160" strokeWidth="1.3" />
          <circle cx="200" cy="200" r="172" strokeDasharray="3 5" strokeWidth="1.3" />

          {/* 12-Petal Traditional Temple Lotus */}
          {Array.from({ length: 12 }).map((_, i) => (
            <g key={`right-lotus-${i}`} transform={`rotate(${i * 30} 200 200)`}>
              <path
                d="M 200 68 C 224 110 218 156 200 200 C 182 156 176 110 200 68 Z"
                strokeWidth="1.35"
                fill="currentColor"
                fillOpacity="0.035"
              />
              <circle cx="200" cy="60" r="2.5" className="fill-current" />
            </g>
          ))}
        </svg>
      </div>

      {/* 7. Bottom-Left Auspicious Mangal Kolam */}
      <div
        className="hidden lg:block absolute -bottom-28 -left-24 w-84 h-84 md:w-115 md:h-115 opacity-[0.24] md:opacity-[0.28] dark:opacity-[0.20] text-[#B45309] dark:text-[#FBBF24] animate-spin-mandala-cw transition-all duration-500 drop-shadow-[0_0_10px_rgba(217,119,6,0.18)]"
      >
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full stroke-current fill-none"
          strokeWidth="1.35"
        >
          <circle cx="200" cy="200" r="4" className="fill-current" />
          <circle cx="200" cy="200" r="25" strokeWidth="1.3" />
          <circle cx="200" cy="200" r="155" strokeWidth="1.3" />
          <circle cx="200" cy="200" r="166" strokeDasharray="3 5" strokeWidth="1.3" />
          <circle cx="200" cy="200" r="176" strokeWidth="1.4" />

          {/* 8-Fold Auspicious Petals */}
          {Array.from({ length: 8 }).map((_, i) => (
            <g key={`bot-lotus-${i}`} transform={`rotate(${i * 45} 200 200)`}>
              <path
                d="M 200 72 C 226 115 220 160 200 200 C 180 160 174 115 200 72 Z"
                strokeWidth="1.35"
                fill="currentColor"
                fillOpacity="0.035"
              />
              <path
                d="M 200 132 C 216 154 212 176 200 200 C 188 176 184 154 200 132 Z"
                strokeWidth="1.0"
              />
            </g>
          ))}
        </svg>
      </div>

      {/* 8. Rising Golden Diya Sparks / Havan Kund Embers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: p.left,
              bottom: '-20px',
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: '#FBBF24',
              boxShadow: '0 0 6px #FBBF24, 0 0 14px rgba(245, 158, 11, 0.45), 0 0 20px rgba(217, 119, 6, 0.2)',
              animation: `float-diya-sparkle ${p.duration}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
              opacity: p.opacity,
              willChange: 'transform, opacity',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SacredBackground;
