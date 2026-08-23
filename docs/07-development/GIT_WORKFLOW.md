# Git Workflow - PujaCircle

## 1. Commit Message Conventions (Conventional Commits)

Format: `<type>(<scope>): <subject>`

- `feat(auth)`: Add phone OTP verification modal
- `fix(address)`: Correct PIN code lookup auto-fill bug
- `docs(api)`: Update booking endpoint contract
- `style(theme)`: Refine Saffron and Maroon HSL tokens
- `refactor(mock)`: Decouple priest mock latency
- `chore(deps)`: Upgrade shadcn components

---

## 2. Pull Request & Review Rules

- All feature branches must branch off and merge into `develop` or `main`.
- Every PR requires at least 1 peer approval.
- CI type check (`npm run build`) and mock tests (`npm run test:mock`) must pass before merging.
