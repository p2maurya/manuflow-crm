# ManuFlow CRM

A full-stack CRM application for manufacturing businesses, built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- **JWT Authentication** — secure login with token-based sessions
- **Role-Based Access** — admin and employee roles
- **Lead Management** — full CRUD: create, read, update status, delete
- **Dashboard Stats** — live metrics from the database (not hardcoded)
- **Search & Filter** — filter leads by status or search by company/contact/email
- **Protected Routes** — unauthenticated users are redirected to login
- **Toast Notifications** — user-friendly success/error feedback

---

## Project Structure

```
manuflow-crm/
├── server/                  # Express + MongoDB backend
│   ├── config/db.js         # Mongoose connection
│   ├── controllers/
│   │   ├── authController.js
│   │   └── leadController.js
│   ├── middleware/
│   │   └── auth.js          # JWT protect + adminOnly guards
│   ├── models/
│   │   ├── User.js
│   │   └── Lead.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── leadRoutes.js
│   ├── index.js             # Entry point
│   ├── .env.example
│   └── package.json
│
└── client/                  # Vite + React frontend
    ├── src/
    │   ├── components/
    │   │   ├── Sidebar.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   └── Leads.jsx
    │   ├── services/
    │   │   └── api.js       # Axios instance with interceptors
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Environment Variables

### Server (`server/.env`)

Copy `server/.env.example` to `server/.env` and fill in your values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/manuflow-crm
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
CLIENT_URL=http://localhost:5173
```

| Variable     | Description                              |
|--------------|------------------------------------------|
| `PORT`       | Port the Express server listens on       |
| `MONGO_URI`  | MongoDB connection string                |
| `JWT_SECRET` | Secret key for signing JWT tokens        |
| `CLIENT_URL` | Origin allowed by CORS (frontend URL)    |

---

## Local Setup & Run

### Prerequisites

- Node.js ≥ 18
- MongoDB running locally **or** a MongoDB Atlas connection string

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd manuflow-crm
```

### 2. Set up the server

```bash
cd server
cp .env.example .env
# Edit .env with your MONGO_URI and JWT_SECRET
npm install
npm run dev
# Server starts on http://localhost:5000
```

### 3. Set up the client

```bash
cd ../client
npm install
npm run dev
# Client starts on http://localhost:5173
```

### 4. Create your first user

Use Postman or curl to register an admin account:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@company.com","password":"secret123","role":"admin"}'
```

Then log in at `http://localhost:5173`.

---

## API Endpoints

### Auth

| Method | Endpoint              | Auth required | Description        |
|--------|-----------------------|---------------|--------------------|
| POST   | `/api/auth/register`  | No            | Register new user  |
| POST   | `/api/auth/login`     | No            | Login, get token   |
| GET    | `/api/auth/me`        | Yes           | Get current user   |

### Leads

All lead endpoints require a valid JWT in the `Authorization: Bearer <token>` header.

| Method | Endpoint              | Description                       |
|--------|-----------------------|-----------------------------------|
| GET    | `/api/leads`          | List leads (search & status filter via query params) |
| GET    | `/api/leads/stats`    | Dashboard stats by status         |
| POST   | `/api/leads`          | Create a new lead                 |
| PUT    | `/api/leads/:id`      | Update any lead field(s)          |
| DELETE | `/api/leads/:id`      | Delete a lead                     |

---

## Bugs Fixed from Original Codebase

| # | File | Issue | Fix |
|---|------|-------|-----|
| 1 | `server/index.js` | `leadRoutes` was imported but **never mounted** — all `/api/leads` calls returned 404 | Added `app.use("/api/leads", leadRoutes)` |
| 2 | `server/models/Lead.js` | Model used `name`/`phone` fields but frontend sent `companyName`/`contactPerson` — data was silently dropped | Renamed model fields to match frontend form |
| 3 | `server/models/Lead.js` | Status enum was `["New","Contacted","Qualified","Converted","Lost"]` but frontend dropdown had `"Negotiation"` and `"Won"` — saving those values threw a Mongoose validation error | Aligned enum to `["New","Contacted","Negotiation","Won","Lost"]` |
| 4 | `client/src/App.jsx` | Imported `Login` from `./pages/Login` (capital L) but file was `login.jsx` (lowercase) — crashes on case-sensitive Linux filesystems | Renamed file to `Login.jsx` |
| 5 | `client/` root | Server-side files (`index.js`, `controllers/`, `routes/`) placed inside the React client folder | Removed misplaced server files from client directory |
| 6 | `client/src/pages/Dashboard.jsx` | Stats (120 leads, 45 clients, ₹85K) were hardcoded | Dashboard now fetches `/api/leads/stats` and displays live data |
| 7 | `server/middleware/` | Auth middleware (`protect`) was referenced in routes but the file didn't exist | Created `server/middleware/auth.js` with `protect` and `adminOnly` |
| 8 | `client/src/services/api.js` | Hardcoded `http://localhost:5000` base URL in every page | Centralized Axios instance with Vite proxy; all pages use `/api` paths |

---

## Tech Stack

- **Backend:** Node.js, Express 5, MongoDB, Mongoose, bcryptjs, jsonwebtoken
- **Frontend:** React 19, Vite, Tailwind CSS v4, React Router v7, Axios, react-hot-toast, lucide-react
