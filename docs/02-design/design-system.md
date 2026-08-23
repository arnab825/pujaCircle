# Design System & Token Tokens - PujaCircle

## 1. CSS Variable Tokens (Defined in `index.css`)

```css
:root {
  /* Brand Specific HSL Tokens */
  --brand-saffron: 28 92% 52%;       /* Primary sacred orange */
  --brand-saffron-dark: 24 95% 44%;  /* Hover & active state */
  --brand-maroon: 348 65% 26%;       /* Deep regal background/accents */
  --brand-maroon-light: 348 55% 36%; /* Secondary elements */
  --brand-gold: 42 85% 55%;          /* Auspicious highlight */
  --brand-ivory: 40 33% 98%;         /* Neutral background */
  --brand-charcoal: 220 20% 14%;     /* Primary text */

  /* Semantic UI Tokens */
  --background: 40 33% 98%;
  --foreground: 220 20% 14%;
  --primary: 28 92% 52%;
  --primary-foreground: 0 0% 100%;
  --secondary: 348 65% 26%;
  --secondary-foreground: 0 0% 100%;
  --card: 0 0% 100%;
  --card-foreground: 220 20% 14%;
  --popover: 0 0% 100%;
  --popover-foreground: 220 20% 14%;
  --muted: 35 20% 92%;
  --muted-foreground: 220 10% 42%;
  --accent: 42 85% 92%;
  --accent-foreground: 348 65% 26%;
  --destructive: 0 72% 51%;
  --destructive-foreground: 0 0% 100%;
  --border: 35 20% 88%;
  --input: 35 20% 88%;
  --ring: 28 92% 52%;
  --radius: 0.625rem;
}
```

---

## 2. Spacing & Elevation System

- **Spacing Grid**: Standard 4px base (`p-1` = 4px, `p-2` = 8px, `p-4` = 16px, `p-6` = 24px, `p-8` = 32px, `p-12` = 48px).
- **Elevation & Shadows**:
  - `shadow-sm`: Cards, input fields.
  - `shadow`: Interactive priest listings, hover states.
  - `shadow-lg` / `shadow-2xl`: Dialogs, drawers, floating action menus.

---

## 3. Border Radii

- **Default Container / Card**: `rounded-xl` (10px - 12px) for gentle organic curves.
- **Buttons & Form Inputs**: `rounded-md` (6px - 8px).
- **Badges & Tags**: `rounded-full` (Pill shape).
