# PujaCircle 🕉️

> **"Traditional Vedic rituals, made accessible, authentic, and seamless for modern India."**

PujaCircle is an enterprise-grade, full-stack web platform engineered to connect devotees with verified, Gurukul-trained Vedic Purohits (priests) for sacred home ceremonies across West Bengal and India. Built with a structured **MVC architecture** on the backend and a modern **React 19 + Tailwind CSS v4** single-page application on the frontend, PujaCircle delivers authenticated ceremonial booking, transparent priest-defined pricing, immutable price-locking snapshots, exception-based Muhurat scheduling, pure cookie-based session security, and a verified ceremony completion handshake.

---

## 📊 Engineering Highlights & Metrics

| Engineering Metric | Specification / Measurement | Technical Implementation & Impact |
| :--- | :--- | :--- |
| **Frontend Production Bundle** | **377.1 kB** (Main Chunk gzip: 115.9 kB) | Vite 6 + Rollup `manualChunks` splitting (`vendor-react`, `vendor-motion`, `vendor-base-ui`, `vendor-icons`) |
| **Type Safety & Rigor** | **100% Strict TypeScript** | End-to-end type safety across backend and frontend with Zod schema validation on all API input boundaries |
| **Code Quality Audit** | **0 Errors, 0 Warnings** | Clean compilation across `npm run typecheck:frontend`, `npm run typecheck:backend`, and production builds |
| **Automated Test Suite** | **100% Passing (5/5)** | Automated regression tests for calendar availability, timezone parsing (`Asia/Kolkata`), and district normalization |
| **Session Security Model** | **Pure Cookie Architecture (7-Day TTL)** | 100% free of insecure `localStorage` auth tokens; HTTP-only & client cookies with 7-day expiration and CSRF protection |
| **Database Encryption & SSL** | **Enforced TLS/SSL Pooling** | Parameterized SQL queries via Drizzle ORM; explicit `ssl: 'require'` for cloud connection poolers |
| **Transactional Email Engine** | **Brevo REST API v3** | Port-agnostic HTTPS email delivery (Render-safe; eliminates blocked outbound SMTP ports 25/465/587) |
| **Media Cloud Storage** | **Cloudinary Direct Upload** | Secure signed media uploads & automated asset lifecycle management (< 2MB file size guard) |
| **Muhurat Scheduling Engine** | **Dynamic Exception Windows** | Working-hours window calculation subtracting full-day leaves, partial blackouts, and active ceremony bookings |
| **Dakshina Settlement Model** | **Offline Cash & Completion Handshake** | Immutable price snapshot locking at booking; 4-digit completion code verification protects devotee & priest |

---

## 🏛️ Full-Stack System Architecture

```mermaid
flowchart TB
    subgraph ClientTier["Frontend Client Tier (React 19 + TypeScript + Vite 6 + Tailwind v4)"]
        direction TB
        subgraph DevoteePortal["Devotee Sanctum"]
            D1["Ritual Discovery & Vedic Catalog"]
            D2["Purohit Search & Dynamic Muhurat Booking"]
            D3["Venue Address Management (Max 2 Sanctums)"]
            D4["Booking History & Dakshina Tracking"]
            D5["Verified 5-Star Post-Ceremony Reviews"]
        end
        subgraph PriestPortal["Purohit Workspace"]
            P1["Custom Service Catalog & Pricing (₹)"]
            P2["Configurable Working Hours (e.g. 07:00 - 21:00)"]
            P3["Full-Day Leaves & Blackout Hours Calendar"]
            P4["Booking Acceptance & 4-Digit Code Completion"]
        end
        subgraph AdminPortal["Admin Operations Console"]
            A1["Purohit Vetting, Verification & Suspension"]
            A2["Devotee Moderation & Account Controls"]
            A3["Puja Catalog Management & Media Cloudinary Uploads"]
            A4["Platform KPI Dashboard & Ceremony Oversight"]
        end
    end

    subgraph SecurityGateway["Security, Validation & Middleware Layer"]
        M1["Helmet Security Headers & CORS Credentials Policy"]
        M2["Express Rate Limiting (General, Auth, OTP)"]
        M3["Zod Schema Validation (Body, Params, Query)"]
        M4["Pure Cookie Authentication Guard (7-Day Session TTL)"]
        M5["Role-Based Access Control (USER, PRIEST, ADMIN)"]
        M6["Global Error Handler (Zero DB/Stack Trace Leaks)"]
    end

    subgraph BackendTier["Backend MVC Tier (Node.js + Express + TypeScript)"]
        direction TB
        R["Modular Route Handlers (/api/v1/*)"]
        C["Controllers (HTTP Orchestration & Serialization)"]
        S["Services (Domain Business Logic & Timezone Math)"]
        REP["Drizzle ORM Models & Parameterized Queries"]
        V["Views & ViewModel DTO Sanitizers"]
        R --> C --> S --> REP
        C --> V
    end

    subgraph DataAndCloudTier["Data & Cloud Services Tier"]
        DB[("PostgreSQL Database (Supabase / Pooler with SSL)")]
        CL["Cloudinary Media Storage (Photos & Avatars)"]
        BR["Brevo HTTPS Transactional Email API"]
        PIN["India Post PIN Code Lookup Directory API"]
    end

    ClientTier --> SecurityGateway
    SecurityGateway --> BackendTier
    BackendTier --> DataAndCloudTier
```

---

## 📐 UML System Modeling Suite

### 1. UML Use Case Diagram

```mermaid
flowchart LR
    subgraph Actors["System Actors"]
        Devotee["👤 Devotee (Devout Seeker)"]
        Priest["🧘 Vedic Purohit (Scholar)"]
        Admin["🛡️ Operations Admin"]
    end

    subgraph Boundary["PujaCircle System Boundary"]
        UC1["UC-1: Register & Cookie Sign In"]
        UC2["UC-2: Discover Rituals & Samagri Guidelines"]
        UC3["UC-3: Search Purohits by Locality & Muhurat"]
        UC4["UC-4: Book Ceremony (Immutable Price Locked)"]
        UC5["UC-5: Reveal 4-Digit Completion Code"]
        UC6["UC-6: Submit 5-Star Verified Review"]
        
        UC7["UC-7: Onboard & Submit Vedic Credentials"]
        UC8["UC-8: Configure Service Offerings & Pricing (₹)"]
        UC9["UC-9: Manage Calendar Leaves & Blackouts"]
        UC10["UC-10: Accept / Reject Ceremony Requests"]
        UC11["UC-11: Enter 4-Digit Code & Complete Vidhi"]
        
        UC12["UC-12: Vet & Approve Priest Applications"]
        UC13["UC-13: Moderate Accounts & Suspend Violators"]
        UC14["UC-14: Manage Puja Catalog & Media Assets"]
        UC15["UC-15: Monitor Platform Analytics & KPIs"]
    end

    Devotee --> UC1
    Devotee --> UC2
    Devotee --> UC3
    Devotee --> UC4
    Devotee --> UC5
    Devotee --> UC6

    Priest --> UC1
    Priest --> UC7
    Priest --> UC8
    Priest --> UC9
    Priest --> UC10
    Priest --> UC11

    Admin --> UC1
    Admin --> UC12
    Admin --> UC13
    Admin --> UC14
    Admin --> UC15
```

---

### 2. UML Class Diagram (Domain Model & MVC Controllers)

```mermaid
classDiagram
    class User {
        +UUID id
        +String name
        +String email
        +String phoneNumber
        +String password
        +Role role
        +AccountStatus accountStatus
        +DateTime createdAt
    }

    class PriestProfile {
        +UUID id
        +UUID userId
        +String bio
        +Integer experienceYears
        +String qualifications
        +String city
        +String district
        +String pincode
        +String upiId
        +ApprovalStatus approvalStatus
        +Float ratingAverage
        +Integer totalReviews
    }

    class PriestService {
        +UUID id
        +UUID priestId
        +UUID pujaCatalogId
        +String serviceName
        +Integer price
        +Integer durationMinutes
    }

    class PujaCatalog {
        +UUID id
        +String name
        +String slug
        +String description
        +Integer durationMinutes
        +Array samagriList
        +Array vidhiSteps
        +String imageUrl
    }

    class Booking {
        +UUID id
        +String bookingReference
        +UUID userId
        +UUID priestId
        +UUID addressId
        +Integer servicePrice
        +Integer totalPrice
        +String bookingDate
        +String startTime
        +String endTime
        +BookingStatus status
        +PaymentStatus paymentStatus
        +String completionCode
        +Integer rating
        +String review
    }

    class Address {
        +UUID id
        +UUID userId
        +String houseNo
        +String street
        +String locality
        +String city
        +String district
        +String pincode
        +Boolean isPrimary
    }

    class AvailabilityException {
        +UUID id
        +UUID priestId
        +String exceptionDate
        +ExceptionType exceptionType
        +String startTime
        +String endTime
        +String reason
    }

    class AuthService {
        +login(input)
        +registerUser(input)
        +registerPriest(input)
        +getMe(userId)
        +logout(token)
    }

    class BookingService {
        +createBooking(data)
        +acceptBooking(bookingId, priestId)
        +rejectBooking(bookingId, priestId, reason)
        +cancelBooking(bookingId, userId, reason)
        +completeBooking(bookingId, priestId, code)
        +submitRating(userId, data)
    }

    class AvailabilityService {
        +getAvailableSlots(priestId, date)
        +isTimeSlotAvailable(priestId, date, start, end)
        +checkBookingOverlap(priestId, date, start, end)
        +markDayOff(priestId, data)
        +blockHours(priestId, data)
    }

    User "1" <.. "0..1" PriestProfile : specializes
    User "1" o-- "0..*" Address : owns
    User "1" o-- "0..*" Booking : reserves
    PriestProfile "1" o-- "0..*" PriestService : configures
    PriestProfile "1" o-- "0..*" AvailabilityException : schedules
    PriestProfile "1" o-- "0..*" Booking : fulfills
    PujaCatalog "1" <.. "0..*" PriestService : references
    PujaCatalog "1" <.. "0..*" Booking : categorizes
    Address "1" <.. "0..*" Booking : venue
    BookingService ..> Booking : orchestrates
    BookingService ..> AvailabilityService : validates
    AuthService ..> User : authenticates
```

---

### 3. UML Activity Diagram: Ceremony Lifecycle & Completion Handshake

```mermaid
flowchart TD
    Start([Devotee Initiates Ceremony Booking]) --> Form[Fill Muhurat Date, Start Time & Venue Address]
    Form --> ValidNotice{Is advance notice >= 12 Hours?}
    ValidNotice -->|No| RejectNotice[Display Error: Minimum 12-Hour Notice Window Required]
    RejectNotice --> Form
    ValidNotice -->|Yes| CheckOverlap{Does Priest have conflicting booking?}
    CheckOverlap -->|Yes| ConflictError[Display Error: Priest already has ceremony booked]
    ConflictError --> Form
    CheckOverlap -->|No| LockPrice[Snapshot Lock: servicePrice & totalPrice in INR]
    LockPrice --> PersistBooking[Insert Booking: status = PENDING]
    
    PersistBooking --> PriestNotify[Purohit reviews request on Workspace Dashboard]
    PriestNotify --> Decision{Purohit Action}
    Decision -->|Reject| RejReq[Status: REJECTED\nReason recorded & devotee notified]
    RejReq --> End([Terminal State])
    Decision -->|Accept| AccReq[Status: CONFIRMED\nGenerate cryptographic 4-digit completion code]
    
    AccReq --> DevoteeView[Completion Code revealed ONLY on Devotee Sanctum\nHidden from Priest View]
    DevoteeView --> CeremonyDay[Muhurat Day: Priest arrives at Devotee Sanctum]
    CeremonyDay --> PerformVidhi[Vedic Ritual & Havan conducted according to Shastras]
    PerformVidhi --> SettleDakshina[Devotee hands cash Dakshina to Priest]
    SettleDakshina --> ShareCode[Devotee verbally reveals 4-digit Completion Code to Priest]
    
    ShareCode --> PriestInput[Priest inputs 4-digit code in Complete Ceremony Modal]
    PriestInput --> VerifyCode{Code matches database snapshot?}
    VerifyCode -->|No| MismatchError[Error: Invalid completion code. Check with devotee]
    MismatchError --> PriestInput
    VerifyCode -->|Yes| CompleteBooking[Status: COMPLETED\npaymentStatus: PAID_OFFLINE\ncompletedAt: timestamp]
    
    CompleteBooking --> DevoteeReview[Devotee unlocked to submit verified 1-5 Star Review & Rating]
    DevoteeReview --> End
```

---

## 🔐 Authentication & 7-Day Cookie Session Architecture

PujaCircle uses a **pure cookie-based authentication architecture** across all three user roles (Devotee, Vedic Purohit, and Operations Admin). Authentication tokens are **never** stored in browser `localStorage`, eliminating vulnerability to Cross-Site Scripting (XSS) credential theft.

```mermaid
sequenceDiagram
    autonumber
    actor User as Devotee / Priest / Admin
    participant App as React 19 Frontend
    participant Server as Express Backend
    participant DB as PostgreSQL (Drizzle)

    User->>App: Enters email & password
    App->>Server: POST /api/v1/auth/login { email, password }
    Server->>DB: Fetch user record (Parameterized SQL)
    DB-->>Server: Return hashed credentials
    Server->>Server: Verify password with bcrypt (10 rounds)
    Server->>Server: Generate signed JWT with 7-Day Expiry (JWT_EXPIRES_IN=7d)
    Server-->>App: HTTP 200 OK<br/>Set-Cookie: access_token=... (HttpOnly, Secure, SameSite=Lax, 7 Days)<br/>Set-Cookie: pc_token=... (SameSite=Lax, 7 Days)<br/>Payload: { user, message }
    Note over App: Zero tokens in localStorage.<br/>Browser Cookie Jar securely stores 7-day session.

    Note over User,Server: Subsequent API Requests (e.g. GET /api/v1/bookings)
    App->>Server: GET /api/v1/bookings (Browser sends Cookie header automatically)
    Server->>Server: Extract token from Cookie: access_token
    Server->>Server: Verify JWT signature & check account moderation status
    Server->>DB: Fetch authorized data
    DB-->>Server: Return query results
    Server-->>App: HTTP 200 OK { data }

    Note over User,Server: Sign Out Flow
    User->>App: Clicks "Sign Out"
    App->>Server: POST /api/v1/auth/logout
    Server-->>App: Clear-Cookie: access_token, pc_token, token (Max-Age=0)
    Note over App: Client cookie cleared & Zustand auth store reset
```

---

## 🔄 Core Ceremony Booking & Handshake Lifecycle

```mermaid
stateDiagram-v2
    [*] --> PENDING: Devotee Requests Muhurat Slot\n(Authoritative Price Snapshot Locked in ₹)

    state PENDING {
        direction LR
        [*] --> AwaitingPriest: Awaiting Purohit Review
    }

    PENDING --> CONFIRMED: Priest Accepts Request\n(Cryptographic 4-Digit Completion Code Generated)
    PENDING --> REJECTED: Priest Declines (Rejection Reason Required)
    PENDING --> CANCELLED: Devotee Cancels Request

    state CONFIRMED {
        direction LR
        [*] --> CodeGenerated: 4-Digit Code Shown ONLY to Devotee\n(Hidden from Priest View)
    }

    CONFIRMED --> CANCELLED: Devotee or Priest Cancels (Notice Window Enforced)
    CONFIRMED --> COMPLETED: Vidhi Performed + Devotee Shares Code + Priest Verifies

    state COMPLETED {
        direction LR
        [*] --> Settled: Dakshina Settled\nDevotee Eligible to Review
    }

    COMPLETED --> RATED: Devotee Submits 1–5 Star Verified Review
    COMPLETED --> [*]
    RATED --> [*]
    REJECTED --> [*]
    CANCELLED --> [*]
```

---

## 📅 Auspicious Muhurat Availability Engine

The availability calculation engine is deterministic and timezone-aware (`Asia/Kolkata` / IST). It dynamically computes available ceremony slots by evaluating priest working hours against leaves, blackout exceptions, and active bookings.

```mermaid
flowchart TD
    Start["Devotee selects Ceremony Date (YYYY-MM-DD)"] --> Step1["1. Load Priest Base Working Hours (e.g., 07:00 - 21:00)"]
    Step1 --> Step2{"2. Is Date a Full-Day Leave?"}
    Step2 -->|"Yes (FULL_DAY exception)"| Blocked["Slot Unavailable: Purohit on Leave"]
    Step2 -->|"No"| Step3["3. Subtract Partial Blackout Hours (PARTIAL_DAY exceptions)"]
    Step3 --> Step4["4. Subtract Active Bookings (PENDING & CONFIRMED overlapping slots)"]
    Step4 --> Step5{"5. Is Slot at least 12 Hours in Advance?"}
    Step5 -->|"No (< 12 hrs advance notice)"| NoticeBlocked["Slot Blocked: Minimum 12-Hour Notice Window Required"]
    Step5 -->|"Yes"| Step6{"6. Is Slot Muhurat in the Past (IST)?"}
    Step6 -->|"Yes"| PastBlocked["Slot Blocked: Muhurat has already passed"]
    Step6 -->|"No"| Available["Slot Marked Available for Devotee Selection"]
```

---

## 🗄️ Database Architecture & Entity Relationships

```mermaid
erDiagram
    users ||--o| priestProfiles : "has profile"
    users ||--o{ addresses : "saves"
    users ||--o{ bookings : "reserves"
    priestProfiles ||--o{ priestServices : "offers"
    priestProfiles ||--o{ priestAvailabilityExceptions : "logs leaves"
    priestProfiles ||--o{ bookings : "conducts"
    pujaCatalog ||--o{ priestServices : "referenced by"
    pujaCatalog ||--o{ bookings : "categorizes"
    addresses ||--o{ bookings : "ceremony venue"

    users {
        uuid id PK
        varchar name
        varchar email UK
        varchar phoneNumber UK
        varchar password "bcrypt hash"
        enum role "USER | PRIEST | ADMIN"
        enum accountStatus "ACTIVE | SUSPENDED | BANNED"
        timestamp createdAt
    }

    priestProfiles {
        uuid id PK
        uuid userId FK
        text bio
        integer experienceYears
        varchar qualifications
        varchar city
        varchar district
        varchar pincode
        varchar upiId "Settlement UPI"
        enum approvalStatus "PENDING | APPROVED | REJECTED"
        numeric ratingAverage
        integer totalReviews
    }

    priestServices {
        uuid id PK
        uuid priestId FK
        uuid pujaCatalogId FK
        varchar serviceName
        integer price "in whole INR"
        integer durationMinutes
    }

    pujaCatalog {
        uuid id PK
        varchar name
        varchar slug UK
        text description
        integer durationMinutes
        text samagriList "JSON array"
        text vidhiSteps "JSON array"
        varchar imageUrl
    }

    addresses {
        uuid id PK
        uuid userId FK
        varchar houseNo
        varchar street
        varchar locality
        varchar city
        varchar district
        varchar state
        varchar pincode
        boolean isPrimary
    }

    bookings {
        uuid id PK
        varchar bookingReference UK "e.g. PC-2026-X8K9M2"
        uuid userId FK
        uuid priestId FK
        uuid priestServiceId FK
        uuid addressId FK
        varchar serviceName
        integer servicePrice "Snapshot locked in INR"
        integer totalPrice "Snapshot locked in INR"
        varchar bookingDate "IST YYYY-MM-DD"
        varchar startTime "HH:mm"
        varchar endTime "HH:mm"
        enum status "PENDING | CONFIRMED | REJECTED | CANCELLED | COMPLETED"
        enum paymentMethod "OFFLINE_CASH"
        enum paymentStatus "PENDING | PAID_OFFLINE"
        varchar completionCode "4-digit secret OTP"
        integer rating "1-5 stars"
        text review
    }

    priestAvailabilityExceptions {
        uuid id PK
        uuid priestId FK
        varchar exceptionDate "YYYY-MM-DD"
        enum exceptionType "FULL_DAY | PARTIAL_DAY"
        varchar startTime "HH:mm"
        varchar endTime "HH:mm"
        varchar reason
    }

    otpCodes {
        uuid id PK
        varchar destination "Email"
        varchar code "6-digit OTP"
        timestamp expiresAt
        integer attempts "Rate limit max 5"
    }
```

---

## 📋 Software Requirements Specification (SRS)

### 1. Introduction
#### 1.1 Purpose
This Software Requirements Specification (SRS) establishes the complete functional, technical, behavioral, and architectural requirements for **PujaCircle**. It serves as the authoritative contract for academic evaluation, software engineering audits, and future production scaling.

#### 1.2 Scope
PujaCircle addresses the fragmented, opaque Vedic ritual services market in India by delivering a centralized, verified marketplace connecting Hindu devotees with Gurukul-trained Purohits. The system governs the entire lifecycle: Vedic credential vetting, dynamic Muhurat slot calculation, immutable price locking, pure cookie session security, and non-repudiable ceremony completion verification.

#### 1.3 Definitions, Acronyms, and Abbreviations
* **Purohit**: A learned Hindu priest ordained in Vedic scriptures, rituals, and mantras.
* **Muhurat**: An astrologically auspicious time window calculated in Indian Standard Time (`Asia/Kolkata` / UTC+05:30) for performing sacred ceremonies.
* **Dakshina**: Traditional monetary honorarium offered with reverence to the Purohit for officiating a religious sacrament.
* **Samagri**: Sacred ritual articles, herbs, grains, woods, and offerings required for a specific vidhi.
* **Vidhi**: The canonical procedure, scriptural sequence, and liturgical steps of a Vedic ceremony.
* **JWT**: JSON Web Token used for cryptographically signed identity assertions.
* **RBAC**: Role-Based Access Control (`USER`, `PRIEST`, `ADMIN`).
* **TTL**: Time-To-Live (session expiration duration).

---

### 2. Overall Description
#### 2.1 Product Perspective
PujaCircle operates as an independent, cloud-deployable full-stack application. It interfaces with external cloud services exclusively via secure HTTPS APIs:
* **Database**: PostgreSQL hosted via Supabase / AWS / Render with TLS/SSL pooling.
* **Media Cloud**: Cloudinary SDK for authenticated image transformation and storage.
* **Email Gateway**: Brevo (Sendinblue) Transactional REST API v3 for high-deliverability email dispatch.
* **Postal Directory**: India Post PIN code resolution for automated geographic mapping.

#### 2.2 User Classes & Personas
1. **Devotee (`USER`)**: Individuals seeking authentic Vedic rituals at home. Capabilities: ritual catalog browsing, Purohit discovery, Muhurat booking, venue address management, completion code sharing, and verified ceremony reviews.
2. **Vedic Purohit (`PRIEST`)**: Qualified priests officiating home ceremonies. Capabilities: service offering management, custom pricing in INR, working hours configuration, calendar leaves/blackout scheduling, reservation review, and 4-digit code completion.
3. **Operations Staff (`ADMIN`)**: Platform governance team. Capabilities: priest background credential verification, profile approval/rejection, user account moderation/banning, sacred catalog management, and platform analytics.

#### 2.3 General Constraints
* **Layout Discipline**: Strict **100% Flexbox layout** architecture (zero CSS Grid layouts) across all application viewports.
* **Timezone Invariance**: All Muhurat date/time computations are anchored to `Asia/Kolkata` (IST) regardless of the client machine's local clock.
* **12-Hour Notice Window**: Booking requests submitted with less than 12 hours notice prior to the start slot are rejected by system policy.
* **Address Quota**: Devotees may store a maximum of two primary ceremony sanctums (addresses).

---

### 3. Detailed Functional Requirements (IEEE 830)

#### FR-1: Authentication & Pure Cookie Session Management
* **FR-1.1**: The system shall support credential-based sign in via email and password using bcrypt (10 rounds).
* **FR-1.2**: Upon successful authentication, the system shall issue an authentic JWT signed with `JWT_SECRET` having a strict 7-day (1-week) TTL.
* **FR-1.3**: The authentication token shall be delivered via HTTP-only and client browser cookies (`access_token`, `pc_token`) with `SameSite=Lax` and `Path=/`.
* **FR-1.4**: The system shall strictly prohibit storing authentication tokens in browser `localStorage`.
* **FR-1.5**: On sign out (`POST /api/v1/auth/logout`), the system shall explicitly invalidate and clear all session cookies with `Max-Age=0`.

#### FR-2: Purohit Onboarding, Vetting & Public Visibility
* **FR-2.1**: A priest registering on the platform shall have their `approvalStatus` set to `PENDING` by default.
* **FR-2.2**: The system shall hide unapproved (`PENDING` or `REJECTED`) priests from public search and booking queries.
* **FR-2.3**: Operations Admin shall have dedicated interfaces to inspect priest bios, Vedic qualifications, experience years, and service localities before toggling `approvalStatus` to `APPROVED`.
* **FR-2.4**: If an Admin bans a priest, all active `PENDING` and `CONFIRMED` bookings for that priest shall be immediately cancelled with notification sent to devotees.

#### FR-3: Sacred Ritual Catalog & Samagri Guidance
* **FR-3.1**: The system shall maintain an authoritative master catalog of Vedic pujas containing duration, scriptural descriptions, samagri requirements list, and step-by-step vidhi guidelines.
* **FR-3.2**: Priests may create custom service offerings linked to catalog items with priest-defined prices in whole Indian Rupees (INR).

#### FR-4: Dynamic Muhurat Availability Calculation
* **FR-4.1**: For any requested calendar date, the system shall generate valid Muhurat windows based on priest working hours (e.g. 07:00 to 21:00).
* **FR-4.2**: The engine shall subtract: (a) full-day leaves, (b) partial blackout blocks, and (c) active confirmed/pending bookings.
* **FR-4.3**: Slots overlapping with existing commitments or falling within the 12-hour minimum notice window shall be marked unavailable.

#### FR-5: Booking Reservation & Immutable Price Locking
* **FR-5.1**: When a devotee reserves a Muhurat, the system shall create a unique `bookingReference` (e.g. `PC-2026-X8K9M2`).
* **FR-5.2**: The system shall create an immutable price snapshot in `servicePrice` and `totalPrice` in INR, ensuring that subsequent price changes by the priest never alter ongoing or past bookings.
* **FR-5.3**: A devotee cannot book the same priest for an overlapping time slot.

#### FR-6: Verification Handshake & Dakshina Settlement
* **FR-6.1**: When a priest accepts a booking, the status transitions to `CONFIRMED` and a random 4-digit numeric completion code is generated.
* **FR-6.2**: The 4-digit code shall be accessible and displayed **strictly to the devotee**; it shall be hidden from the priest's API view.
* **FR-6.3**: After officiating the vidhi, the priest must enter this 4-digit code. The backend must verify the code before transitioning status to `COMPLETED` and `paymentStatus` to `PAID_OFFLINE`.

#### FR-7: Verified Devotee Reviews
* **FR-7.1**: Devotees may only submit reviews and 1–5 star ratings for bookings with status `COMPLETED`.
* **FR-7.2**: Duplicate reviews for the same booking reservation shall be rejected with HTTP 400.
* **FR-7.3**: The priest's `ratingAverage` and `totalReviews` aggregates shall automatically recalculate upon review submission.

#### FR-8: Admin Oversight & Platform Moderation
* **FR-8.1**: The system shall provide an administrative operations console with real-time analytics (total users, verified priests, active ceremonies, completion rates).
* **FR-8.2**: Operations staff can suspend devotee accounts or ban priest profiles with mandatory audit reason logging.

---

### 4. Non-Functional Requirements (NFRs)

#### 4.1 Security & Data Integrity
* **Transport Security**: Enforced HTTPS/TLS across all public endpoints and PostgreSQL database connection poolers (`ssl: 'require'`).
* **Credential Protection**: Passwords hashed using bcrypt with 10 salt rounds; plaintext passwords are never written to disk or logs.
* **API Protection**: Helmet security headers, rate limiting (general: 100 req/15min, auth: 20 req/15min, OTP: 5 req/10min), strict CORS credentials matching.
* **SQL Injection Immunity**: Zero raw string concatenation in SQL queries; all database operations use Drizzle ORM parameterized queries.

#### 4.2 Performance & Responsiveness
* **API Latency**: 95% of standard read endpoints (`/catalog`, `/priests`, `/availability`) respond within < 150ms under normal load.
* **Frontend Bundle**: Production main bundle chunk maintained under 400 kB (currently **377.1 kB**) with aggressive code splitting.
* **First Contentful Paint (FCP)**: Sub-1.2s on standard 4G networks.

#### 4.3 Availability & Reliability
* **System Uptime**: 99.9% target operational availability with graceful shutdown handling on `SIGTERM` / `SIGINT`.
* **Fault Isolation**: Centralized `AppError` and global error handling prevent database schema details or stack traces from leaking to client responses.

---

## 🛡️ Core Architectural Principles & Business Rules

1. **Strict MVC Pattern**: The backend adheres strictly to the Model-View-Controller pattern. Models define Drizzle ORM entities, Controllers handle HTTP transport, Services execute domain logic and calculations, Repositories provide query encapsulation, and ViewModels sanitize outgoing JSON payloads.
2. **Pure Cookie Authentication (Zero localStorage)**: Authentication tokens are stored exclusively in secure browser cookies with a 1-week (7-day) TTL. Cross-origin credential sharing uses `withCredentials: true` with strict CORS policies.
3. **Immutable Price Snapshots**: Priests configure individual pricing per ritual offering. When a devotee requests a ceremony, the price is snapshot-locked into the booking record (`servicePrice` and `totalPrice`). Any future price adjustments by the priest never alter ongoing or past bookings.
4. **4-Digit Completion Handshake**: When a ceremony is confirmed, an authentic cryptographically random 4-digit code is generated and displayed **only to the devotee**. The priest must enter this code upon performing the vidhi to mark the ceremony `COMPLETED`.
5. **12-Hour Advance Notice Window**: Ceremonies require at least 12 hours of advance notice so the assigned Purohit can inspect existing commitments, schedule travel, and assemble authentic samagri.
6. **Strict Two-Step Purohit Verification**: Devotees verify email via OTP. Purohits undergo credential verification followed by mandatory administrative vetting before their profile appears in public search.
7. **Automated Postal PIN Code Resolution**: 6-digit Indian PIN codes resolve locality, city, district, and state through automated lookup.
8. **Verified Reviews Only**: 1–5 star ratings and reviews are strictly restricted to the devotee who booked the ceremony and can only be submitted once the booking status transitions to `COMPLETED`.

---

## 🛠️ Technology Stack

### Frontend Application
- **Core Framework**: React 19 + TypeScript (Strict Mode)
- **Build Tooling**: Vite 6 + Rollup Manual Chunk Splitting
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite` + `@plugin "tailwindcss-animate"`)
- **UI Primitives**: `@base-ui/react` (Headless accessible primitives) + Lucide React icons
- **Typography**: `@fontsource/fraunces` (Sacred Serif headings) + `@fontsource/inter` (Clean Sans body)
- **Motion & Animations**: Framer Motion with app-wide reduced-motion support
- **Routing**: React Router v7 with declarative role guards (`RoleRouteGuard`, `GuestOnlyRoute`, `PublicRouteGuard`)
- **State Management**: Zustand (Session & Client state store)
- **Forms & Validation**: React Hook Form + Zod (`@hookform/resolvers/zod`)
- **HTTP Client**: Axios with automated cookie credentials (`withCredentials: true`) and error sanitization
- **Toast Notifications**: Sonner

### Backend Application
- **Runtime**: Node.js + Express 4 + TypeScript (`tsx` in dev, `tsc` + `tsc-alias` in production)
- **ORM & Database**: Drizzle ORM + PostgreSQL (`postgres.js` connection pool with SSL enforcement)
- **Authentication**: JWT authentication (7-day expiration, HTTP-only & secure cookies)
- **Transactional Email**: Brevo (Sendinblue) HTTPS REST API v3 (Render-safe port-agnostic delivery)
- **Media Cloud Storage**: Cloudinary SDK (Direct upload signatures, 2MB size enforcement)
- **Security & Headers**: Helmet, Cookie-Parser, CORS credentials, Express Rate Limit
- **Validation**: Zod request schema validation middleware (`validate.middleware.ts`)
- **Error Handling**: Custom `AppError` class with global error sanitization preventing raw database leaks

---

## 📡 REST API Directory

| Domain | Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| **System** | `GET` | `/api/v1/health` | Service uptime and operational health check | No |
| **Auth** | `POST` | `/api/v1/auth/login` | Authenticate user, priest, or admin (sets 7-day cookie) | No |
| **Auth** | `POST` | `/api/v1/auth/register/user` | Register new devotee account | No |
| **Auth** | `POST` | `/api/v1/auth/register/priest` | Submit priest onboarding application | No |
| **Auth** | `GET` | `/api/v1/auth/me` | Retrieve authenticated user profile | Yes |
| **Auth** | `POST` | `/api/v1/auth/logout` | Clear session cookies and invalidate token | Yes |
| **Auth** | `POST` | `/api/v1/auth/otp/send-email` | Dispatch 6-digit verification OTP | No |
| **Auth** | `POST` | `/api/v1/auth/otp/verify-email` | Verify email OTP | No |
| **Bookings** | `GET` | `/api/v1/bookings` | List user or priest ceremony bookings | Yes |
| **Bookings** | `GET` | `/api/v1/bookings/:id` | Retrieve detailed ceremony reservation | Yes |
| **Bookings** | `POST` | `/api/v1/bookings` | Create new ceremony booking (price snapshot locked) | Yes (User) |
| **Bookings** | `POST` | `/api/v1/bookings/:id/accept` | Purohit accepts pending booking | Yes (Priest) |
| **Bookings** | `POST` | `/api/v1/bookings/:id/reject` | Purohit rejects booking (reason required) | Yes (Priest) |
| **Bookings** | `POST` | `/api/v1/bookings/:id/cancel` | Cancel ceremony (devotee or priest) | Yes |
| **Bookings** | `POST` | `/api/v1/bookings/:id/complete` | Verify 4-digit code & complete ceremony | Yes (Priest) |
| **Bookings** | `POST` | `/api/v1/bookings/rating` | Submit 1–5 star verified ceremony review | Yes (User) |
| **Priests** | `GET` | `/api/v1/priests` | Public directory search with locality/city filters | No |
| **Priests** | `GET` | `/api/v1/priests/:id` | Public verified Purohit profile dossier | No |
| **Priests** | `GET` | `/api/v1/priests/me/profile` | Retrieve active priest workspace profile | Yes (Priest) |
| **Priests** | `PUT` | `/api/v1/priests/profile` | Update priest bio, languages, and settlement UPI | Yes (Priest) |
| **Availability**| `GET` | `/api/v1/availability/slots` | Calculate dynamic Muhurat slots for date | No |
| **Availability**| `POST` | `/api/v1/availability/day-off` | Mark full-day leave on calendar | Yes (Priest) |
| **Availability**| `POST` | `/api/v1/availability/block-hours` | Mark partial-day blackout window | Yes (Priest) |
| **Catalog** | `GET` | `/api/v1/catalog` | List Vedic rituals with samagri & vidhi guidelines | No |
| **Addresses** | `GET` | `/api/v1/addresses` | List saved devotee sanctum venue addresses | Yes (User) |
| **Addresses** | `POST` | `/api/v1/addresses` | Save new venue address (max 2 allowed) | Yes (User) |
| **Admin** | `GET` | `/api/v1/admin/dashboard/stats` | Platform KPIs, booking volumes & verification counts | Yes (Admin) |
| **Admin** | `GET` | `/api/v1/admin/priests/pending` | List pending priest onboarding dossiers | Yes (Admin) |
| **Admin** | `POST` | `/api/v1/admin/priests/:id/approve` | Approve priest for public search | Yes (Admin) |
| **Admin** | `POST` | `/api/v1/admin/priests/:id/ban` | Suspend priest and cancel pending bookings | Yes (Admin) |
| **Media** | `POST` | `/api/v1/media/upload` | Upload avatar or ritual photo to Cloudinary | Yes |

---

## 📁 Repository Structure

```
pujaCircle/
├── frontend/                     # React 19 + Vite 6 + Tailwind CSS v4 Application
│   ├── public/                   # Static assets, localized Vedic ceremony photography
│   ├── src/
│   │   ├── api/                  # Typed API clients (auth, priest, booking, user, admin, etc.)
│   │   ├── components/
│   │   │   ├── admin/            # Approval tables, moderation dialogs, user action modals
│   │   │   ├── auth/             # Role tabs, OTP verification card, password reset cards
│   │   │   ├── booking/          # Status badges, rating modal, cancellation dialog, timeline
│   │   │   ├── common/           # ErrorBoundary, logo, carousels, route guards, spinners
│   │   │   ├── layout/           # Navbar, footer, dashboard sidebar shells
│   │   │   ├── legal/            # Terms, privacy, and cookie policy modals
│   │   │   ├── priest/           # Service form, block time, complete booking modals
│   │   │   └── ui/               # Base UI primitives (dialog, sheet, select, tabs, button)
│   │   ├── lib/                  # Utilities (cookies, errorHandler, availabilityUtils, config)
│   │   ├── motion/               # Framer Motion animation variants & accessibility
│   │   ├── pages/                # Modular page orchestrators (Devotee, Priest, Admin)
│   │   ├── routes/               # Declarative code-split route graph (app-router.tsx)
│   │   ├── schemas/              # Zod validation schemas for forms
│   │   ├── store/                # Zustand persistent auth state store
│   │   └── types/                # Domain entity interfaces & ViewModel types
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                      # Express 4 + Drizzle ORM MVC Backend
│   ├── drizzle/                  # Drizzle SQL migrations
│   ├── src/
│   │   ├── config/               # Environment validation (env.ts), Cloudinary, Supabase
│   │   ├── controllers/          # Controllers (auth, admin, user, priest, booking, catalog)
│   │   ├── db/                   # Database client (index.ts) with SSL pooling & seed script
│   │   ├── middlewares/          # Auth, role-based guard, rate limiters, validation, global error
│   │   ├── models/               # Drizzle table definitions & entity relations
│   │   ├── repositories/         # Canonical data access helpers (priest.repository.ts)
│   │   ├── routes/               # Modular Express routers (11 domain subrouters)
│   │   ├── schemas/              # Zod input validation schemas
│   │   ├── services/             # Business logic layer (auth, booking, availability, priest, admin)
│   │   ├── tests/                # Automated backend tests (availability.test.ts)
│   │   ├── types/                # Express request extensions & role types
│   │   ├── utils/                # AppError, pagination helpers, auth utilities
│   │   ├── views/                # Presentation ViewModels & JSON serializers
│   │   ├── app.ts                # Express application factory & middleware stack
│   │   └── server.ts             # Server entry point & graceful shutdown
│   ├── package.json
│   └── tsconfig.json
│
├── package.json                  # Root monorepo orchestration & scripts
└── README.md                     # Comprehensive Project Guide & SRS
```

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher
- **PostgreSQL Database**: PostgreSQL 14+ or cloud instance (e.g. Supabase / Neon / Render PostgreSQL)

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/pujaCircle.git
cd pujaCircle

# Install root orchestration dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Environment Configuration

Create a `.env` file in the `backend/` directory using the sanitized template below:

```ini
# Server Configuration
PORT=5000
NODE_ENV=development

# PostgreSQL Database Connection URL (Local or Cloud Pooler with SSL)
DATABASE_URL=postgresql://postgres:your_db_password@localhost:5432/pujacircle

# Supabase Authentication & Admin (Optional / External)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_JWT_SECRET=your-supabase-jwt-secret

# JWT & Session Security (1-Week Expiry)
JWT_SECRET=your-secure-jwt-secret-minimum-32-characters
JWT_EXPIRES_IN=7d
COOKIE_SECRET=your-secure-cookie-secret-minimum-32-characters
CLIENT_URL=http://localhost:5173

# Cloudinary Media Storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Brevo (Sendinblue) Transactional REST API
BREVO_API_KEY=your-brevo-api-key
BREVO_SENDER_EMAIL=noreply@yourdomain.com
BREVO_SENDER_NAME="PujaCircle Sanctum"
```

Create a `.env` file in the `frontend/` directory:

```ini
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### 3. Database Migration & Seeding
```bash
# Push schema directly to PostgreSQL database via Drizzle Kit:
cd backend
npm run db:push

# (Optional) Seed the database with catalog pujas and sample accounts:
npm run db:seed
cd ..
```

### 4. Running the Development Servers
```bash
# Run both Frontend and Backend concurrently from the root directory:
npm run dev

# Or run services individually:
npm run frontend   # Starts Vite dev server at http://localhost:5173
npm run backend    # Starts Express server at http://localhost:5000
```

### 5. Running Tests & Quality Verification
```bash
# Run automated backend business logic & calendar tests:
npm run test

# Run full-stack TypeScript typechecking across both workspaces:
npm run typecheck

# Run production build compilation:
npm run build
```

---

## 🎨 Sacred Vedic Design System

PujaCircle adheres to an intentional, culturally resonant design system defined in `frontend/src/index.css`:

* **Sacred Vermilion / Maroon (`#780016` / `#991B1B`)**: Vedic heritage, sacred sanctity, and auspicious authority.
* **Haldi Gold (`amber-600` / `amber-700`)**: Divine illumination, sacred turmeric, and prosperity.
* **Chandan Cream (`#FAF7F2` / `amber-50`)**: Clean, calm, temple-canvas readability.
* **Typography**:
  - Headings & Ceremonies: **Fraunces** (`--font-serif` / variable serif)
  - UI Controls, Timelines & Data: **Inter** (`--font-sans` / clean modern sans-serif)
* **Layout Rule**: 100% Flexbox layout architecture across all screens for seamless responsiveness and zero grid collisions.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.
