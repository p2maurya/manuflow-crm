# ManuFlow CRM

A full-stack CRM system built for the Business Development Associate (BDA) team of a manufacturing company. Built with the MERN stack.

live link : https://manuflow-crm.vercel.app

## Features

### Lead Pipeline
- Create, view, edit, and delete leads
- Status tracking: New → Contacted → Negotiation → Won / Lost
- Priority levels (Low, Medium, High)
- Deal value tracking in INR
- Lead source tracking (cold-call, referral, website, exhibition, LinkedIn)
- Search by company, contact person, product
- Filter by status

### Client Communication Workflow
- Per-lead communication log
- Log calls, emails, meetings, and notes
- Timestamped entries with author name
- Next follow-up date scheduling with overdue alerts

### Sales Tracking
- Live pipeline value
- Won deal value
- Per-status deal value breakdown
- Indian rupee formatting (K/L/Cr)

### Team Performance (Admin only)
- View all BDA team members
- Per-member: total leads, won, lost, conversion rate, pipeline value, won value
- Add new team members with monthly targets
- Activate/deactivate team members

### Role-Based Access
- **Admin**: sees all leads, team performance, can delete leads, assign leads to any BDA
- **BDA**: sees only their own assigned leads and pipeline

---

## Project Structure

```
manuflow-crm/
├── server/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── leadController.js
│   ├── middleware/auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── Lead.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── leadRoutes.js
│   ├── index.js
│   └── package.json
│
└── client/
    ├── src/
    │   ├── context/AuthContext.jsx
    │   ├── services/api.js
    │   ├── components/Sidebar.jsx
    │   └── pages/
    │       ├── Login.jsx
    │       ├── Dashboard.jsx
    │       ├── Leads.jsx
    │       ├── LeadDetail.jsx
    │       └── Team.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally

### 1. Clone & setup server

```bash
cd server
copy .env.example .env
npm install
npm run dev
```

**`server/.env`** contents:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/manuflow-crm
JWT_SECRET=manuflow_secret_key_2024
CLIENT_URL=http://localhost:5173
```

### 2. Setup client

```bash
cd client
npm install
npm run dev
```

Client runs at **http://localhost:5173**

### 3. Create your first admin account

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -ContentType "application/json" -Body '{"name":"Admin","email":"admin@manuflow.com","password":"admin123","role":"admin"}'
```

Login with `admin@manuflow.com` / `admin123`

---

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register user |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/auth/team` | Admin | Get all team members |
| PUT | `/api/auth/team/:id` | Admin | Update team member |

### Leads
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/leads/stats` | Yes | Dashboard stats |
| GET | `/api/leads/team-performance` | Admin | Per-BDA metrics |
| GET | `/api/leads` | Yes | List leads (with filters) |
| GET | `/api/leads/:id` | Yes | Single lead with comms |
| POST | `/api/leads` | Yes | Create lead |
| PUT | `/api/leads/:id` | Yes | Update lead |
| DELETE | `/api/leads/:id` | Admin | Delete lead |
| POST | `/api/leads/:id/communicate` | Yes | Add communication log |

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Tailwind CSS v3 |
| Routing | React Router v6 |
| HTTP | Axios |
| Backend | Node.js, Express 4 |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| UI Icons | Lucide React |
| Notifications | React Hot Toast |
