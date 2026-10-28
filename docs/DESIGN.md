# Design System & UI/UX Specification
## PujaCircle — Sacred Ceremony Design Language

**Document Path:** `docs/DESIGN.md`  
**Version:** 3.0 (Full-Stack Production System)  
**Status:** Active & Implemented  

---

## 1. Design Philosophy & Aesthetic Principles

PujaCircle’s design system balances ancient Vedic solemnity with the clarity, accessibility, and speed of modern web engineering:
- **Cultural Authenticity Without Clutter**: Avoids gaudy ornamentalism in favor of warm, considered tones inspired by temple sandstone, chandan (sandalwood), haldi (turmeric), and kumkum (sacred vermilion).
- **Dual-Type Hierarchy**: Editorial variable serif (**Fraunces**) conveys ceremony gravity, auspiciousness, and warmth; crisp variable sans (**Inter**) powers administrative tables, booking workflows, and time-slot selectors.
- **Micro-Interactions Over Distraction**: Subtle, purposeful motion (150ms–300ms) signals state transitions, slot selection, and card elevation without delaying user tasks.
- **Inclusive Accessibility**: Guaranteed WCAG 2.1 AA contrast ratios across all backgrounds and global reduced-motion preference compliance.

---

## 2. Color Palette & Token Architecture

Defined via CSS custom properties in `frontend/src/index.css` and bound into the Tailwind CSS v4 `@theme` layer:

| Token | HSL Value | Hex Equivalent | Usage & Role |
| :--- | :--- | :--- | :--- |
| `--brand-primary` | `20 68% 48%` | `#D9642C` | **Deep Saffron**: Primary action CTAs, active selection rings, active tabs |
| `--brand-primary-dark` | `20 65% 38%` | `#A84A1F` | **Dark Saffron**: Button hover, active focus states |
| `--brand-secondary` | `340 55% 22%` | `#5C1A2E` | **Regal Maroon**: Brand logos, top headers, admin sidebar accents |
| `--brand-accent` | `42 50% 55%` | `#C9A24B` | **Muted Gold**: Badges, star ratings, sacred highlight borders |
| `--brand-accent-soft` | `42 50% 88%` | `#EFE3C5` | **Soft Gold**: Highlight pills, notice callouts, active day indicator |
| `--background` | `40 40% 96%` | `#FAF6EF` | **Chandan Ivory**: Organic warm paper-like background |
| `--surface` | `0 0% 100%` | `#FFFFFF` | **Pure Card Surface**: Elevation cards, dialogs, dropdown sheets |
| `--surface-alt` | `40 33% 91%` | `#F2ECDF` | **Muted Surface**: Table header rows, secondary panel backgrounds |
| `--foreground` | `220 12% 12%` | `#231F20` | **Charcoal Body**: High contrast, readable typography |
| `--foreground-muted` | `30 5% 40%` | `#6B6560` | **Muted Charcoal**: Subtitles, timing notes, helper descriptions |

---

## 3. Standardized Booking Status Color Palette (DRY)

All booking statuses across Devotee, Priest, and Admin interfaces follow a single unified configuration (`BOOKING_STATUS_CONFIG` in `frontend/src/lib/constants.ts`):

| Booking Status | Label | Background Badge Style | Semantic Indicator |
| :--- | :--- | :--- | :--- |
| `CONFIRMED` | Confirmed | `bg-emerald-500/10 text-emerald-600 border-emerald-500/20` | Emerald Green |
| `COMPLETED` | Completed | `bg-blue-500/10 text-blue-600 border-blue-500/20` | Royal Blue |
| `PENDING` | Awaiting Confirmation | `bg-amber-500/10 text-amber-600 border-amber-500/20` | Auspicious Amber |
| `CANCELLED` | Cancelled | `bg-destructive/10 text-destructive border-destructive/20` | Crimson Red |
| `REJECTED` | Declined | `bg-destructive/10 text-destructive border-destructive/20` | Crimson Red |
| `EXPIRED` | Expired | `bg-muted-foreground/10 text-muted-foreground border-border` | Muted Stone |

---

## 4. Typography System

Typography is loaded via self-hosted font packages (`@fontsource/fraunces` and `@fontsource/inter`), eliminating third-party Google Fonts CDN latency and ensuring reliable offline/local operation:

### 4.1 Fonts
- **Serif Display & Headings (`--font-serif`)**: **Fraunces**  
  Used for page titles, ritual names, Vedic mantras, and ceremony cards to convey gravitas and traditional warmth.
- **Sans-Serif Body & Controls (`--font-sans`)**: **Inter**  
  Used for all UI elements, form inputs, time pickers, address cards, tables, and buttons.

### 4.2 Type Scale

| Scale Token | Font Size | Font Weight | Typical Usage |
| :--- | :--- | :--- | :--- |
| `--text-display` | `2.75rem (44px)` | 700 (Fraunces) | Landing page hero titles |
| `--text-h1` | `2.00rem (32px)` | 700 (Fraunces) | Section headers & dashboard page titles |
| `--text-h2` | `1.50rem (24px)` | 600 (Fraunces) | Ceremony cards & modal titles |
| `--text-h3` | `1.125rem (18px)`| 600 (Inter) | Component headers & dialog sections |
| `--text-body` | `1.00rem (16px)` | 400 (Inter) | Standard body copy & form labels |
| `--text-small` | `0.875rem (14px)`| 400/500 (Inter)| Table cells, captions, and secondary notes |
| `--text-micro` | `0.75rem (12px)` | 600 (Inter, Uppercase)| Badges, status tags, and time pill labels |

---

## 5. Spacing, Elevation & Corner Radii

- **Base Spacing**: 4px standard grid (4, 8, 12, 16, 20, 24, 32, 48, 64px).
- **Corner Radii Tokens**:
  - Tags & Small Badges: `--radius-xs: 3px`, `--radius-sm: 4px`
  - Inputs & Buttons: `--radius-md: 5px`, `--radius: 6px`
  - Cards & Modals: `--radius-xl: 8px`
- **Elevations (Shadows)**:
  - `shadow-xs`: Subtle hairline elevation for cards on ivory background.
  - `shadow-md`: Modal dialogs and active dropdown menus.
  - Double hairline border styling (`border-2 border-amber-300` / `border-amber-400/40`) used for sacred ceremony cards.

---

## 6. Motion & Micro-Interactions (Framer Motion)

Defined centrally in `frontend/src/motion/variants.ts`:

- **Durations**:
  - `MOTION_FAST = 0.15s` (hover states, tap feedback)
  - `MOTION_BASE = 0.30s` (fade transitions, modal entrance, drawer slide)
- **Easing**: `EASE_STANDARD = [0.22, 1, 0.36, 1]` (natural deceleration curve)

### 6.1 Key Variants
- **`fadeInUp`**: Smooth vertical reveal for ritual cards and search results (`opacity: 0, y: 16` → `opacity: 1, y: 0`).
- **`staggerContainer`**: Staggers list children with 60ms delay between elements.
- **`modalTransition`**: Scaled fade for dialogs (`scale: 0.95` → `scale: 1.00`).
- **`cardHover`**: Subtle lift (`translateY(-4px)`).
- **`buttonPress`**: Instant tactile feedback (`scale: 0.97`).

### 6.2 Accessibility & Reduced Motion
The application wraps its entire component tree in `MotionProvider` (`frontend/src/components/common/MotionProvider.tsx`), querying `useReducedMotion()`. If a user enables reduced motion in their OS preferences, all animation durations collapse to zero instantly with clean fallback rendering.
