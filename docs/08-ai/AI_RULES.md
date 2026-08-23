# Explicit AI Engineering Rules - PujaCircle

1. **Do not introduce mobile functionality**: PujaCircle is strictly a responsive web application.
2. **Do not introduce live priest tracking**: No GPS coordinates, live maps, or driver-style tracking.
3. **Do not introduce online priest payments in Phase 1**: All priest remuneration is offline cash (`paymentStatus: PENDING` or `PAID_OFFLINE`).
4. **Do not introduce e-commerce into Phase 1**: No cart, product catalog, checkout, or merchandise inventory.
5. **Do not invent API endpoints**: Follow the contracts defined in `docs/04-api/API.md`.
6. **Do not invent database entities**: Follow the schema defined in `docs/05-database/backend-schema.md`.
7. **Do not bypass the API layer**: React components must never import `src/mocks/db.ts` directly.
8. **Do not introduce a new library without justification**: Rely on installed packages (Tailwind, shadcn, Radix, Lucide, date-fns, sonner, Zustand, Zod, Axios).
9. **Reuse existing shadcn components**: Located in `src/components/ui/`.
10. **Use existing design tokens**: Use `--primary`, `--secondary`, `--accent`, `--brand-maroon`, etc.
11. **Check documentation before implementation**: `docs/` is the source of truth.
12. **Keep beginner-friendly architecture**: Avoid over-abstraction, custom monorepos, micro-frontends, or convoluted design patterns.
13. **Prefer simple, robust solutions**: Small, readable files with clean TypeScript types.
