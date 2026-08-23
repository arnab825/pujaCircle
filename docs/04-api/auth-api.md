# Auth API Specifications - PujaCircle

## 1. Login (Email + Password)
- **Method**: `POST`
- **Route**: `/api/v1/auth/login`
- **Auth**: None (Public)
- **Request Body**:
```json
{
  "email": "user@pujacircle.demo",
  "password": "User@123"
}
```
- **Validation**: Valid email address and non-empty password.
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Welcome back, Demo User!",
  "data": {
    "user": {
      "id": "user-devotee-1",
      "name": "Demo User",
      "email": "user@pujacircle.demo",
      "phoneNumber": "+919876543210",
      "role": "USER"
    }
  }
}
```

---

## 2. Phone Validation OTP (One-Time during Registration)
- **Method**: `POST`
- **Route**: `/api/v1/auth/send-phone-otp`
- **Request Body**:
```json
{
  "phoneNumber": "+919876543210"
}
```

---

## 3. Email OTP Verification & Forgot Password
- **Method**: `POST`
- **Route**: `/api/v1/auth/send-email-otp` / `/api/v1/auth/verify-email-otp`
- **Request Body**:
```json
{
  "email": "user@pujacircle.demo",
  "otp": "123456"
}
```
