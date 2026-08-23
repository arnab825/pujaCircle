# AI Engineering Workflow - PujaCircle

## Systematic 4-Step Process for AI Tasks

1. **Understand & Check Docs**:
   - Locate the relevant specifications in `docs/` (PRD, SRS, API, DB schema).
   - Verify constraints (Web only, no live tracking, offline cash payment).
2. **Review Code Architecture**:
   - Inspect existing types in `src/types/`, schemas in `src/schemas/`, and UI components in `src/components/ui/`.
3. **Execute Incrementally**:
   - Create or update components, APIs, or schemas adhering to TypeScript strictness.
   - Maintain the API abstraction boundary (`src/api/*.api.ts`).
4. **Validate**:
   - Run typecheck and mock tests (`npm run build` & `npm run test:mock`).
