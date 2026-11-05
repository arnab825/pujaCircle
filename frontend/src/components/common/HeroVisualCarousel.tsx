import React, { useRef, useState, useEffect, useCallback } from "react";
import { useAnimationFrame } from "framer-motion";

export interface VisualItem {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  objectPosition?: string;
}

const DEFAULT_ITEMS: VisualItem[] = [
  {
    id: "griha-pravesh",
    image: "/images/hero_vedic_puja.jpg",
    title: "Griha Pravesh & Vastu Shanti",
    subtitle: "New Home Sanctification & Vastu Blessing",
    objectPosition: "center 40%",
  },
  {
    id: "havan-ceremony",
    image: "/images/havan_fire_ceremony.jpg",
    title: "Navagraha Shanti & Vedic Havan",
    subtitle: "Purifying Agnihotra & Planetary Peace",
    objectPosition: "center center",
  },
  {
    id: "samagri-thali",
    image: "/images/samagri_ritual_thali.jpg",
    title: "Personalized Samagri Checklist",
    subtitle: "Scriptural Offerings & Ritual Kit Preparation",
    objectPosition: "center center",
  },
  {
    id: "devotee-blessing",
    image: "/images/devotee_family_blessing.jpg",
    title: "Shri Satyanarayan Vrat Katha",
    subtitle: "Family Prosperity & Auspicious Katha Vidhi",
    objectPosition: "center 35%",
  },
  {
    id: "vedic-purohit",
    image: "/images/verified_purohit_portrait.jpg",
    title: "Verified Gurukul Purohits",
    subtitle: "Authentic Vedic Lineage & Scriptural Vidhi",
    objectPosition: "center 12%",
  },
];

interface HeroVisualCarouselProps {
  items?: VisualItem[];
  transitionDuration?: number; // Duration in ms for gentle slide glide (default 750ms)
  autoScrollInterval?: number; // Time in ms before next slide automatically advances (default 5000ms)
}

// Clean, natural deceleration curve - glides smoothly in swipe direction and coasts to a stop
function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}

// Fixed off-screen buffer offsets ensuring continuous smooth sliding without unmounting
const OFFSETS = [-4, -3, -2, -1, 0, 1, 2, 3, 4];

export const HeroVisualCarousel: React.FC<HeroVisualCarouselProps> = ({
  items = DEFAULT_ITEMS,
  transitionDuration = 750, // Smooth, natural 750ms coasting glide
  autoScrollInterval = 5000, // 5 seconds display time per ritual slide
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Responsive dimensions
  const [dimensions, setDimensions] = useState({
    cardWidth: 640,
    cardHeight: 380,
    cardGap: 22,
  });

  const updateDimensions = useCallback(() => {
    const w = typeof window !== "undefined" ? window.innerWidth : 1200;
    if (w < 640) {
      setDimensions({
        cardWidth: Math.min(w * 0.88, 360),
        cardHeight: 220,
        cardGap: 12,
      });
    } else if (w < 1024) {
      setDimensions({
        cardWidth: Math.min(w * 0.75, 500),
        cardHeight: 300,
        cardGap: 16,
      });
    } else if (w < 1440) {
      setDimensions({ cardWidth: 620, cardHeight: 370, cardGap: 20 });
    } else {
      setDimensions({ cardWidth: 700, cardHeight: 410, cardGap: 24 });
    }
  }, []);

  useEffect(() => {
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [updateDimensions]);

  const { cardWidth, cardHeight, cardGap } = dimensions;
  const step = cardWidth + cardGap;

  // Discrete index in continuous virtual integer space (0, 1, 2, 3...)
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);
  currentIndexRef.current = currentIndex;

  // Continuous visual position of the carousel (e.g. 0.0 -> 1.0 during slide transition)
  const displayIndexRef = useRef(0);
  const targetIndexRef = useRef(0);

  // Transition animation state
  const isAnimatingRef = useRef(false);
  const animStartPosRef = useRef(0);
  const animTravelRef = useRef(0);
  const animStartTimeRef = useRef(0);
  const animDurationRef = useRef(transitionDuration);

  // Touch and pointer dragging state
  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartDisplayIndexRef = useRef(0);

  // Autoscroll timer
  const autoScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Render 3D Coverflow positioning for all rendered card slots
  const updateCardTransforms = useCallback(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const containerCenter = containerWidth / 2;
    const displayIdx = displayIndexRef.current;

    cardRefs.current.forEach((card, vIdx) => {
      if (!card) return;
      const relDiff = vIdx - displayIdx;
      const distFromCenter = relDiff * step;

      // Viewport culling
      const screenX = containerCenter + distFromCenter - cardWidth / 2;
      const isVisible =
        screenX + cardWidth > -cardWidth * 0.5 &&
        screenX < containerWidth + cardWidth * 0.5;

      if (!isVisible) {
        card.style.visibility = "hidden";
        return;
      }
      card.style.visibility = "visible";

      const normalized = distFromCenter / cardWidth;
      const clampedNorm = Math.max(-1.5, Math.min(1.5, normalized));

      // Pure flat horizontal slide: completely eliminates pendulum nodding and 3D tilting
      const scale = 1 - Math.min(Math.abs(clampedNorm) * 0.06, 0.1);
      const zIndex = Math.round(50 - Math.abs(clampedNorm) * 10);
      const brightness = 1 - Math.min(Math.abs(clampedNorm) * 0.18, 0.28);

      card.style.zIndex = `${zIndex}`;
      card.style.filter = `brightness(${brightness})`;
      card.style.transform = `translate3d(${distFromCenter}px, 0px, 0px) scale(${scale})`;
    });
  }, [cardWidth, step]);

  // Smoothly glide into target virtual index (strictly 1 slide, zero bounce)
  const startTransitionTo = useCallback(
    (targetIdx: number, duration = transitionDuration) => {
      targetIndexRef.current = targetIdx;
      animStartPosRef.current = displayIndexRef.current;
      animTravelRef.current = targetIdx - displayIndexRef.current;
      animStartTimeRef.current = performance.now();
      animDurationRef.current = duration;
      isAnimatingRef.current = true;
    },
    [transitionDuration],
  );

  // Automatic slideshow scheduler (strictly +1 slide, continuous circular flow)
  const scheduleAutoScroll = useCallback(() => {
    if (autoScrollTimerRef.current) {
      clearTimeout(autoScrollTimerRef.current);
    }
    if (autoScrollInterval <= 0) return;

    autoScrollTimerRef.current = setTimeout(() => {
      if (isDraggingRef.current) {
        scheduleAutoScroll();
        return;
      }
      // Auto-advance strictly +1 slide with slow, noble glide
      startTransitionTo(currentIndexRef.current + 1, transitionDuration);
    }, autoScrollInterval);
  }, [autoScrollInterval, startTransitionTo, transitionDuration]);

  // Initialize and clean up autoscroll timer
  useEffect(() => {
    scheduleAutoScroll();
    return () => {
      if (autoScrollTimerRef.current) {
        clearTimeout(autoScrollTimerRef.current);
      }
    };
  }, [scheduleAutoScroll]);

  // 60/120fps hardware-accelerated animation frame loop
  useAnimationFrame((time) => {
    if (isAnimatingRef.current) {
      const elapsed = time - animStartTimeRef.current;
      const duration = animDurationRef.current || transitionDuration;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      displayIndexRef.current =
        animStartPosRef.current + animTravelRef.current * eased;

      if (progress >= 1) {
        displayIndexRef.current = targetIndexRef.current;
        isAnimatingRef.current = false;
        setCurrentIndex(targetIndexRef.current);
        scheduleAutoScroll();
      }
    }

    updateCardTransforms();
  });

  // Direct 1:1 Touch & Mouse interaction
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Fallback
    }

    // Freeze motion immediately right where the finger touches
    isAnimatingRef.current = false;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartXRef.current = e.clientX;
    dragStartDisplayIndexRef.current = Math.round(displayIndexRef.current);
    displayIndexRef.current = dragStartDisplayIndexRef.current;

    if (autoScrollTimerRef.current) {
      clearTimeout(autoScrollTimerRef.current);
    }

    if (containerRef.current) {
      containerRef.current.style.cursor = "grabbing";
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - dragStartXRef.current;
    if (Math.abs(deltaX) > 4) {
      hasMovedRef.current = true;
    }

    // Every slide picture feels touch: 100% natural, direct synchronization with finger
    // Clamped strictly to at most 1 slide so aggressive swiping can never skip +2 or +3
    const clampedDelta = Math.max(-step, Math.min(step, deltaX));
    displayIndexRef.current =
      dragStartDisplayIndexRef.current - clampedDelta / step;

    updateCardTransforms();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Fallback
    }

    if (containerRef.current) {
      containerRef.current.style.cursor = "grab";
    }

    const deltaX = e.clientX - dragStartXRef.current;

    if (!hasMovedRef.current || Math.abs(deltaX) < 8) {
      // Tap without drag: keep autoscroll going
      scheduleAutoScroll();
      return;
    }

    // Direct, standard website swipe commitment:
    // User swiped left -> continue left into next slide (target +1)
    // User swiped right -> continue right into previous slide (target -1)
    // Never snaps back in reverse!
    const base = Math.round(dragStartDisplayIndexRef.current);
    const targetIndex = deltaX < 0 ? base + 1 : base - 1;

    // Smoothly glide into target slide with clean easeOutCubic, then resume autoscroll
    startTransitionTo(targetIndex, 700);
  };

  // Card click: clicking adjacent card smoothly centers it
  const handleCardClick = (vIdx: number) => {
    if (hasMovedRef.current) return;
    if (vIdx === currentIndex + 1) {
      startTransitionTo(currentIndex + 1, 700);
    } else if (vIdx === currentIndex - 1) {
      startTransitionTo(currentIndex - 1, 700);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Interactive Carousel Stage (Clean, No Arrows, Continuous Motion) */}
      <div
        ref={containerRef}
        tabIndex={0}
        aria-label="Vedic rituals slideshow carousel. Swipe to view ceremonies."
        className="w-full relative py-2 sm:py-4 select-none overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y focus:outline-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            startTransitionTo(currentIndex - 1, 900);
          } else if (e.key === "ArrowRight") {
            startTransitionTo(currentIndex + 1, 900);
          }
        }}
      >
        {/* Background Soft Golden Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-300 max-w-full h-100 rounded-full bg-linear-to-r from-amber-400/8 via-[#991B1B]/10 to-amber-400/8 blur-3xl pointer-events-none -z-10" />

        {/* Flat Slideshow Stage */}
        <div
          style={{
            height: `${cardHeight + 20}px`,
          }}
          className="relative w-full flex items-center justify-center overflow-visible"
        >
          {OFFSETS.map((offset) => {
            const vIdx = currentIndex + offset;
            const itemIdx =
              ((vIdx % items.length) + items.length) % items.length;
            const item = items[itemIdx];

            return (
              <div
                key={vIdx}
                ref={(el) => {
                  if (el) {
                    cardRefs.current.set(vIdx, el);
                  } else {
                    cardRefs.current.delete(vIdx);
                  }
                }}
                onClick={() => handleCardClick(vIdx)}
                style={{
                  width: `${cardWidth}px`,
                  height: `${cardHeight}px`,
                  left: "50%",
                  marginLeft: `-${cardWidth / 2}px`,
                  top: "50%",
                  marginTop: `-${cardHeight / 2}px`,
                  transformOrigin: "center center",
                  willChange: "transform, filter",
                }}
                className="absolute rounded-2xl overflow-hidden shadow-[0_12px_30px_-6px_rgba(0,0,0,0.5)] border-2 border-[#C59A3F]/50 bg-stone-950 transition-[border-color,box-shadow] duration-300 hover:border-amber-400 group cursor-pointer"
              >
                {/* Cinematic Landscape Photo */}
                <img
                  src={item.image}
                  alt={item.title}
                  style={{
                    objectPosition: item.objectPosition || "center center",
                  }}
                  className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="eager"
                  draggable={false}
                />

                {/* High Contrast Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-transparent pointer-events-none" />

                {/* Cylindrical Highlight Sheen */}
                <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />

                {/* Clean Minimal Typography */}
                <div className="absolute bottom-0 inset-x-0 p-5 sm:p-7 text-left pointer-events-none flex flex-col justify-end">
                  <span className="text-xs sm:text-sm font-bold font-sans uppercase tracking-widest text-amber-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                    {item.subtitle}
                  </span>
                  <h3 className="font-serif text-lg sm:text-2xl md:text-3xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] line-clamp-1 mt-1">
                    {item.title}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HeroVisualCarousel;
