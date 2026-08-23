# Database Architecture Specification - PujaCircle

## 1. Technology Selection

- **Database Engine**: PostgreSQL (Hosted on Supabase).
- **ORM**: Drizzle ORM (Type-safe SQL dialect with zero overhead and full TypeScript inference).
- **Migration Engine**: Drizzle Kit (`drizzle-kit generate` & `drizzle-kit migrate`).

---

## 2. Relational Schema Architecture

```mermaid
erDiagram
    USERS ||--o{ ADDRESSES : "has many"
    USERS ||--o{ BOOKINGS : "places"
    PRIESTS ||--o{ SLOTS : "opens"
    PRIESTS ||--o{ BOOKINGS : "conducts"
    RITUALS ||--o{ BOOKINGS : "specifies"
    ADDRESSES ||--o{ BOOKINGS : "located at"
    SLOTS ||--o| BOOKINGS : "reserved for"

    USERS {
        uuid id PK
        string full_name
        string phone_number UK
        string email
        string role
        boolean is_phone_verified
        timestamp created_at
    }

    PRIESTS {
        uuid id PK
        uuid user_id FK
        string display_name
        string approval_status
        int experience_years
        text bio
        text_array languages
        text_array specializations
        text_array service_areas
        string city
        string state
        timestamp created_at
    }

    ADDRESSES {
        uuid id PK
        uuid user_id FK
        string label
        string recipient_name
        string phone_number
        string house_building
        string street
        string locality
        string pincode
        string city
        string district
        string state
        boolean is_default
    }

    RITUALS {
        uuid id PK
        string name
        string slug UK
        text description
        int approximate_duration_minutes
        string category
        text_array requirements
        numeric suggested_dakshina
    }

    SLOTS {
        uuid id PK
        uuid priest_id FK
        date slot_date
        string start_time
        string end_time
        string status
    }

    BOOKINGS {
        uuid id PK
        string booking_reference UK
        uuid user_id FK
        uuid priest_id FK
        uuid ritual_id FK
        uuid address_id FK
        uuid slot_id FK
        date booking_date
        string status
        string payment_method
        string payment_status
        numeric dakshina_amount
        timestamp created_at
    }
```
