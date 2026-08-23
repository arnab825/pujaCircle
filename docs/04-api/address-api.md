# Address API Specifications - PujaCircle

## 1. List Addresses
- **Method**: `GET`
- **Route**: `/api/v1/addresses`
- **Auth**: Required (`USER`)
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "addr_mock_1",
      "userId": "usr_mock_1",
      "label": "HOME",
      "recipientName": "Aditi Sharma",
      "phoneNumber": "9876543210",
      "houseBuilding": "Flat 802, Orchid Residency",
      "street": "Linking Road",
      "locality": "Bandra West",
      "landmark": "Opposite National College",
      "pincode": "400050",
      "city": "Mumbai",
      "district": "Mumbai Suburban",
      "state": "Maharashtra",
      "country": "India",
      "isDefault": true,
      "createdAt": "2026-01-15T12:00:00.000Z"
    }
  ]
}
```

---

## 2. Create Address
- **Method**: `POST`
- **Route**: `/api/v1/addresses`
- **Auth**: Required (`USER`)
- **Request Body**:
```json
{
  "label": "HOME",
  "recipientName": "Aditi Sharma",
  "phoneNumber": "9876543210",
  "houseBuilding": "Flat 802, Orchid Residency",
  "street": "Linking Road",
  "locality": "Bandra West",
  "landmark": "Opposite National College",
  "pincode": "400050",
  "city": "Mumbai",
  "district": "Mumbai Suburban",
  "state": "Maharashtra",
  "country": "India",
  "isDefault": true
}
```
- **Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "Address created successfully",
  "data": { "id": "addr_mock_1", ... }
}
```

---

## 3. Update Address
- **Method**: `PUT`
- **Route**: `/api/v1/addresses/:id`
- **Auth**: Required (`USER`)

---

## 4. Delete Address
- **Method**: `DELETE`
- **Route**: `/api/v1/addresses/:id`
- **Auth**: Required (`USER`)

---

## 5. Set Default Address
- **Method**: `PATCH`
- **Route**: `/api/v1/addresses/:id/default`
- **Auth**: Required (`USER`)
