# Booking API Specifications - PujaCircle

## 1. Create Booking
- **Method**: `POST`
- **Route**: `/api/v1/bookings`
- **Auth**: Required (`USER`)
- **Request Body**:
```json
{
  "priestId": "pr_mock_1",
  "ritualId": "rit_1",
  "addressId": "addr_mock_1",
  "slotId": "slot_3",
  "bookingDate": "2026-08-26",
  "specialInstructions": "Please arrive 15 minutes early for setup.",
  "dakshinaAmount": 3100
}
```
- **Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "Booking scheduled successfully. Offline payment to priest upon completion.",
  "data": {
    "id": "bk_mock_1",
    "bookingReference": "PC-2026-0801",
    "status": "CONFIRMED",
    "paymentMethod": "OFFLINE_CASH",
    "paymentStatus": "PENDING",
    "dakshinaAmount": 3100,
    "bookingDate": "2026-08-26",
    "startTime": "08:00",
    "endTime": "11:00"
  }
}
```

---

## 2. List Bookings
- **Method**: `GET`
- **Route**: `/api/v1/bookings`
- **Auth**: Required (`USER` or `PRIEST`)

---

## 3. Cancel Booking
- **Method**: `PATCH`
- **Route**: `/api/v1/bookings/:id/cancel`
- **Auth**: Required
- **Request Body**:
```json
{
  "reason": "Change in family travel plans"
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Booking cancelled successfully. Associated muhurat slot released.",
  "data": {
    "id": "bk_mock_1",
    "status": "CANCELLED",
    "cancellationReason": "Change in family travel plans",
    "cancelledBy": "USER",
    "cancelledAt": "2026-08-23T08:50:00.000Z"
  }
}
```
