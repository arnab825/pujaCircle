# Authentication Architecture & Flow - PujaCircle

## 1. Authentication Strategy

PujaCircle relies on **Phone Number + OTP** authentication natively designed for the Indian market (+91 mobile format).

### Key Architectural Principles:
1. **Passwordless by Default**: Users log in using OTP verification sent via SMS gateway.
2. **Abstracted OTP Provider**: The backend integrates via `otp.service.ts` to prevent coupling with any single vendor.
3. **Session Persistence**: JWT token stored inside an `HttpOnly`, `Secure`, `SameSite=Lax/Strict` cookie.

---

## 2. Authentication Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Devotee as User / Priest
    participant UI as Frontend App
    participant AuthAPI as Auth Service
    participant SMS as SMS Gateway
    participant DB as Database

    Devotee->>UI: Enters 10-digit Indian Mobile
    UI->>AuthAPI: POST /api/v1/auth/send-otp
    AuthAPI->>AuthAPI: Generate 6-digit numeric OTP & hash with expiry (5 mins)
    AuthAPI->>SMS: Dispatch SMS with OTP
    SMS-->>Devotee: Receives SMS OTP
    Devotee->>UI: Enters 6-digit OTP
    UI->>AuthAPI: POST /api/v1/auth/verify-otp
    AuthAPI->>AuthAPI: Validate OTP & expiry
    AuthAPI->>DB: Find or create User record
    AuthAPI-->>UI: Set HTTP-Only Cookie with JWT & Return user data
    UI->>UI: Update useAuthStore (isAuthenticated = true)
```
