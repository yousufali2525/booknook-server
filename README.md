# BookNook – Backend Server

This is the standalone **Express JS + MongoDB + TypeScript** backend REST API for **BookNook – A Small Online Library**.

You can open this entire `/backend` folder directly in VS Code!

---

## 🚀 How to Run in VS Code

### 1. Open in VS Code
Open the `backend` folder directly in VS Code (`File -> Open Folder -> backend`).

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Backend Server
```bash
npm run dev
```
The server will start at `http://localhost:5000`.

---

## 📡 All 8 Required REST API Routes

### 1. Books API
- `GET /api/books` (or `/books`): Get all books (supports query params: `category`, `search`, `sort`, `limit`)
- `GET /api/books/:id` (or `/books/:id`): Get single book details by ID
- `POST /api/books` (or `/books`): Add a new book (Protected with JWT)
- `PATCH /api/books/:id` (or `/books/:id`): Update book information (Protected with JWT)
- `DELETE /api/books/:id` (or `/books/:id`): Delete book from catalog (Protected with JWT)

### 2. Borrows API
- `POST /api/borrows` (or `/borrows`): Borrow a book (Protected with JWT, decrements copies by 1 with `$inc`, checks double borrow)
- `GET /api/borrows` (or `/borrows`): Get active borrows of the logged in user (Protected with JWT)
- `DELETE /api/borrows/:id` (or `/borrows/:id`): Return a borrowed book (Protected with JWT, increments copies by 1 with `$inc`)

### 3. Auth & BetterAuth
- `POST /api/auth/register`: User registration with password policy (Uppercase, Lowercase, length >= 6)
- `POST /api/auth/login`: User login with bcrypt verification & JWT issuance
- `POST /api/auth/google`: Google OAuth sign-in
- `GET /api/auth/me`: Get current logged-in user profile

---

## 📂 Architecture

```
backend/
├── package.json         # Backend dependencies & dev scripts
├── tsconfig.json        # TypeScript configuration
├── .env.example         # Environment template
└── src/
    ├── index.ts         # Server entry point (starts on port 5000)
    ├── app.ts           # Express configuration & middlewares
    ├── auth/            # BetterAuth with MongoDB Adapter
    ├── controllers/     # bookController, borrowController, authController
    ├── routes/          # books.ts, borrows.ts, auth.ts
    ├── middleware/      # authMiddleware.ts (JWT Bearer verification)
    ├── models/          # types.ts (Book, Borrow, User models)
    └── db/              # MongoDB store with atomic $inc support & seedData
```
