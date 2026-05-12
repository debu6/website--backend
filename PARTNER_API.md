# Partner API Documentation

## Overview
The Partner API provides endpoints for partner registration, login, and profile management. Partners are business entities that can manage bookings and services through the platform.

## Base URL
```
http://localhost:5000/api/partners
```

## Endpoints

### 1. Register a New Partner
**POST** `/api/partners/register`

Register a new partner account with company and personal details.

**Request Body:**
```json
{
  "companyName": "Your Company Name",
  "contactPersonName": "John Doe",
  "email": "partner@company.com",
  "phone": "+91 9876543210",
  "address": "Business Address",
  "password": "securePassword123",
  "hasGST": true,
  "gst": "27AABCU9603R1Z0" (optional, required if hasGST is true)
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Partner registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "648f3e8c9b2d1c5e4a9f1b2c",
    "type": "partner",
    "companyName": "Your Company Name",
    "contactPersonName": "John Doe",
    "email": "partner@company.com",
    "phone": "+91 9876543210"
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Email already registered",
  "errors": [
    {
      "msg": "A partner with this email already exists"
    }
  ]
}
```

---

### 2. Partner Login
**POST** `/api/partners/login`

Authenticate a partner with email and password.

**Request Body:**
```json
{
  "email": "partner@company.com",
  "password": "securePassword123"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "648f3e8c9b2d1c5e4a9f1b2c",
    "type": "partner",
    "companyName": "Your Company Name",
    "contactPersonName": "John Doe",
    "email": "partner@company.com",
    "phone": "+91 9876543210"
  }
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "message": "Invalid email or password",
  "errors": [
    {
      "msg": "Password does not match"
    }
  ]
}
```

---

### 3. Get Partner Profile
**GET** `/api/partners/:id`

Retrieve a partner's profile information.

**Headers:**
```
Authorization: Bearer {token}
```

**URL Parameters:**
- `id`: Partner's MongoDB ID

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "_id": "648f3e8c9b2d1c5e4a9f1b2c",
    "companyName": "Your Company Name",
    "contactPersonName": "John Doe",
    "email": "partner@company.com",
    "phone": "+91 9876543210",
    "address": "Business Address",
    "hasGST": true,
    "gst": "27AABCU9603R1Z0",
    "isVerified": false,
    "isActive": true,
    "totalBookings": 0,
    "rating": 0,
    "reviews": 0,
    "commission": 10,
    "bankDetails": {
      "accountHolder": "Name",
      "accountNumber": "1234567890",
      "bankName": "Bank Name",
      "ifscCode": "BANK0001234",
      "upiId": "user@upi"
    },
    "documents": {},
    "createdAt": "2024-06-15T10:30:00.000Z",
    "updatedAt": "2024-06-15T10:30:00.000Z"
  }
}
```

---

### 4. Update Partner Profile
**PUT** `/api/partners/:id`

Update a partner's profile information.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "companyName": "Updated Company Name",
  "phone": "+91 9876543210",
  "address": "New Address",
  "hasGST": true,
  "gst": "27AABCU9603R1Z0",
  "bankDetails": {
    "accountHolder": "Account Holder Name",
    "accountNumber": "1234567890",
    "bankName": "Bank Name",
    "ifscCode": "BANK0001234",
    "upiId": "user@upi"
  }
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "648f3e8c9b2d1c5e4a9f1b2c",
    "companyName": "Updated Company Name",
    "email": "partner@company.com",
    ...
  }
}
```

---

## Error Codes

| Status | Message | Description |
|--------|---------|-------------|
| 400 | Bad Request | Missing required fields or validation error |
| 401 | Unauthorized | Invalid credentials or authentication failed |
| 404 | Not Found | Partner not found |
| 500 | Server Error | Internal server error |

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer {token}
```

The token is returned when registering or logging in and is valid for 7 days.

---

## Partner Model Fields

| Field | Type | Description |
|-------|------|-------------|
| companyName | String | Company name (required) |
| contactPersonName | String | Primary contact person name (required) |
| email | String | Partner email (unique, required) |
| phone | String | Contact phone number (required) |
| address | String | Business address (required) |
| password | String | Encrypted password |
| hasGST | Boolean | Whether GST is applicable |
| gst | String | GST number (if applicable) |
| isVerified | Boolean | Account verification status |
| isActive | Boolean | Account active status |
| totalBookings | Number | Total bookings count |
| rating | Number | Partner rating (0-5) |
| reviews | Number | Number of reviews |
| commission | Number | Commission percentage (default 10%) |
| bankDetails | Object | Bank account details |
| documents | Object | Document URLs (GST, ID, Address proof) |
| createdAt | DateTime | Account creation timestamp |
| updatedAt | DateTime | Last update timestamp |

---

## Example Implementation (Frontend)

### Register Partner
```javascript
const registerPartner = async (formData) => {
  const response = await fetch('/api/partners/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    // Redirect to dashboard
  } else {
    console.error(data.message);
  }
};
```

### Login Partner
```javascript
const loginPartner = async (email, password) => {
  const response = await fetch('/api/partners/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    // Redirect to dashboard
  } else {
    console.error(data.message);
  }
};
```

### Get Partner Profile
```javascript
const getPartnerProfile = async (partnerId, token) => {
  const response = await fetch(`/api/partners/${partnerId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const data = await response.json();
  return data.data;
};
```

---

## Notes

- GST validation follows Indian GST format: `XX AAAA XXXX XXXX X`
- Passwords are hashed using bcryptjs before storage
- All timestamps are in ISO 8601 format
- Commission defaults to 10% but can be adjusted per partner
- Inactive accounts cannot login even with correct credentials
