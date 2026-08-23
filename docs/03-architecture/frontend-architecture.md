# Frontend Architecture Specification - PujaCircle

## 1. Directory Organization

```
frontend/src/
├── api/          # API Abstraction Services (auth, user, address, priest, booking)
├── assets/       # Static SVGs and icons
├── components/   # UI components grouped by domain and primitives (ui, layout, auth, address, priest, booking)
├── hooks/        # Reusable React hooks
├── lib/          # Utilities (cn, constants, config)
├── mocks/        # Mock DB, Mock APIs, artificial latency simulator
├── pages/        # Route page skeletons (public, auth, user, priest, admin)
├── routes/       # React Router configuration (app-router.tsx)
├── schemas/      # Zod validation schemas
├── store/        # Zustand client-state stores (auth, address, booking)
├── types/        # TypeScript domain models and interfaces
├── App.tsx       # Root wrapper with Router and global modals
├── index.css     # CSS variable tokens and global resets
└── main.tsx      # Application entrypoint
```

---

## 2. API Decoupling Pattern

React components must never import `mocks/db.ts` or instantiate direct Axios calls inside presentation components.

```
[React Component] ──> [src/api/*.api.ts] ──> [src/mocks/mock-api.ts] ──> [src/mocks/db.ts]
```

When switching to backend:
```
[React Component] ──> [src/api/*.api.ts] ──> [Axios Client] ──> [Express /api/v1/*]
```

---

## 3. Form Validation Architecture

Form workflows in PujaCircle strictly utilize:
- **React Hook Form**: For performance and un-rendered state management.
- **Zod**: For TypeScript-first schema validation.
- **`@hookform/resolvers/zod`**: To connect Zod schemas directly into React Hook Form.
- **`<Form>`, `<FormField>`, `<FormControl>`, `<FormMessage>`**: shadcn components for consistent accessible error messages.

---

## 4. Zustand State Boundaries

Zustand stores are intentionally scoped:
- **`auth.store.ts`**: Holds `user`, `isAuthenticated`, and auth modal visibility flags.
- **`address.store.ts`**: Holds `selectedAddressId`, `isAddressModalOpen`, and address being edited.
- **`booking.store.ts`**: Holds transient draft booking parameters (`priestId`, `slotId`, `bookingDate`) and booking modal states.
- **Rule**: Avoid dumping entire collections into Zustand. Server collections (priest list, booking history) are fetched by feature hooks or components.
