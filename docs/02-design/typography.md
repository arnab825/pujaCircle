# Typography Specification - PujaCircle

## 1. Font Family Stack

- **Headings & Display**: `'Outfit'`, `'Inter'`, `-apple-system`, `sans-serif`
  - High aesthetic balance, contemporary geometry, and modern warmth.
- **Body & Controls**: `'Inter'`, `-apple-system`, `BlinkMacSystemFont`, `'Segoe UI'`, `'Noto Sans'`, `sans-serif`
  - Maximum legibility on mobile and desktop screens.
- **Indian Script Fallback**: `'Noto Sans Devanagari'`, `'Noto Sans Bengali'`, `'Noto Sans Tamil'`, `'Noto Sans Telugu'`, `'Noto Sans Kannada'`
  - Ensures accurate rendering of Indian mantras, ritual titles, and names without broken glyphs.

---

## 2. Type Scale & Tokens

| Token | CSS Class | Size / Line-Height | Weight | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `text-4xl md:text-5xl` | 36px / 44px (Mobile), 48px / 56px (Desktop) | ExtraBold (800) | Landing page hero headline |
| **H1** | `text-3xl font-bold` | 30px / 36px | Bold (700) | Main page titles (`Priests`, `Bookings`) |
| **H2** | `text-2xl font-bold` | 24px / 32px | Bold (700) | Section headers, Priest Profile names |
| **H3** | `text-xl font-semibold` | 20px / 28px | SemiBold (600) | Card titles, Dialog headers |
| **Body Large** | `text-base` | 16px / 24px | Regular (400) | Lead paragraphs, Priest bios |
| **Body Default**| `text-sm` | 14px / 20px | Regular (400) | Form inputs, descriptions, addresses |
| **Caption** | `text-xs` | 12px / 16px | Medium (500) | Timestamps, muhurat slots, helper text |
| **Micro Tag** | `text-[10px]` | 10px / 14px | SemiBold (600) | Category chips, badge labels |
