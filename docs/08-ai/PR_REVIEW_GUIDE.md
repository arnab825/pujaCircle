# AI Pull Request Review Guide - PujaCircle

## Automated Review Checklist for AI Agents

When reviewing Pull Requests, verify:

1. **Boundary Adherence**:
   - Are there any mobile dependencies (React Native, Expo)? -> **REJECT**
   - Are there any live GPS tracking components? -> **REJECT**
   - Are there any payment gateway SDKs (Razorpay/Stripe)? -> **REJECT**
   - Does any UI component import `src/mocks/db.ts` directly? -> **REJECT**
2. **Design System Adherence**:
   - Are raw hex colors used directly in JSX? -> **FLAG FOR REFACTOR**
   - Are shadcn/ui components used rather than raw unstyled elements? -> **VERIFY**
   - Does it adhere to the modal-first UX principle? -> **VERIFY**
3. **Type Safety & Testing**:
   - Does `npm run build` pass? -> **VERIFY**
   - Does `npm run test:mock` pass? -> **VERIFY**
