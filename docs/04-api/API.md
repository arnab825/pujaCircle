# REST API Overview & Conventions - PujaCircle

## 1. Base URL & Protocol

- **Base URL**: `/api/v1`
- **Format**: JSON (`Content-Type: application/json`)
- **Authentication**: HTTP-Only Cookie with JWT Bearer Token

---

## 2. Standard Response Structures

### Success Response (2xx)
```json
{
  "success": true,
  "message": "Action completed successfully",
  "data": { ... }
}
```

### Error Response (4xx / 5xx)
```json
{
  "success": false,
  "message": "Human readable error description",
  "errors": [
    {
      "field": "phoneNumber",
      "message": "Invalid 10-digit Indian phone number"
    }
  ]
}
```

---

## 3. Endpoints Registry Summary

| Domain | Method | Endpoint | Auth Required | Role | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/send-otp` | No | Public | Sends 6-digit OTP to Indian mobile |
| | `POST` | `/api/v1/auth/verify-otp` | No | Public | Verifies OTP and sets auth cookie |
| | `POST` | `/api/v1/auth/register` | No | Public | Initiates devotee account creation |
| | `POST` | `/api/v1/auth/logout` | Yes | Any | Clears session cookies |
| **User** | `GET` | `/api/v1/users/profile` | Yes | Any | Gets authenticated user profile |
| | `PATCH` | `/api/v1/users/profile` | Yes | Any | Updates user profile fields |
| **Addresses**| `GET` | `/api/v1/addresses` | Yes | Devotee | Lists saved user addresses |
| | `POST` | `/api/v1/addresses` | Yes | Devotee | Adds new address |
| | `PUT` | `/api/v1/addresses/:id` | Yes | Devotee | Updates existing address |
| | `DELETE`| `/api/v1/addresses/:id` | Yes | Devotee | Deletes address |
| | `PATCH` | `/api/v1/addresses/:id/default`| Yes | Devotee | Sets address as default |
| **Priests** | `GET` | `/api/v1/priests` | No | Public | Lists verified & approved priests |
| | `GET` | `/api/v1/priests/:id` | No | Public | Gets priest profile & slots |
| | `POST` | `/api/v1/priests/register` | No | Public | Submits priest registration |
| | `PATCH` | `/api/v1/priests/:id/approve` | Yes | Admin | Approves pending priest profile |
| | `PATCH` | `/api/v1/priests/:id/reject` | Yes | Admin | Rejects pending priest profile |
| **Bookings**| `POST` | `/api/v1/bookings` | Yes | Devotee | Creates new puja booking |
| | `GET` | `/api/v1/bookings` | Yes | Any | Lists user's or priest's bookings |
| | `GET` | `/api/v1/bookings/:id` | Yes | Any | Retrieves booking details |
| | `PATCH` | `/api/v1/bookings/:id/cancel` | Yes | Any | Cancels scheduled booking |
