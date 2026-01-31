# Authentication Backend API

A Node.js backend application for user authentication with registration and login functionality using MongoDB.

## Features

- User Registration with validation
- User Login with JWT authentication
- Password hashing with bcryptjs
- Protected routes with JWT middleware
- CORS enabled
- Input validation with express-validator
- MongoDB database integration

## Tech Stack

- Node.js
- Express.js
- MongoDB
- JWT (JSON Web Tokens)
- bcryptjs
- express-validator

## Installation

1. Install dependencies:
```bash
npm install
```

2. Update the `.env` file with your MongoDB connection string and JWT secret.

3. Start the development server:
```bash
npm run dev
```

Or for production:
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### 1. Register User
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "phone": "+1234567890",
  "address": "123 Main Street, Apt 4B",
  "country": "United States"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main Street, Apt 4B",
    "country": "United States"
  }
}
```

### 2. Login User
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main Street, Apt 4B",
    "country": "United States"
  }
}
```

### 3. Get User Profile (Protected)
**GET** `/api/auth/profile`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main Street, Apt 4B",
    "country": "United States",
    "createdAt": "2024-01-31T10:30:00.000Z",
    "updatedAt": "2024-01-31T10:30:00.000Z"
  }
}
```

### 4. Health Check
**GET** `/api/health`

**Response:**
```json
{
  "success": true,
  "message": "Server is running"
}
```

## Validation Rules

### Registration Validation:
- **Name**: Minimum 2 characters
- **Email**: Valid email format
- **Password**: Minimum 6 characters, must contain uppercase, lowercase, and number
- **Phone**: Valid phone number format
- **Address**: Minimum 5 characters
- **Country**: Minimum 2 characters

### Login Validation:
- **Email**: Valid email format
- **Password**: Required field

## Error Responses

```json
{
  "success": false,
  "message": "Error message here"
}
```

## Environment Variables

Create a `.env` file in the root directory:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
PORT=5000
```

## Project Structure

```
website--backend/
├── config/
│   └── database.js
├── controllers/
│   └── authController.js
├── middleware/
│   ├── auth.js
│   └── validation.js
├── models/
│   └── User.js
├── routes/
│   └── authRoutes.js
├── .env
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## Notes

- Passwords are hashed using bcryptjs before storing in the database
- JWT tokens expire after 7 days (configurable in .env)
- Email addresses are unique and case-insensitive
- All user data is validated on both client and server side
- Change the JWT_SECRET in production to a secure random string
