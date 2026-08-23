# Code Style & Engineering Standards - PujaCircle

## 1. TypeScript Conventions

- Strict mode enabled (`"strict": true`).
- Do not use `any` unless writing temporary placeholder typecasts in skeleton files.
- Prefer explicit interface/type definitions exported from `src/types/*.types.ts`.

## 2. React & Component Standards

- Functional components with `React.FC` or standard RAFCE function declarations.
- Named exports preferred for domain components; default exports for page routing.
- Keep components modular (< 250 lines). Break complex dialogs into dedicated sub-components.
- Use `cn()` from `@/lib/utils` for conditional class combinations.

## 3. Tailwind CSS & Styling

- Never hardcode raw hex colors in JSX (e.g. avoid `bg-[#F97316]`). Always use semantic tokens (`bg-primary`, `text-primary-foreground`, `bg-brand-maroon`).
- Ensure adequate padding on mobile screens (`px-4 py-6`).
