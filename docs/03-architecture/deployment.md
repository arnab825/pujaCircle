# Deployment Architecture - PujaCircle

## 1. Target Infrastructure

```mermaid
graph LR
    Devotee[Devotee / User] -->|HTTPS| VercelEdge["Vercel CDN Edge"]
    VercelEdge -->|Static SPA Assets| ReactApp["Frontend (React 19 / Vite)"]
    ReactApp -->|API Calls (CORS)| RenderAPI["Backend (Render / Node.js)"]
    RenderAPI -->|PostgreSQL Connection Pool| SupabaseDB[("Supabase PostgreSQL")]
    RenderAPI -->|Image Uploads / CDN| ImageKit["ImageKit Storage"]
```

| Component | Target Platform | Environment Specs |
| :--- | :--- | :--- |
| **Frontend** | Vercel | Node 20 LTS, Vite SPA Build, Custom Domain, HTTPS Edge CDN |
| **Backend** | Render | Node 20 Web Service, Health Check `/health`, Auto-Restart |
| **Database** | Supabase | Managed PostgreSQL 15+, Connection Pooling via pgBouncer |
| **Media Assets** | ImageKit | Cloud storage for Priest certificates and profile images |

---

## 2. Environment Configuration Matrix

- **Frontend Variables**:
  - `VITE_API_BASE_URL`: Base URL for the backend API
  - `VITE_MOCK_DELAY_MS`: Configurable mock latency
- **Backend Variables**:
  - `PORT`: Service port (default: 5000)
  - `NODE_ENV`: `production` | `development`
  - `DATABASE_URL`: Supabase connection string
  - `JWT_SECRET`: Secret for signing authentication tokens
  - `COOKIE_SECRET`: Secret for cookie parser
  - `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`
  - `OTP_PROVIDER_API_KEY`: Abstracted SMS API key
