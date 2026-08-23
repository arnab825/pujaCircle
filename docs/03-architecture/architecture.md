# System Architecture Overview - PujaCircle 🕉️

## 1. High-Level Architecture

PujaCircle is designed with a decoupled, modern web architecture. During Phase 1 scaffolding, the frontend operates completely independently using an in-memory Mock Database and API abstraction layer. In future backend integration, the API abstraction points to Express, Drizzle ORM, and Supabase PostgreSQL.

```mermaid
graph TD
    Client["React 19 SPA (Vite + Tailwind + shadcn)"]
    
    subgraph Frontend Layer
        Store["Zustand Client Stores (Session & Modals)"]
        API["API Abstraction Layer (api/*.api.ts)"]
        MockAPI["Mock API System (mocks/mock-api.ts)"]
        MockDB[("In-Memory Mock DB (mocks/db.ts)")]
    end
    
    subgraph Future Backend Layer
        Express["Express.js Server"]
        AuthMid["JWT & Role Middlewares"]
        Services["Domain Services (Auth, Priest, Booking)"]
        Drizzle["Drizzle ORM"]
        Postgres[("Supabase PostgreSQL")]
        ImageKit["ImageKit CDN (Priest KYC/Photos)"]
    end
    
    Client --> Store
    Client --> API
    
    %% Phase 1 Scaffolding Flow
    API -.->|Phase 1 Mock Mode| MockAPI
    MockAPI --> MockDB
    
    %% Future Production Flow
    API ==>|Phase 2 Backend Integration| Express
    Express --> AuthMid
    AuthMid --> Services
    Services --> Drizzle
    Drizzle --> Postgres
    Services --> ImageKit
```

---

## 2. Layer Responsibilities

1. **Frontend UI Layer (`frontend/src/pages/`, `frontend/src/components/`)**:
   - Manages rendering, route navigation, and modal dialogues.
   - Strictly consumes `api/*.api.ts`.
   - Never accesses backend database or mock DB directly.
2. **State & Validation Layer (`frontend/src/store/`, `frontend/src/schemas/`)**:
   - `Zustand` manages transient client session and UI modal states.
   - `Zod` provides single-source-of-truth validation schemas across forms.
3. **API Layer (`frontend/src/api/`)**:
   - Provides clean asynchronous function interfaces.
   - In Phase 1: delegates to `mock-api.ts` with artificial delay.
   - In Phase 2: delegates to `AxiosClient` targeting `/api/v1/*`.
4. **Backend Placeholder (`backend/src/`)**:
   - Architectural routes, controllers, middleware, and database schema types structured for clean, incremental development.
