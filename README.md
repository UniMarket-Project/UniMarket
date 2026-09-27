# UniMarket

A verified campus marketplace connecting students, staff, and service providers within a university community.

## Overview

UniMarket is a web platform that gives a university community a single, trusted place to buy, sell, request, and exchange items and services. Members verify their identity before they can transact, real-time messaging keeps negotiations in one place, and a structured transaction flow — backed by ratings, reporting, and dispute resolution — replaces the informal, unreliable channels most campuses rely on today.

## The Problem

Commerce within a university community currently happens through scattered, informal channels:

- **Fragmented discovery.** Listings and requests are buried in group chats, bulletin boards, or social media posts, and disappear within minutes.
- **No identity verification.** There is no reliable way to confirm that the person on the other end of a deal is actually a student, staff member, or a legitimate service provider.
- **No structured transaction flow.** Deals are confirmed informally, with no record of what was agreed, no built-in payment option, and no way to leave feedback afterward.
- **No accountability.** There is no mechanism to report bad actors, escalate a dispute, or build a visible reputation over repeated transactions.

## The Solution

UniMarket addresses this by giving each university community its own dedicated marketplace, built around identity verification and structured transactions:

- **List** items or services for sale
- **Request** things needed, with automatic matching against existing listings
- **Message** in real time to negotiate details
- **Transact** through a clear confirmation flow, with payment via Chapa or manual offline payment tracking
- **Rate and review** counterparts after each transaction to build a visible reputation
- **Report and dispute** issues, with an admin workflow to review evidence and resolve conflicts

Every account is verified — student ID, staff, or provider — before a user can list, request, or transact, keeping the platform limited to accountable members of the community.

## Key Features

| Feature | Description |
|---|---|
| Verified Accounts | Identity verification for students, staff, and providers before any transaction is allowed |
| Listings | Create, browse, filter, and manage items or services for sale |
| Requests & Matching | Post a request and get automatically matched against relevant listings |
| Real-Time Messaging | Direct, real-time conversations tied to a specific transaction |
| Transactions | A structured flow from offer through confirmation |
| Payments | Online payment through Chapa, or manual offline payment recording |
| Ratings & Reviews | Post-transaction feedback that builds a trust score over time |
| Reports & Disputes | Abuse reporting and a formal dispute process with admin resolution and audit logging |
| Notifications | Real-time updates on messages, matches, and transaction status |

## Tech Stack

The stack is built entirely on free, open-source tools and free-tier hosted services, making it well suited for a demo or early-stage build with no infrastructure cost.

**Frontend**
- React with Vite
- Tailwind CSS with shadcn/ui
- React Router
- React Hook Form with Zod
- Zustand and React Query
- Axios
- Socket.io Client

**Backend**
- Node.js with Express
- Prisma ORM
- Redis
- Socket.io
- Bull job queue, backed by Redis
- JWT and bcryptjs
- Joi
- Winston and Morgan
- Helmet, CORS, and express-rate-limit

**Database & Storage**
- Supabase for managed PostgreSQL
- Supabase Storage for images, videos, and documents

**Integrations**
- Chapa in sandbox mode for payment processing
- Nodemailer over SMTP for email
- Firebase Cloud Messaging for push notifications
- Sentry for error tracking

**Infrastructure**
- Docker and Docker Compose for local development
- Vercel or Netlify for the frontend
- Render or Railway for the backend
- Supabase for database and file storage
- Upstash for hosted Redis

## Architecture

```
                          CLIENT LAYER
        React SPA (Vite) — Responsive Web Application
        Tailwind CSS + shadcn/ui, React Router,
        React Query, Socket.io Client
                            |
                    HTTPS / WebSocket
                            |
                        API LAYER
        Express.js — REST API + WebSocket Server
        JWT Authentication, Rate Limiting, CORS,
        Joi Validation, Centralized Error Handling
                            |
          -----------------------------------
          |                 |                 |
      Supabase          Redis Cache       Job Queue
    (PostgreSQL +     (Sessions,          (Bull, backed
     File Storage)     Real-time)          by Redis)
          |                                    |
          -----------------------------------
                            |
          -----------------------------------
          |                 |                 |
        Chapa           Nodemailer /       Firebase
      (Payments)          SMTP (Email)   (Push Notifications)
```

## Database Schema

Data is modeled with Prisma and hosted on Supabase PostgreSQL. The schema uses UUID primary keys, UTC timestamps, soft deletes for user-facing records, and a separate immutable audit log for admin actions.

| Table | Purpose |
|---|---|
| users | Core account record, one per verified identity |
| user_verification | Verification submissions and status |
| user_profiles | Extended profile information |
| listings | Items and services offered for sale |
| requests | Posted needs, matched against listings |
| transactions | Buyer and seller deal records |
| messages | Real-time chat, optionally tied to a transaction |
| ratings_reviews | Post-transaction reviews |
| reports | Reports against users, listings, or transactions |
| disputes | Formal dispute records |
| dispute_evidence | Evidence submitted for a dispute |
| payments | Payment status per transaction, including Chapa webhook data |
| user_blocks | Blocklist between users |
| notification_preferences | Per-user notification settings |
| audit_log | Immutable record of admin actions |

## API Overview

- **Base URL:** `/api/v1`
- **Authentication:** Bearer JWT, with a short-lived access token and a rotating refresh token
- **Format:** JSON, with a consistent success and error response envelope
- **Status Codes:** Standard REST conventions across 2xx, 4xx, and 5xx responses

**Endpoint groups**

| Group | Purpose |
|---|---|
| Auth | Registration, login, token refresh, logout |
| Verification | Student and provider identity verification, status checks |
| Listings | Create, browse, update, and remove listings |
| Requests | Create requests and retrieve matches |
| Transactions | Initiate and confirm transactions |
| Messages | Send messages, view conversations, block users |
| Ratings | Submit and view reviews |
| Reports & Disputes | File reports, open disputes, submit evidence |
| Payments | Initialize Chapa payments, handle webhooks, record offline payments |
| Notifications | Retrieve notifications, mark as read, manage preferences |
| Profile | View and update the current user's profile |

## Project Structure

**Frontend — `unimarket-client/`**

```
unimarket-client/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   ├── listings/
│   │   ├── messages/
│   │   ├── transactions/
│   │   ├── auth/
│   │   ├── notifications/
│   │   └── common/
│   ├── pages/
│   ├── hooks/
│   ├── store/
│   ├── api/
│   ├── styles/
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

**Backend — `unimarket-backend/`**

```
unimarket-backend/
├── src/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── services/
│   ├── jobs/
│   ├── sockets/
│   ├── validators/
│   ├── utils/
│   ├── config/
│   └── app.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── .env
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18 or later
- A Supabase project (PostgreSQL connection string and Storage bucket)
- A local or hosted Redis instance

### Frontend

```bash
npm create vite@latest unimarket-client -- --template react --variant=typescript
cd unimarket-client
npm install
npm install react-router-dom react-hook-form zod @hookform/resolvers
npm install zustand @tanstack/react-query axios socket.io-client
npm run dev
```

### Backend

```bash
mkdir unimarket-backend && cd unimarket-backend
npm init -y
npm install express helmet cors express-rate-limit morgan dotenv joi
npm install jsonwebtoken bcryptjs @prisma/client
npm install -D prisma
npm install redis socket.io bull nodemailer firebase-admin
npm install axios uuid winston @sentry/node

npx prisma init
# point DATABASE_URL in .env to your Supabase connection string
npx prisma migrate dev --name init

npm run dev
```

### Environment Variables

Key variables required in `.env`:

- `DATABASE_URL` — Supabase PostgreSQL connection string
- `SUPABASE_URL` and `SUPABASE_ANON_KEY` — for Storage access
- `JWT_SECRET` and `JWT_EXPIRE`
- `REDIS_URL`
- `CHAPA_SECRET_KEY` and `CHAPA_PUBLIC_KEY` (sandbox)
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`
- `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`
- `SENTRY_DSN`
- `FRONTEND_URL` and `CORS_ORIGIN`

