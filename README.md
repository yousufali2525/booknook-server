# 📚 BookNook – Backend Server

## 📖 Project Overview

BookNook is a small online library backend built with Express.js and MongoDB. It provides RESTful APIs to manage books, borrowing records, and returning books.

The backend handles book CRUD operations, borrowing functionality, available copy management, and JWT-based authentication for protected API routes.

## 🛠️ Technology Stack

- Node.js
- Express.js
- MongoDB
- MongoDB Atlas
- JSON Web Token (JWT)
- JavaScript

## ✨ Main Features

- **Get All Books:** Retrieve all books from the database.
- **Get Single Book:** Retrieve book details using its ID.
- **Add Book:** Add new books to the library.
- **Update Book:** Update existing book information.
- **Delete Book:** Remove books from the database.
- **Borrow Book:** Save borrowing information in the database.
- **My Borrows:** Retrieve borrowing records for the logged-in user.
- **Return Book:** Return borrowed books and update available copies.
- **Available Copies:** Automatically decrease copies when borrowing and increase them when returning.
- **Duplicate Borrow Prevention:** Prevent users from borrowing the same book twice at the same time.
- **JWT Authentication:** Protect private API routes using token validation.
- **MongoDB Database:** Store book and borrowing information.

## 🌐 Live Backend API

**Base URL:**

https://booknook-server-34u5.onrender.com

**API Base Path:**

`https://booknook-server-34u5.onrender.com/api`

## 📡 API Endpoints

### Books API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/books` | Get all books |
| GET | `/api/books/:id` | Get a single book |
| POST | `/api/books` | Add a new book |
| PATCH | `/api/books/:id` | Update a book |
| DELETE | `/api/books/:id` | Delete a book |

### Borrow API

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/borrows` | Borrow a book |
| GET | `/api/borrows` | Get borrowed books of the logged-in user |
| DELETE | `/api/borrows/:id` | Return a borrowed book |

## 🗄️ Database Collections

The backend uses MongoDB Atlas.

Main collections:

- `books` – Stores book information.
- `borrows` – Stores borrowing records.

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yousufali2525/booknook-server.git
cd booknook-server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root.

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
DB_NAME=booknook
JWT_SECRET=your_jwt_secret
```
Use your own MongoDB connection string and JWT secret. Add any other environment variables required by your server configuration.

### 4. Run the Server

```bash
npm run dev
```

The server will run at:

`http://localhost:5000`

## 🔐 Authentication & Security

- JWT token validation for protected API routes.
- Authenticated users can access protected borrowing APIs.
- User-specific borrowing records.
- Environment variables are used to keep sensitive credentials private.

## 🚀 Deployment

- **Backend Hosting:** Render
- **Database:** MongoDB Atlas

**Live Server:** https://booknook-server-34u5.onrender.com

## 👨‍💻 Developer

**GitHub:** https://github.com/yousufali2525  
**Project:** BookNook – A Small Online Library

---

© 2026 BookNook Library. All rights reserved.