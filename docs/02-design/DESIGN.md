# Design Philosophy & Brand Guidelines - PujaCircle 🕉️

---

## 1. Brand Personality & Visual Identity

PujaCircle embodies the spirit of: **"Tradition with modern convenience."**

The platform represents a blend of sacred Indian heritage and contemporary digital elegance. It deliberately avoids two extremes:
- **It is NOT an ornamental temple website** filled with chaotic decorations, loud flashing bells, or unreadable ancient scripts.
- **It is NOT a sterile corporate or generic SaaS application** lacking cultural warmth and spiritual reverence.

### Brand Attributes
- **Warm & Welcoming**: Grounded in natural Indian tones (Ivory, Saffron, Sandalwood, Deep Maroon).
- **Trustworthy & Sacred**: Evoking confidence, verified scholarship, and spiritual peace.
- **Modern & Clutter-Free**: Generous whitespace, clean typography, intuitive micro-interactions, and accessible layouts.

---

## 2. Modal-First UX Principle

To ensure smooth, focused user journeys without disruptive full-page reloads, PujaCircle enforces a **Modal-First UX pattern**:

### When to use Dialogs / Modals:
- **Phone Login & Registration**
- **OTP Verification**
- **Adding / Editing Saved Addresses**
- **Booking Confirmation & Muhurat Review**
- **Cancellation Reason Submission**
- **Admin Priest Approval / Rejection Confirmation**

### When to use Dedicated Pages:
- **Landing & Discovery Pages** (`/`, `/priests`, `/rituals`)
- **Comprehensive Profile Pages** (`/priests/:id`, `/user/profile`)
- **Dashboards & Queue Management** (`/user/dashboard`, `/admin/dashboard`, `/admin/priest-approvals`)

---

## 3. Responsive Breakpoint Strategy

PujaCircle is **Web-Only**, but built with a responsive mobile-first mindset:

| Breakpoint | Target Devices | Layout Behavior |
| :--- | :--- | :--- |
| **Mobile (`< 640px`)** | Smartphones (Portrait) | Single column, bottom drawer sheets for focused actions, sticky bottom CTAs. |
| **Tablet (`640px - 1024px`)** | iPads, Tablets | Two-column grids, centered dialogs, collapsible sidebar filters. |
| **Desktop (`1024px - 1440px`)** | Laptops & Desktops | Standard 3-column discovery grids, floating action cards, persistent navigation. |
| **Wide (`> 1440px`)** | Large Monitors | Max container constrained to `1400px` to maintain optimal reading line length. |

---

## 4. UI States & Feedback Standards

Every interactive component and page in PujaCircle must explicitly handle four fundamental UI states:

1. **Loading State**: Subtle pulse skeletons (`<Skeleton>`) for lists and cards; unobtrusive spinner for modal actions.
2. **Empty State**: Friendly illustration or icon (`<EmptyState>`) with a clear call-to-action button (e.g., "Add Address" or "Find Priests").
3. **Error State**: Non-blocking toast alerts via `sonner` for network errors; clear inline field validation messages under inputs.
4. **Success State**: Immediate visual confirmation with toast notifications and automatic modal closure upon action completion.
