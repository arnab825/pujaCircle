# Testing Guidelines - PujaCircle

## Testing Strategy

1. **Mock API Verification**:
   - Run `npm run test:mock` to execute end-to-end simulation of Auth, Priest listing, Address CRUD, and Booking state machine transitions.
2. **Type Safety & Build Verification**:
   - Run `npm run build` in `frontend/` to verify TypeScript compile integrity.
   - Run `npx tsc --noEmit` in `backend/` to verify backend scaffolding types.
3. **Manual Cross-Browser & Breakpoint Testing**:
   - Verify modal behavior, input OTP layout, and responsive drawers on mobile viewports (375px), tablets (768px), and desktop (1280px).
