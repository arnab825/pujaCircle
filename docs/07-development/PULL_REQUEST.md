# Pull Request Guidelines - PujaCircle

## PR Submission Checklist

1. [ ] **Scope Alignment**: Does this PR strictly follow Phase 1 boundaries? (No mobile code, no live tracking, no online payment gateways).
2. [ ] **TypeScript Safety**: `npm run build` in `frontend/` completes with 0 errors.
3. [ ] **Mock API Validation**: `npm run test:mock` passes successfully.
4. [ ] **Component Reusability**: Uses existing components from `@/components/ui/*` without creating ad-hoc duplicate styles.
5. [ ] **Modal-First UX**: Uses dialogs/drawers for user actions where appropriate.
