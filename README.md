# Personal Expense Tracker – Backend

A Node.js + Express + TypeScript backend for a Personal Expense Tracker with MongoDB and Mongoose. Features user-wise expense tracking, monthly summaries, schema relationships, validations, and Mongoose middleware usage.

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety and better developer experience
- **MongoDB Atlas** - Cloud-hosted database
- **Mongoose** - MongoDB ODM with schema validation

## Features

- ✅ User management with unique email validation
- ✅ Expense tracking linked to users
- ✅ Monthly budget tracking
- ✅ Expense categorization (Food, Travel, Shopping, etc.)
- ✅ Monthly expense summary with budget utilization
- ✅ Pagination support for expense listing
- ✅ Filtering by category and date range
- ✅ Mongoose middleware for data validation and consistency
- ✅ Comprehensive error handling

## Project Structure

```
src/
├── config/           # Database configuration
├── controllers/      # Route handlers
├── middleware/       # Express middleware (error handling)
├── models/           # Mongoose schemas and models
├── routes/           # API route definitions
├── types/            # TypeScript type definitions
├── utils/            # Helper functions and utilities
└── index.ts          # Application entry point
```

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (or any cloud MongoDB provider)

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/vidyavipul/personal-expense-tracker.git
cd personal-expense-tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/expense-tracker?retryWrites=true&w=majority

# Server configuration
PORT=3000
NODE_ENV=development
```

**Important:** Replace `<username>`, `<password>`, and `<cluster>` with your MongoDB Atlas credentials.

### 4. Start the development server

```bash
npm run dev
```

The server will start at `http://localhost:3000`

### 5. Build for production

```bash
npm run build
npm start
```

## Database Hosting

This project uses **MongoDB Atlas** (cloud-hosted MongoDB). To set up:

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create a database user with read/write permissions
4. Whitelist your IP address (or allow access from anywhere for development)
5. Get the connection string and add it to your `.env` file

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Health Check
```
GET /health
```
Response:
```json
{
  "success": true,
  "message": "Personal Expense Tracker API is running",
  "timestamp": "2026-02-01T10:00:00.000Z"
}
```

---

### User Endpoints

#### Create User
```
POST /api/users
```
Request Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "monthlyBudget": 5000
}
```
Response (201):
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "monthlyBudget": 5000,
    "createdAt": "2026-02-01T10:00:00.000Z",
    "updatedAt": "2026-02-01T10:00:00.000Z"
  }
}
```

#### Get User by ID
```
GET /api/users/:id
```
Response (200):
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "monthlyBudget": 5000,
    "createdAt": "2026-02-01T10:00:00.000Z",
    "updatedAt": "2026-02-01T10:00:00.000Z"
  }
}
```

#### Get All Users
```
GET /api/users?email=john@example.com
```

Query Parameters:
- `email` (optional): Get users by email address

Response (200):
```json
{
  "success": true,
  "data": [...],
  "count": 1
}
```

---

### Expense Endpoints

#### Create Expense
```
POST /api/expenses
```
Request Body:
```json
{
  "title": "Lunch at restaurant",
  "amount": 25.50,
  "category": "Food",
  "date": "2026-02-01",
  "userId": "<user_id>"
}
```

**Valid Categories:** `Food`, `Travel`, `Shopping`, `Entertainment`, `Bills`, `Healthcare`, `Education`, `Other`

Response (201):
```json
{
  "success": true,
  "message": "Expense created successfully",
  "data": {
    "_id": "...",
    "title": "Lunch at restaurant",
    "amount": 25.50,
    "category": "Food",
    "date": "2026-02-01T00:00:00.000Z",
    "userId": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "createdAt": "2026-02-01T10:00:00.000Z",
    "updatedAt": "2026-02-01T10:00:00.000Z"
  }
}
```

#### Get User Expenses (with pagination & filtering)
```
GET /api/users/:id/expenses?page=1&limit=10&category=Food&startDate=2026-02-01&endDate=2026-02-28
```

Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `category` (optional): Filter by category
- `startDate` (optional): Filter by start date (YYYY-MM-DD)
- `endDate` (optional): Filter by end date (YYYY-MM-DD)

Response (200):
```json
{
  "success": true,
  "message": "Expenses retrieved successfully",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

### Summary Endpoint

#### Get Monthly Summary
```
GET /api/users/:id/summary
```
Response (200):
```json
{
  "success": true,
  "message": "User summary retrieved successfully",
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "monthlyBudget": 5000
    },
    "currentMonth": {
      "month": "February",
      "year": 2026
    },
    "summary": {
      "totalExpenses": 1250.50,
      "remainingBudget": 3749.50,
      "numberOfExpenses": 15,
      "budgetUtilization": "25.01%"
    },
    "expensesByCategory": [
      { "category": "Food", "total": 450.00, "count": 8 },
      { "category": "Travel", "total": 300.50, "count": 3 },
      { "category": "Shopping", "total": 500.00, "count": 4 }
    ]
  }
}
```

---

## Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

Common HTTP Status Codes:
- `400` - Bad Request (validation errors, invalid input)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate email)
- `500` - Internal Server Error

---

## Mongoose Middleware Usage

This project demonstrates proper use of Mongoose middleware/hooks:

### User Model
- **Pre-save hook**: Normalizes data (trims name, lowercases email, rounds budget)
- **Pre-validate hook**: Additional validation for budget > 0
- **Post-save hook**: Logging for successful saves

### Expense Model
- **Pre-validate hook**: Validates that the referenced user exists before saving (prevents orphaned expenses)
- **Pre-save hook**: Normalizes data (trims title, rounds amount, validates date)
- **Post-save hook**: Logging for successful saves

---

## Validation Rules

- **User email**: Must be unique and valid format
- **Monthly budget**: Must be a positive number (> 0)
- **Expense amount**: Must be a positive number (> 0)
- **Expense category**: Must be one of the predefined categories
- **Expense userId**: Must reference an existing user

---

## Assumptions

1. **Current month summary**: The summary endpoint returns data for the current calendar month only
2. **Date handling**: Dates are stored in UTC; clients should handle timezone conversions
3. **Budget**: Monthly budget is a single value (not category-specific)
4. **Authentication**: No authentication implemented (out of scope for this assignment)
5. **Currency**: All amounts are assumed to be in a single currency (no currency conversion)

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run production build |

---

## License

ISC
