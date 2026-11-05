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
  transitionDuration?: number; // Time in ms for slow, graceful transition (default 1400ms)
  autoScrollInterval?: number; // Time in ms between automatic slide advances (default 6000ms)
}

// Gentle, organic sinusoidal curve - whisper-soft acceleration and deceleration with zero bounce
function easeInOutSine(x: number): number {
  return -(Math.cos(Math.PI * x) - 1) / 2;
}

// Calculates shortest signed circular distance along the track
function getShortestTrackDelta(
  fromScroll: number,
  toScroll: number,
  totalWidth: number,
): number {
  let diff = ((toScroll - fromScroll) % totalWidth + totalWidth) % totalWidth;
  if (diff > totalWidth / 2) {
    diff -= totalWidth;
  }
  return diff;
}

export const HeroVisualCarousel: React.FC<HeroVisualCarouselProps> = ({
  items = DEFAULT_ITEMS,
  transitionDuration = 1400, // Cinematic, ultra-smooth 1400ms glide
  autoScrollInterval = 6000, // Calm 6s interval before next slide advances
}) => {
  const totalReps = 3;
  const carouselItems = Array.from({ length: totalReps }, () => items).flat();
  const totalCards = carouselItems.length;

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Responsive dimensions: Large landscape cards with tight spacing
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
  const totalTrackWidth = totalCards * step;

  // Track state references (strictly normalized to [0, totalTrackWidth))
  const activeIdxRef = useRef<number>(0);
  const currentScrollRef = useRef<number>(0);
  const startScrollRef = useRef<number>(0);
  const travelDistanceRef = useRef<number>(0);
  const animStartTimeRef = useRef<number>(0);
  const transitionDurationRef = useRef<number>(transitionDuration);
  const isTransitioningRef = useRef<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartXRef = useRef<number>(0);
  const dragStartScrollRef = useRef<number>(0);
  const hasDraggedRef = useRef<boolean>(false);
  const autoScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Trigger smooth bounded transition to target slide (strictly 1 slide, slow and majestic)
  const goToOffset = useCallback(
    (deltaSteps: number, now: number) => {
      const nextIdx = (activeIdxRef.current + deltaSteps + totalCards) % totalCards;
      activeIdxRef.current = nextIdx;
      const targetScroll = nextIdx * step;
      const current =
        ((currentScrollRef.current % totalTrackWidth) + totalTrackWidth) %
        totalTrackWidth;
      const shortestDelta = getShortestTrackDelta(
        current,
        targetScroll,
        totalTrackWidth,
      );

      transitionDurationRef.current = transitionDuration; // Slow 1400ms glide
      startScrollRef.current = current;
      travelDistanceRef.current = shortestDelta;
      animStartTimeRef.current = now;
      isTransitioningRef.current = true;
    },
    [step, totalCards, totalTrackWidth, transitionDuration],
  );

  // Continuous automatic scrolling: seamlessly resumes after swipe/drag
  const resetAutoScroll = useCallback(() => {
    if (autoScrollTimerRef.current) {
      clearTimeout(autoScrollTimerRef.current);
    }
    if (autoScrollInterval <= 0) return;

    autoScrollTimerRef.current = setTimeout(() => {
      // If user is currently dragging, wait and reschedule
      if (isDraggingRef.current) {
        resetAutoScroll();
        return;
      }
      goToOffset(1, performance.now());
      resetAutoScroll();
    }, autoScrollInterval);
  }, [autoScrollInterval, goToOffset]);

  useEffect(() => {
    resetAutoScroll();
    return () => {
      if (autoScrollTimerRef.current) {
        clearTimeout(autoScrollTimerRef.current);
      }
    };
  }, [resetAutoScroll]);

  // Pointer drag interaction: Mouse/Touch down
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only primary button
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Fallback
    }

    // Freeze motion immediately on touch/click to grab card
    isTransitioningRef.current = false;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    dragStartXRef.current = e.clientX;
    dragStartScrollRef.current = currentScrollRef.current;

    if (containerRef.current) {
      containerRef.current.style.cursor = "grabbing";
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - dragStartXRef.current;
    if (Math.abs(deltaX) > 4) {
      hasDraggedRef.current = true;
    }

    // Direct natural sliding follows hand/mouse
    let nextScroll = dragStartScrollRef.current - deltaX;
    nextScroll =
      ((nextScroll % totalTrackWidth) + totalTrackWidth) % totalTrackWidth;
    currentScrollRef.current = nextScroll;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    if (containerRef.current) {
      containerRef.current.style.cursor = "grab";
    }

    // If user clicked (did not drag): do nothing here; card click handles centering if needed
    if (!hasDraggedRef.current) {
      isTransitioningRef.current = false;
      return;
    }

    // User swiped or dragged:
    const deltaX = e.clientX - dragStartXRef.current;
    const current = currentScrollRef.current;

    // Strict 1-slide movement: A swipe gesture advances EXACTLY 1 slide (never skips!)
    let targetIdx: number;
    let isSwipe = false;
    if (deltaX < -25) {
      // Swiped left -> advance exactly to next slide (+1, slow cinematic glide)
      targetIdx = (activeIdxRef.current + 1 + totalCards) % totalCards;
      isSwipe = true;
    } else if (deltaX > 25) {
      // Swiped right -> go back exactly to previous slide (-1, slow cinematic glide)
      targetIdx = (activeIdxRef.current - 1 + totalCards) % totalCards;
      isSwipe = true;
    } else {
      // Minor drag under 25px -> settle on closest card
      targetIdx = (Math.round(current / step) + totalCards) % totalCards;
    }

    activeIdxRef.current = targetIdx;
    const targetScroll = targetIdx * step;
    const shortestDelta = getShortestTrackDelta(
      current,
      targetScroll,
      totalTrackWidth,
    );

    // Slow glide on swipe (1400ms), smooth settle on small release
    const dynamicDuration = isSwipe
      ? transitionDuration
      : Math.max(600, Math.min(transitionDuration, Math.abs(shortestDelta) * 1.5));
    transitionDurationRef.current = dynamicDuration;

    startScrollRef.current = current;
    travelDistanceRef.current = shortestDelta;
    animStartTimeRef.current = performance.now();
    isTransitioningRef.current = true;

    // Automatic wise: seamlessly restart autoscroll cycle from this newly swiped slide
    resetAutoScroll();
  };

  // Card click: clicking a side card smoothly centers it; clicking center card stays still
  const handleCardClick = (distFromCenter: number) => {
    if (hasDraggedRef.current) return;
    if (Math.abs(distFromCenter) > cardWidth * 0.3) {
      const direction = distFromCenter > 0 ? 1 : -1;
      goToOffset(direction, performance.now());
      resetAutoScroll();
    } else {
      // Center card clicked: stay frozen right there
      isTransitioningRef.current = false;
    }
  };

  // 60/120fps hardware-accelerated animation frame loop
  useAnimationFrame((time) => {
    if (!containerRef.current) return;

    if (!isDraggingRef.current && isTransitioningRef.current) {
      // Smooth simultaneous sliding curve with gentle sinusoidal deceleration
      const elapsed = time - animStartTimeRef.current;
      const duration = transitionDurationRef.current || transitionDuration;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutSine(progress);

      currentScrollRef.current =
        ((startScrollRef.current + travelDistanceRef.current * eased) %
          totalTrackWidth +
          totalTrackWidth) %
        totalTrackWidth;

      if (progress >= 1) {
        currentScrollRef.current =
          ((startScrollRef.current + travelDistanceRef.current) %
            totalTrackWidth +
            totalTrackWidth) %
          totalTrackWidth;
        isTransitioningRef.current = false;
      }
    }

    // Render 3D Coverflow cards
    const scroll =
      ((currentScrollRef.current % totalTrackWidth) + totalTrackWidth) %
      totalTrackWidth;
    const containerWidth = containerRef.current.clientWidth;
    const containerCenter = containerWidth / 2;
    const halfTrack = totalTrackWidth / 2;

    cardRefs.current.forEach((card, idx) => {
      if (!card) return;

      const rawX = idx * step - scroll;
      const mod =
        ((rawX % totalTrackWidth) + totalTrackWidth) % totalTrackWidth;
      const distFromCenter = mod > halfTrack ? mod - totalTrackWidth : mod;

      // Cull cards outside viewport
      const screenX = containerCenter + distFromCenter - cardWidth / 2;
      const isVisible =
        screenX + cardWidth > -cardWidth &&
        screenX < containerWidth + cardWidth;

      if (!isVisible) {
        card.style.visibility = "hidden";
        return;
      }
      card.style.visibility = "visible";

      const normalized = distFromCenter / cardWidth;
      const clampedNorm = Math.max(-1.5, Math.min(1.5, normalized));

      // Clean, calm 3D depth - photos flow together simultaneously left and right
      const rotateY = -clampedNorm * 12; // gentle 12deg
      const translateZ = -Math.abs(clampedNorm) * 35; // gentle 35px depth
      const scale = 1 - Math.min(Math.abs(clampedNorm) * 0.05, 0.08); // subtle 5% scale
      const zIndex = Math.round(50 - Math.abs(clampedNorm) * 10);
      const brightness = 1 - Math.min(Math.abs(clampedNorm) * 0.15, 0.25);

      card.style.zIndex = `${zIndex}`;
      card.style.filter = `brightness(${brightness})`;
      card.style.transform = `translate3d(${distFromCenter}px, 0px, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
      card.dataset.dist = `${distFromCenter}`;
    });
  });

  return (
    <div className="w-full flex flex-col items-center">
      {/* Interactive Carousel Stage (Clean, No Arrows, No Bottom Toolbar) */}
      <div
        ref={containerRef}
        tabIndex={0}
        aria-label="Vedic rituals carousel. Drag with cursor to slide."
        className="w-full relative py-2 sm:py-4 select-none overflow-hidden perspective-[1400px] cursor-grab active:cursor-grabbing touch-pan-y focus:outline-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            goToOffset(-1, performance.now());
            resetAutoScroll();
          } else if (e.key === "ArrowRight") {
            goToOffset(1, performance.now());
            resetAutoScroll();
          }
        }}
      >
        {/* Background Soft Golden Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-300 max-w-full h-100 rounded-full bg-linear-to-r from-amber-400/8 via-[#991B1B]/10 to-amber-400/8 blur-3xl pointer-events-none -z-10" />

        {/* 3D Perspective Stage */}
        <div
          style={{
            height: `${cardHeight + 20}px`,
          }}
          className="relative w-full transform-3d flex items-center justify-center overflow-visible"
        >
          {carouselItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              ref={(el) => {
                cardRefs.current[idx] = el;
              }}
              onClick={(e) => {
                const el = e.currentTarget;
                const dist = parseFloat(el.dataset.dist || "0");
                handleCardClick(dist);
              }}
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroVisualCarousel;
