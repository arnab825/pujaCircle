import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";

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
    image: "/images/hero_vedic_puja.webp",
    title: "Griha Pravesh & Vastu Shanti",
    subtitle: "New Home Sanctification & Vastu Blessing",
    objectPosition: "center 40%",
  },
  {
    id: "havan-ceremony",
    image: "/images/havan_fire_ceremony.webp",
    title: "Navagraha Shanti & Vedic Havan",
    subtitle: "Purifying Agnihotra & Planetary Peace",
    objectPosition: "center center",
  },
  {
    id: "samagri-thali",
    image: "/images/samagri_ritual_thali.webp",
    title: "Personalized Samagri Checklist",
    subtitle: "Scriptural Offerings & Ritual Kit Preparation",
    objectPosition: "center center",
  },
  {
    id: "devotee-blessing",
    image: "/images/devotee_family_blessing.webp",
    title: "Shri Satyanarayan Vrat Katha",
    subtitle: "Family Prosperity & Auspicious Katha Vidhi",
    objectPosition: "center 35%",
  },
  {
    id: "vedic-purohit",
    image: "/images/verified_purohit_portrait.webp",
    title: "Verified Gurukul Purohits",
    subtitle: "Authentic Vedic Lineage & Scriptural Vidhi",
    objectPosition: "center 12%",
  },
];

interface HeroVisualCarouselProps {
  items?: VisualItem[];
  autoScrollInterval?: number;
}

// 5 cloned sets for infinite seamless looping without visual jumps
const COPIES_COUNT = 5;
const HOME_SET = 2; // Middle set (index 2: items from 2*N to 3*N - 1)

export const HeroVisualCarousel: React.FC<HeroVisualCarouselProps> = ({
  items = DEFAULT_ITEMS,
  autoScrollInterval = 5000,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const numItems = items.length;

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
        cardGap: 14,
      });
    } else if (w < 1024) {
      setDimensions({
        cardWidth: Math.min(w * 0.75, 500),
        cardHeight: 300,
        cardGap: 18,
      });
    } else if (w < 1440) {
      setDimensions({ cardWidth: 620, cardHeight: 370, cardGap: 22 });
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

  // Virtual extended track: 5 copies of items
  const virtualSlides = useMemo(() => {
    const list: Array<VisualItem & { virtualIndex: number; originalIndex: number; copyIndex: number }> = [];
    for (let c = 0; c < COPIES_COUNT; c++) {
      for (let i = 0; i < numItems; i++) {
        list.push({
          ...items[i],
          virtualIndex: c * numItems + i,
          originalIndex: i,
          copyIndex: c,
        });
      }
    }
    return list;
  }, [items, numItems]);

  // Current track position starts in middle set (index = HOME_SET * numItems)
  const initialIndex = HOME_SET * numItems;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const currentIndexRef = useRef(initialIndex);
  currentIndexRef.current = currentIndex;

  // Active original item index (0 to numItems - 1)
  const activeOriginalIndex = ((currentIndex % numItems) + numItems) % numItems;

  // Drag interaction state
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [disableTransition, setDisableTransition] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const dragStartXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);
  const autoScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Transition to a specific virtual index
  const goToVirtualIndex = useCallback((targetIndex: number) => {
    setDisableTransition(false);
    setDragOffset(0);
    setCurrentIndex(targetIndex);
  }, []);

  const nextSlide = useCallback(() => {
    goToVirtualIndex(currentIndexRef.current + 1);
  }, [goToVirtualIndex]);

  const prevSlide = useCallback(() => {
    goToVirtualIndex(currentIndexRef.current - 1);
  }, [goToVirtualIndex]);

  // Dot click: finds the closest virtual slide corresponding to target original index
  const handleDotClick = useCallback(
    (targetOriginal: number) => {
      const currentOriginal = ((currentIndexRef.current % numItems) + numItems) % numItems;
      let diff = targetOriginal - currentOriginal;
      if (diff > numItems / 2) diff -= numItems;
      if (diff < -numItems / 2) diff += numItems;

      goToVirtualIndex(currentIndexRef.current + diff);
    },
    [numItems, goToVirtualIndex],
  );

  // Card click: clicking adjacent card directly slides it to center
  const handleCardClick = (virtualIndex: number) => {
    if (hasMovedRef.current) return;
    goToVirtualIndex(virtualIndex);
  };

  // Silent wrap-around reset when reaching outer copies
  const handleTransitionEnd = useCallback(() => {
    const cur = currentIndexRef.current;
    const minSafe = numItems; // Copy 1
    const maxSafe = (COPIES_COUNT - 1) * numItems - 1; // End of Copy 3

    if (cur < minSafe || cur > maxSafe) {
      const orig = ((cur % numItems) + numItems) % numItems;
      const normalized = HOME_SET * numItems + orig;

      // Silently teleport without animation to identical slide in HOME_SET
      setDisableTransition(true);
      setCurrentIndex(normalized);

      // Re-enable smooth transitions on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setDisableTransition(false);
        });
      });
    }
  }, [numItems]);

  // Autoscroll scheduler (pauses when user hovers or drags)
  const scheduleAutoScroll = useCallback(() => {
    if (autoScrollTimerRef.current) {
      clearTimeout(autoScrollTimerRef.current);
    }
    if (autoScrollInterval <= 0 || isHovered) return;

    autoScrollTimerRef.current = setTimeout(() => {
      if (!isDraggingRef.current) {
        nextSlide();
      }
    }, autoScrollInterval);
  }, [autoScrollInterval, isHovered, nextSlide]);

  useEffect(() => {
    scheduleAutoScroll();
    return () => {
      if (autoScrollTimerRef.current) {
        clearTimeout(autoScrollTimerRef.current);
      }
    };
  }, [currentIndex, isHovered, scheduleAutoScroll]);

  // Touch & pointer interaction: solid 1:1 direct tracking
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Fallback
    }

    if (autoScrollTimerRef.current) {
      clearTimeout(autoScrollTimerRef.current);
    }

    isDraggingRef.current = true;
    setIsDragging(true);
    hasMovedRef.current = false;
    dragStartXRef.current = e.clientX;
    setDragOffset(0);

    if (containerRef.current) {
      containerRef.current.style.cursor = "grabbing";
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - dragStartXRef.current;
    if (Math.abs(deltaX) > 8) {
      hasMovedRef.current = true;
    }
    // Direct 1:1 physical follow with finger/mouse
    setDragOffset(deltaX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Fallback
    }

    if (containerRef.current) {
      containerRef.current.style.cursor = "grab";
    }

    const deltaX = e.clientX - dragStartXRef.current;

    // Direct swipe threshold (40px)
    if (deltaX < -40) {
      nextSlide();
    } else if (deltaX > 40) {
      prevSlide();
    } else {
      // Clean snap back without spring
      setDragOffset(0);
    }

    // Keep hasMovedRef for 60ms so an accidental card click won't fire on drag release
    setTimeout(() => {
      hasMovedRef.current = false;
    }, 60);

    scheduleAutoScroll();
  };

  // Center alignment: translateX moves current card exactly into the viewport horizontal center
  const trackTransform = `translateX(calc(50% - ${currentIndex * step + cardWidth / 2}px + ${dragOffset}px))`;

  return (
    <div
      className="w-full flex flex-col items-center select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Interactive Carousel Stage */}
      <div
        ref={containerRef}
        tabIndex={0}
        aria-label="Vedic rituals slideshow carousel. Swipe to view ceremonies."
        className="w-full relative py-2 sm:py-4 overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y focus:outline-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            prevSlide();
          } else if (e.key === "ArrowRight") {
            nextSlide();
          }
        }}
      >
        {/* Background Soft Golden Aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-300 max-w-full h-100 rounded-full bg-linear-to-r from-amber-400/8 via-[#991B1B]/10 to-amber-400/8 blur-3xl pointer-events-none -z-10" />

        {/* Continuous Virtual Track */}
        <div
          ref={trackRef}
          onTransitionEnd={handleTransitionEnd}
          style={{
            height: `${cardHeight + 20}px`,
            transform: trackTransform,
            transition:
              isDragging || disableTransition
                ? "none"
                : "transform 420ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          className="relative flex items-center will-change-transform"
        >
          {virtualSlides.map((slide) => {
            const distance = Math.abs(slide.virtualIndex - currentIndex);
            const isCenter = distance === 0;

            // Only render items within 3 cards of center for peak browser rendering performance
            const isVisible = distance <= 3;
            if (!isVisible) {
              return (
                <div
                  key={`empty-${slide.virtualIndex}`}
                  style={{
                    width: `${cardWidth}px`,
                    marginRight: `${cardGap}px`,
                    flexShrink: 0,
                  }}
                  className="h-full pointer-events-none"
                />
              );
            }

            // Clean scale and visual hierarchy
            const scale = isCenter ? 1.0 : distance === 1 ? 0.94 : 0.88;
            const opacity = isCenter ? 1.0 : distance === 1 ? 0.85 : 0.55;
            const brightness = isCenter ? 1.0 : distance === 1 ? 0.82 : 0.65;
            const zIndex = isCenter ? 30 : 20 - distance * 5;

            return (
              <div
                key={`slide-${slide.virtualIndex}`}
                onClick={() => handleCardClick(slide.virtualIndex)}
                style={{
                  width: `${cardWidth}px`,
                  height: `${cardHeight}px`,
                  marginRight: `${cardGap}px`,
                  flexShrink: 0,
                  transform: `scale(${scale})`,
                  opacity,
                  filter: `brightness(${brightness})`,
                  zIndex,
                  transition: isDragging
                    ? "none"
                    : "transform 420ms cubic-bezier(0.16, 1, 0.3, 1), opacity 350ms ease, filter 350ms ease, border-color 300ms ease",
                  transformOrigin: "center center",
                }}
                className={`relative rounded-2xl overflow-hidden shadow-[0_12px_32px_-6px_rgba(0,0,0,0.55)] border-2 ${
                  isCenter ? "border-[#C59A3F] shadow-amber-500/10" : "border-[#C59A3F]/40"
                } bg-stone-950 hover:border-amber-400 group cursor-pointer transition-shadow`}
              >
                {/* Visual Ceremony Photography */}
                <img
                  src={slide.image}
                  alt={slide.title}
                  style={{
                    objectPosition: slide.objectPosition || "center center",
                  }}
                  className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="eager"
                  draggable={false}
                />

                {/* High Contrast Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

                {/* Cylindrical Highlight Sheen */}
                <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />

                {/* Minimal Vedic Typography */}
                <div className="absolute bottom-0 inset-x-0 p-5 sm:p-7 text-left pointer-events-none flex flex-col justify-end">
                  <span className="text-xs sm:text-sm font-bold font-sans uppercase tracking-widest text-amber-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                    {slide.subtitle}
                  </span>
                  <h3 className="font-serif text-lg sm:text-2xl md:text-3xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] line-clamp-1 mt-1">
                    {slide.title}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Auspicious Slide Indicator Dots - Generous touch hit targets and responsive feedback */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-3 select-none">
        {items.map((item, idx) => {
          const isActive = idx === activeOriginalIndex;
          return (
            <button
              key={`dot-${item.id}`}
              type="button"
              aria-label={`Go to slide ${idx + 1}: ${item.title}`}
              aria-current={isActive ? "true" : undefined}
              onClick={(e) => {
                e.stopPropagation();
                handleDotClick(idx);
              }}
              className="group p-2.5 flex items-center justify-center cursor-pointer focus:outline-none"
            >
              <span
                className={`block transition-all duration-300 rounded-full ${
                  isActive
                    ? "w-8 h-2.5 bg-[#B45309] shadow-sm shadow-amber-900/30 scale-100"
                    : "w-2.5 h-2.5 bg-stone-400/60 group-hover:bg-[#B45309]/70 group-hover:scale-125"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default HeroVisualCarousel;
