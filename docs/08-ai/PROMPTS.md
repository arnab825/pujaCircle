# Recommended AI Prompts - PujaCircle

## 1. Feature Development Prompt Template
```
I need to build [Feature Name] for PujaCircle.
Please first review docs/01-product/PRD.md, docs/02-design/DESIGN.md, and docs/04-api/API.md.
Adhere strictly to Phase 1 boundaries:
- Web only
- No live priest tracking
- No online payments (offline cash only)
- Use shadcn/ui components and semantic CSS tokens
- Connect via src/api/*.api.ts (which delegates to mock API)
```

## 2. Component Scaffolding Prompt Template
```
Create the React component [ComponentName] for PujaCircle using TypeScript and Tailwind CSS.
Use the design system tokens (--brand-saffron, --brand-maroon, --card, etc.) and shadcn/ui primitives.
Ensure accessible labeling and mobile responsiveness.
```
