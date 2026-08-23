# AI Agent Engineering Skills & Guidelines - PujaCircle 🕉️

> [!IMPORTANT]
> **CRITICAL MANDATE: DO NOT HALLUCINATE PROJECT REQUIREMENTS.**
>
> AI agents, assistants, and code generators working on the PujaCircle repository must strictly adhere to this guide. You MUST inspect the relevant documentation files in `docs/` before proposing, creating, or modifying any code. Documentation is the project's **SOURCE OF TRUTH**.

---

## 1. Required Reading Before Any Task

Before implementing any feature or modification, AI agents MUST read and verify:
1. `docs/01-product/PRD.md` & `docs/01-product/scope.md` -> Verify feature is in-scope for Phase 1.
2. `docs/02-design/DESIGN.md` & `docs/02-design/ux-flows.md` -> Verify modal-first UX and design token usage.
3. `docs/04-api/API.md` -> Verify API contracts and request/response structures.
4. `docs/05-database/backend-schema.md` -> Verify database table schemas and constraints.
5. `docs/08-ai/AI_RULES.md` -> Verify hard constraints.

---

## 2. Hard Constraints Checklist

- [x] **Web Only**: Never introduce React Native, Flutter, Expo, Android, or iOS files.
- [x] **No Live Priest Tracking**: Never introduce GPS tracking, live map tracking, or driver-style location updates.
- [x] **No Online Priest Payments**: Never install or import Razorpay, Stripe, PayPal, or UPI gateway SDKs in Phase 1. Payments are direct offline cash (`paymentMethod: OFFLINE_CASH`).
- [x] **No E-Commerce / Kits**: Do not build cart, checkout, or merchandise inventory in Phase 1.
- [x] **Modal-First UX**: Focused actions (login, OTP, address create/edit, booking confirmation) must use Dialogs/Drawers.

---

## 3. Engineering Conventions

### 3.1 API & Mock Conventions
- UI components must **NEVER** import `src/mocks/db.ts` directly.
- The path is strictly: `Component -> src/api/*.api.ts -> src/mocks/mock-api.ts -> src/mocks/db.ts`.
- All mock API functions must return Promises and call `await delay()` to preserve realistic async UX.

### 3.2 State Management (Zustand)
- Store user session and UI modal states in `src/store/*.store.ts`.
- **Do not** put large backend collections blindly into Zustand stores. Fetch collections within components or query hooks.

### 3.3 Form Validation (Zod + React Hook Form)
- Declare validation schemas in `src/schemas/*.schema.ts`.
- Use `@hookform/resolvers/zod` with shadcn `<Form>`, `<FormField>`, `<FormControl>`, `<FormMessage>`.

### 3.4 Styling & Design System
- Use semantic Tailwind classes mapped to CSS variables (`bg-primary`, `text-primary-foreground`, `bg-brand-maroon`, `bg-card`).
- Never hardcode raw color hex codes directly in JSX.

---

## 4. Protocol for Missing or Underspecified Requirements

If a requirement is not explicitly covered in `docs/`:
1. **Do NOT invent major functionality or new product directions.**
2. Follow existing established patterns in the codebase.
3. State your assumptions clearly.
4. Ask for clarification if the missing decision affects database schema, API contracts, or core user flows.
