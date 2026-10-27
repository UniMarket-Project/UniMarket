# UniMarket

A verified campus marketplace connecting students, staff, and service providers within a university community.

---

## 👥 Project Team & Contributors

### Backend Engineering
- **Bekam Dawit Mulugeta** — `CTC-6256-26`
- **Samuel Belihu Lencho** — `CTC-4166-26`
- **Daniel Worku Gemehu** — `CTC-1453-26`

### Frontend Engineering
- **Desalegn Teresa Tadele** — `CTC-2097`
- **Nafyad Aman Guye** — `CTC-1402-26`
- **Naol Kefeni Midekesa** — `CTC-1389-26`

---

## 📌 Overview

**UniMarket** is a trusted web platform designed to give university communities a single, verified place to buy, sell, rent, lend, exchange, and request items and services. Tailored specifically for campus environments (with Addis Ababa University as the initial launch baseline), UniMarket solves the friction and risks of informal campus commerce.

Before any transaction can occur, members verify their university identity (student ID, staff affiliation, or authorized provider credentials). Clear two-sided confirmations, near-real-time communication, ratings, reports, and administrative moderation replace informal Telegram groups, bulletin boards, and unverified social media channels.

### Core Loop (MVP)
$$\text{Sign Up} \longrightarrow \text{Get Verified} \longrightarrow \text{List or Request} \longrightarrow \text{Discover} \longrightarrow \text{Message} \longrightarrow \text{Confirm Deal (Both Sides)} \longrightarrow \text{Rate \& Review}$$

---

## 🚨 The Problem

Commerce within university campuses currently relies on fragmented, informal channels:

- **Fragmented Discovery:** Listings and student requests are buried in crowded group chats and physical boards, disappearing within minutes.
- **No Identity Verification:** No reliable way to confirm that a buyer or seller is genuinely an active student, staff member, or vetted provider.
- **Unstructured Transactions:** Deals are negotiated casually with zero paper trail, no clear terms, and no escrow or verified receipt.
- **Zero Accountability:** No built-in reputation score, no formal reporting for bad actors or scams, and no dispute trail.

---

## 💡 The Solution

UniMarket provides each university campus with a dedicated, verified ecosystem:

1. **Identity Verification:** Students and providers submit campus/national credentials. Only verified accounts can publish listings, post requests, or initiate deals.
2. **8 Listing Types:** Sell, Rent, Lend, Exchange, Service, Food, and Transport.
3. **Student Demand Board (Requests):** Students post needs (`have` / `want` for swaps; budget min/max) and sellers or peers can respond with one-click chat.
4. **Context-Aware Messaging:** Direct in-app messaging tied directly to specific listings or transactions.
5. **Two-Sided Deal Confirmation:** State machine transitions from `pending` $\rightarrow$ `in_progress` $\rightarrow$ `completed` only when both buyer and seller confirm handover.
6. **Recorded Offline Payments:** In-person cash or bank transfer tracking with explicit non-escrow safety warnings.
7. **Reputation & Trust:** Post-transaction 1–5 star reviews and aggregate ratings visible on public profiles.
8. **Community Moderation:** Reporting with an auto-hide threshold (3 reports automatically hide a listing) and an admin dashboard to warn or suspend users.

---

## 🎯 MVP Scope vs. Phase 2 Roadmap

In accordance with the **MVP Product Requirements Document (PRD v1.1)**, the project enforces a clear boundary between the MVP showcase and Phase 2 features:

| Feature Area | MVP Scope (Phase 1) | Phase 2 Backlog |
|---|---|---|
| **Authentication** | Email + phone + password, custom JWT (in-memory access token, HttpOnly rotating refresh cookie) | University SSO / OAuth |
| **Verification** | Student ID / Provider license submit, AES-256-GCM encryption, admin queue approval | Automated student ID OCR / registrar API sync |
| **Listings** | 8 listing types, up to 5 images, category & price filters, status toggles | Map/radius search, favorites/saved searches |
| **Requests** | Post and browse demand board, "I can help" message trigger | Automated matching algorithm & push alerts |
| **Messaging** | In-app polling (5–10s interval), thread views, unread counters | WebSockets (Socket.io) real-time streaming |
| **Transactions** | Two-sided confirmation state machine, inventory reservation | Formal disputes tribunal & evidence review |
| **Payments** | Offline payment recording (`cash`, `transfer`, `other`) | Chapa online payment gateway & escrow service |
| **Ratings** | 1–5 stars + review comment between verified deal participants | Detailed category sub-ratings |
| **Moderation** | Report system, 3-report auto-hide, user warning/suspension, audit log | User-to-user blocking, public audit UI |
| **Notifications** | In-app bell with unread count (polled every 30s) | Push notifications (Firebase/APNs), SMS alerts |
| **Architecture** | Monorepo modular monolith, PostgreSQL, `node-cron`, in-memory rate limiting | Redis caching, BullMQ background queues |

---

## 🛠️ Tech Stack

Built on **(React SPA + Express Modular Monolith)** as outlined in the Technical Specification and PRD:

### Frontend (`apps/web`)
- **Core:** React 18, Vite, TypeScript, React Router v7
- **Styling & UI:** Tailwind CSS, Lucide React icons, Class Variance Authority
- **State Management & Data Fetching:** TanStack React Query (server state), Zustand (session & UI state)
- **Forms & Validation:** React Hook Form with Zod schemas shared directly from `@unimarket/shared`
- **Networking:** Axios with interceptors for silent token refresh via HttpOnly cookies
- **Media Optimization:** Client-side image compression (`browser-image-compression`, max 5 MB per image)
- **Localization:** Bilingual architecture with i18n support (English default, Amharic localization keys)

### Backend (`apps/api`)
- **Runtime & Framework:** Node.js (>= 20.x / 22.x LTS), Express 4, TypeScript
- **Database & ORM:** PostgreSQL with Prisma ORM
- **Validation:** Zod (single source of truth shared between client and server)
- **Security & Cryptography:**
  - Short-lived JWT access tokens (1 hour, stored in memory on the client)
  - Rotating refresh tokens (30 days, stored in HttpOnly cookies, SHA-256 hashed in database)
  - Sensitive data protection: AES-256-GCM encryption and HMAC-SHA256 hashing for student ID numbers
  - Helmet security headers, CORS allowlist, and `express-rate-limit`
- **Logging:** Structured JSON logging via Pino and Pino-HTTP
- **Jobs & Scheduling:** In-process scheduled tasks using `node-cron` (auto-expiring stale deals, lifting temporary suspensions)
- **File Storage:** S3-compatible presigned URL uploads (AWS S3 / Cloudflare R2 / MinIO) with local disk fallback

### Monorepo & Shared Packages
- **`packages/shared`:** Shared Zod schemas, TypeScript DTOs, enums, error codes, and campus constants
- **`packages/tsconfig`:** Shared TypeScript configuration presets (`base.json`, `node.json`, `react.json`)

---

## 🏗️ System Architecture

```
                                  CLIENT LAYER
                     React 18 SPA (Vite) — Responsive Web App
               Tailwind CSS, TanStack Query, Zustand, Axios Client
                                       │
                              HTTPS REST & Polling
                                       │
                                   API LAYER
                       Express.js — Modular Monolith
             JWT Auth, Access Guards, Rate Limiting, Pino Logger,
                   In-Process Event Bus, node-cron Scheduler
                                       │
                   ┌───────────────────┴───────────────────┐
                   │                                       │
              PERSISTENCE                             MEDIA STORAGE
         PostgreSQL + Prisma ORM               S3-Compatible / Cloudflare R2
   (14 Models: Users, Deals, Moderation)        / Local Storage Fallback
```

### Module Boundaries
```
apps/api/src/
├── platform/               # Shared cross-cutting concerns (config, db, security, logger, errors)
└── modules/
    ├── auth/               # Register, login, refresh tokens, logout
    ├── verification/       # Student & provider identity verification
    ├── users/              # Profiles, statistics, and settings
    ├── listings/           # CRUD, search, filter, and inventory
    ├── requests/           # Student demand board
    ├── messages/           # Private 1-to-1 polling chat
    ├── transactions/       # Deal state machine and two-sided confirmations
    ├── payments/           # In-person payment recording
    ├── ratings/            # Trust scores and reviews
    ├── reports/            # Community reports and auto-hide logic
    ├── notifications/      # In-app notification center
    ├── uploads/            # Presigned URL generator and media upload handler
    └── admin/              # Moderation queues, suspensions, and platform stats
```

---

## 🗄️ Database Schema (MVP Models)

Data is modeled using **Prisma ORM** targeting **PostgreSQL**. All primary keys are UUIDs, timestamps are stored in UTC, and sensitive PII is encrypted:

| Model / Table | Purpose & Notes |
|---|---|
| `users` | Core user identity, role (`user`, `admin`), verification status, warning count, suspension timestamps |
| `user_profiles` | Extended profile, avatar, bio, average rating, deal counts |
| `user_verification` | Encrypted student/provider verification records and document references |
| `profile_change_requests` | Audit queue for requesting changes to verified profile data |
| `refresh_tokens` | SHA-256 hashed rotating refresh tokens (replaces external session caches) |
| `listings` | Items, rentals, and services (8 listing types, status: `active`, `hidden`, `removed`) |
| `requests` | Student demand board postings (`product`, `service`, `exchange`) |
| `messages` | Chat messages between users, linked to listings or transactions |
| `transactions` | Two-sided deal lifecycle (`pending` $\rightarrow$ `in_progress` $\rightarrow$ `completed` / `cancelled`) |
| `payments` | Recorded offline payment details (`cash`, `transfer`, `other`; `status: recorded`) |
| `ratings_reviews` | 1–5 star reviews with composite unique constraint `[transaction_id, reviewer_id]` |
| `reports` | Community abuse reports with auto-hide trigger at 3 reports |
| `notifications` | In-app user notifications for messages, deals, ratings, and warnings |
| `audit_log` | Append-only immutable log recording administrative actions |

> [!NOTE]
> Tables for `disputes`, `dispute_evidence`, `user_blocks`, and `notification_preferences` are deferred to Phase 2.

---

## 🔌 API Overview

- **Base URL:** `/api/v1`
- **Authentication:** Bearer JWT in `Authorization` header; refresh token transmitted via HttpOnly cookie
- **Response Format:** Standardized JSON envelopes

```json
// Success Response Envelope
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-10-27T18:30:00.000Z",
    "requestId": "req_c9a1b2..."
  }
}

// Error Response Envelope
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [{ "field": "email", "code": "INVALID_EMAIL", "message": "Invalid email format" }]
  },
  "meta": {
    "timestamp": "2026-10-27T18:30:00.000Z",
    "requestId": "req_c9a1b2..."
  }
}
```

### Core Endpoints

| Group | Method & Path | Description | Access |
|---|---|---|---|
| **Auth** | `POST /auth/register` | Register student, staff, or provider | Public |
| | `POST /auth/login` | Login and receive access token + refresh cookie | Public |
| | `POST /auth/refresh` | Rotate refresh token and get new access token | Public (Cookie) |
| | `POST /auth/logout` | Revoke active refresh session | Authenticated |
| **Verification** | `POST /verification/student/submit` | Submit student ID for verification | Authenticated |
| | `POST /verification/provider/submit` | Submit provider/business verification | Authenticated |
| | `GET /verification/status` | Check current user's verification progress | Authenticated |
| **Listings** | `GET /listings` | Search and filter listings | Public |
| | `POST /listings` | Create a new listing | Verified only |
| | `GET /listings/:id` | View listing details and seller info | Public |
| | `PATCH /listings/:id` | Update own listing | Owner only |
| | `DELETE /listings/:id` | Soft-delete own listing | Owner only |
| **Requests** | `GET /requests` | Browse student demands board | Public |
| | `POST /requests` | Post a need or exchange request | Verified only |
| | `GET /requests/:id` | View request details and related listings | Public |
| | `PATCH /requests/:id` | Update or close request | Owner only |
| **Messages** | `GET /messages/conversations` | List conversation threads with unread counts | Authenticated |
| | `GET /messages/conversations/:userId` | Get chronological chat history with a user | Authenticated |
| | `POST /messages` | Send a private message (linked to item/deal) | Authenticated |
| **Transactions** | `POST /transactions` | Initiate a deal from a listing or request | Verified only |
| | `GET /transactions` | View my active and historical deals | Authenticated |
| | `GET /transactions/:id` | View specific deal details | Deal participant |
| | `POST /transactions/:id/accept` | Accept pending deal and reserve inventory | Seller only |
| | `POST /transactions/:id/decline` | Decline deal offer | Seller only |
| | `POST /transactions/:id/cancel` | Cancel active deal before completion | Deal participant |
| | `POST /transactions/:id/confirm` | Confirm handover (requires both sides) | Deal participant |
| **Payments** | `POST /payments/record-offline` | Record offline cash or transfer payment | Deal participant |
| **Ratings** | `POST /ratings` | Submit 1–5 star review after deal completion | Deal participant |
| | `GET /users/:id/ratings` | View public reviews for a user | Public |
| **Reports** | `POST /reports` | Report a listing, user, or transaction | Authenticated |
| **Notifications**| `GET /notifications` | List user notifications | Authenticated |
| | `PATCH /notifications/:id/read` | Mark notification as read | Recipient only |
| | `POST /notifications/read-all` | Mark all notifications as read | Recipient only |
| **Profile** | `GET /me` | Fetch private profile of current user | Authenticated |
| | `PATCH /me` | Update bio, avatar, and contact preferences | Authenticated |
| | `GET /users/:id` | Fetch sanitized public profile | Public |
| **Uploads** | `POST /uploads/presign` | Generate direct S3/R2 presigned upload URL | Authenticated |
| **Admin** | `GET /admin/stats` | Platform metrics (users, listings, reports) | Admin only |
| | `GET /admin/verifications` | Verification review queue | Admin only |
| | `PATCH /admin/verifications/:id`| Approve or reject verification submission | Admin only |
| | `GET /admin/reports` | Community abuse report queue | Admin only |
| | `PATCH /admin/reports/:id` | Resolve report, warn user, or remove listing | Admin only |
| | `POST /admin/users/:id/suspend` | Temporarily suspend or ban user account | Admin only |
| | `POST /admin/users/:id/unsuspend` | Lift suspension on user account | Admin only |

---

## 📁 Project & Folder Structure

UniMarket follows a **Domain-Based Modular Monolith** architecture on the backend, a **Feature-Sliced** architecture on the frontend, and an isolated **Shared Contracts** package in an npm-managed monorepo.

### Architectural Rules & Patterns

1. **Modular Monolith (`apps/api`):**
   - Organized by business domain (`modules/`), not technical layers.
   - Strict internal layering: `routes → controller → service → repository → Prisma`.
   - Controllers handle only HTTP requests/responses and validation.
   - Services contain pure business logic and emit domain events.
   - Repositories encapsulate all Prisma queries; Prisma is never called directly from controllers or services.
   - Cross-domain interactions occur via public module facades (`index.ts`) or the in-process `EventBus` (`apps/api/src/platform/events/event-bus.ts`).

2. **Feature-Sliced SPA (`apps/web`):**
   - Each feature in `features/` maps 1:1 to a backend domain (`auth`, `verification`, `listings`, `requests`, `chat`, `deals`, `profile`, `ratings`, `admin`, `landing`).
   - Domain-agnostic UI primitives, layout wrappers, and API clients live in `shared/`.
   - Client routes lazily load feature pages.

3. **Single Source of Truth (`packages/shared`):**
   - Both `apps/api` and `apps/web` import Zod schemas, TypeScript DTOs, enums, error codes, and limits from `@unimarket/shared`.
   - Neither the API nor the Web client can drift from the API contract.

---

### Detailed Directory Tree

```
unimarket/
├── apps/
│   ├── api/                                      # Express.js Modular Monolith Backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma                     # 14 active MVP database models
│   │   │   ├── migrations/                       # Deterministic SQL migrations
│   │   │   └── seed/                             # Campus seed runner & Ethiopian demo data
│   │   │       └── index.ts
│   │   ├── src/
│   │   │   ├── main.ts                           # Server entrypoint (loads env, starts Express)
│   │   │   ├── app.ts                            # Express application setup & middleware pipeline
│   │   │   ├── routes.ts                         # Root router mounting /api/v1 domain routes
│   │   │   ├── types/
│   │   │   │   └── express.d.ts                  # Typed request extensions (req.user, req.requestId)
│   │   │   │
│   │   │   ├── platform/                         # Shared infrastructure & cross-cutting platform concerns
│   │   │   │   ├── config/                       # Zod-validated configuration & environment loader
│   │   │   │   │   ├── env.ts                    # Strict env schema (fails fast on startup)
│   │   │   │   │   └── index.ts                  # Typed config singleton (db, jwt, storage, cors)
│   │   │   │   ├── database/                     # Database access layer
│   │   │   │   │   ├── prisma.client.ts          # Singleton Prisma client instance
│   │   │   │   │   └── db-url-sanitizer.ts       # Strips credentials before logging connection strings
│   │   │   │   ├── errors/                       # Standard error hierarchy
│   │   │   │   │   ├── app-error.ts              # Base AppError class (status, code, details)
│   │   │   │   │   ├── http-errors.ts            # BadRequest, Unauthorized, Forbidden, NotFound, Conflict
│   │   │   │   │   └── prisma-error-mapper.ts    # Translates Prisma P2002/P2025 errors to HTTP codes
│   │   │   │   ├── events/                       # In-process asynchronous event bus
│   │   │   │   │   ├── event-bus.ts              # Typed EventEmitter wrapper
│   │   │   │   │   └── event-types.ts            # Strongly typed domain event payloads
│   │   │   │   ├── http/                         # HTTP helpers & middleware utilities
│   │   │   │   │   ├── async-handler.ts          # Wraps controllers to automatically catch & forward errors
│   │   │   │   │   └── response.ts               # Standardized success/error response builders
│   │   │   │   ├── jobs/                         # In-process scheduled jobs (node-cron)
│   │   │   │   │   └── scheduler.ts              # Cron jobs: stale deal expiry, suspension lift
│   │   │   │   ├── logger/                       # High-performance structured logging
│   │   │   │   │   ├── logger.ts                 # Pino logger instance
│   │   │   │   │   └── redact.ts                 # PII redaction (passwords, tokens, ID numbers)
│   │   │   │   ├── middleware/                   # Express middleware stack
│   │   │   │   │   ├── authenticate.middleware.ts    # JWT verification -> populates req.user
│   │   │   │   │   ├── optional-auth.middleware.ts   # Attaches user if token present (for public feeds)
│   │   │   │   │   ├── require-role.middleware.ts    # Role-based access control ('admin' guard)
│   │   │   │   │   ├── require-verified.middleware.ts# Enforces verified student/staff status
│   │   │   │   │   ├── rate-limit.middleware.ts      # In-memory IP/route rate limiters
│   │   │   │   │   ├── validate.middleware.ts        # Zod request validator ({ body, query, params })
│   │   │   │   │   ├── security.middleware.ts        # Helmet security headers & CORS policy
│   │   │   │   │   ├── request-id.middleware.ts      # Assigns/propagates X-Request-ID
│   │   │   │   │   ├── error-handler.middleware.ts   # Central error handling to standard envelope
│   │   │   │   │   └── not-found.middleware.ts       # 404 handler for undefined endpoints
│   │   │   │   ├── security/                     # Encryption, hashing & authentication tokens
│   │   │   │   │   ├── jwt.ts                    # Signs & verifies short-lived access tokens
│   │   │   │   │   ├── token-hash.ts             # SHA-256 hashing for refresh token rotation
│   │   │   │   │   ├── password.ts               # bcrypt hashing and validation
│   │   │   │   │   └── crypto.ts                 # AES-256-GCM encryption & HMAC-SHA256 for student IDs
│   │   │   │   └── storage/                      # Media storage providers
│   │   │   │       ├── storage.interface.ts      # StorageProvider contract (presign, delete)
│   │   │   │       ├── r2.storage.ts             # Cloudflare R2 / AWS S3 presigned URL driver
│   │   │   │       ├── local.storage.ts          # Local disk fallback for development
│   │   │   │       └── index.ts                  # Provider factory based on STORAGE_PROVIDER
│   │   │   │
│   │   │   └── modules/                          # Business Domain Modules
│   │   │       ├── auth/                         # Authentication & session rotation
│   │   │       │   ├── auth.controller.ts
│   │   │       │   ├── auth.routes.ts
│   │   │       │   ├── auth.service.ts
│   │   │       │   ├── auth.repository.ts        # Refresh token persistence & revocation
│   │   │       │   └── index.ts
│   │   │       ├── verification/                 # Campus identity verification
│   │   │       │   ├── verification.controller.ts
│   │   │       │   ├── verification.routes.ts
│   │   │       │   └── verification.service.ts   # Student ID / provider credentials review
│   │   │       ├── users/                        # Profiles & public identity
│   │   │       │   ├── users.controller.ts
│   │   │       │   ├── users.routes.ts
│   │   │       │   ├── users.service.ts
│   │   │       │   └── users.repository.ts
│   │   │       ├── listings/                     # Marketplace items & services
│   │   │       │   ├── listings.controller.ts
│   │   │       │   ├── listings.routes.ts
│   │   │       │   ├── listings.service.ts
│   │   │       │   ├── listings.repository.ts
│   │   │       │   └── listings.search.ts        # Category, keyword, price range & sort query builder
│   │   │       ├── requests/                     # Student demand board
│   │   │       │   ├── requests.controller.ts
│   │   │       │   ├── requests.routes.ts
│   │   │       │   └── requests.service.ts       # "I can help" matching trigger
│   │   │       ├── messages/                     # Near-real-time polling chat
│   │   │       │   ├── messages.controller.ts
│   │   │       │   ├── messages.routes.ts
│   │   │       │   └── messages.service.ts       # Thread retrieval with cursor pagination
│   │   │       ├── transactions/                 # Two-sided deals state machine
│   │   │       │   ├── transactions.controller.ts
│   │   │       │   ├── transactions.routes.ts
│   │   │       │   └── transactions.service.ts   # Accept, decline, cancel & dual confirmation
│   │   │       ├── payments/                     # Offline cash/transfer payment records
│   │   │       │   ├── payments.controller.ts
│   │   │       │   ├── payments.routes.ts
│   │   │       │   └── payments.service.ts       # Recorded payment audit trail (non-escrow)
│   │   │       ├── ratings/                      # Post-deal feedback & reviews
│   │   │       │   ├── ratings.controller.ts
│   │   │       │   ├── ratings.routes.ts
│   │   │       │   └── ratings.service.ts        # Atomic recalculation of average ratings
│   │   │       ├── reports/                      # Content moderation & auto-hide
│   │   │       │   ├── reports.controller.ts
│   │   │       │   ├── reports.routes.ts
│   │   │       │   └── reports.service.ts        # 3-report auto-hide threshold trigger
│   │   │       ├── notifications/                # In-app notification center
│   │   │       │   ├── notifications.controller.ts
│   │   │       │   ├── notifications.routes.ts
│   │   │       │   ├── notifications.service.ts
│   │   │       │   └── notifications.subscribers.ts # EventBus subscribers dispatching alerts
│   │   │       ├── uploads/                      # Direct media upload URLs
│   │   │       │   ├── uploads.controller.ts
│   │   │       │   ├── uploads.routes.ts
│   │   │       │   └── uploads.service.ts        # S3/R2 presigned upload authorization
│   │   │       ├── admin/                        # Back-office moderation console
│   │   │       │   ├── admin.controller.ts
│   │   │       │   ├── admin.routes.ts
│   │   │       │   └── admin.service.ts          # Verification queue, reports, suspension & stats
│   │   │       ├── audit/                        # Append-only compliance log
│   │   │       │   └── audit.service.ts          # Immutable administrative audit logging
│   │   │       └── health/                       # Liveness & readiness probes
│   │   │           ├── health.controller.ts
│   │   │           └── health.routes.ts
│   │   ├── tests/
│   │   │   ├── unit/                             # Isolated service & controller unit tests
│   │   │   ├── e2e/                              # End-to-end API integration tests (supertest)
│   │   │   ├── factories/                        # Mock data builders (users, listings, deals)
│   │   │   └── setup/                            # Test database setup & migration fixtures
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── web/                                      # React 18 SPA Frontend (Vite)
│       ├── public/
│       │   └── locales/                          # Lazy-loaded i18n dictionaries
│       │       ├── en/landing.json               # English copy
│       │       └── am/landing.json               # Amharic localization copy
│       ├── src/
│       │   ├── main.tsx                          # App mount point & global providers
│       │   ├── App.tsx                           # Layout routing with React Router v7
│       │   ├── vite-env.d.ts
│       │   ├── styles/
│       │   │   └── globals.css                   # Tailwind CSS layers & color design tokens
│       │   │
│       │   ├── features/                         # Feature-Sliced Business Domains
│       │   │   ├── auth/                         # Authentication & credentials
│       │   │   │   ├── LoginPage.tsx             # Campus login screen
│       │   │   │   ├── RegisterPage.tsx          # Multi-step registration with AAU selector
│       │   │   │   └── auth.store.ts             # Zustand store for user session & in-memory token
│       │   │   ├── verification/                 # Verification status & submission
│       │   │   │   └── VerificationPage.tsx      # Student ID upload & approval status card
│       │   │   ├── listings/                     # Marketplace browsing & management
│       │   │   │   ├── ListingsFeedPage.tsx      # Main feed with category tabs & debounced search
│       │   │   │   ├── ListingDetailPage.tsx     # Full item details, seller badge & action bar
│       │   │   │   ├── ListingCard.tsx           # Feed card component
│       │   │   │   ├── ListingFilters.tsx        # Type, price, and category filter bar
│       │   │   │   ├── CreateListingPage.tsx     # 8-type creation wizard with photo uploader
│       │   │   │   ├── EditListingModal.tsx      # In-place listing update modal
│       │   │   │   └── MyListingsPage.tsx        # "My Items" inventory management
│       │   │   ├── requests/                     # Student demand board
│       │   │   │   ├── RequestsFeedPage.tsx      # Open requests & swap demands
│       │   │   │   └── CreateRequestPage.tsx     # Post needed item/service with budget
│       │   │   ├── chat/                         # Direct messaging
│       │   │   │   └── MessagesPage.tsx          # Polling conversation list & message thread view
│       │   │   ├── deals/                        # Transactions & handover
│       │   │   │   └── DealsPage.tsx             # Two-sided deal inspector & confirmation buttons
│       │   │   ├── profile/                      # User profile & public identity
│       │   │   │   └── ProfilePage.tsx           # Public ratings, stats, active listings & bio
│       │   │   ├── ratings/                      # Feedback & reviews
│       │   │   │   ├── StarRating.tsx            # 1-5 star interactive rating component
│       │   │   │   ├── RatingModal.tsx           # Post-completion review submission dialog
│       │   │   │   ├── ReviewList.tsx            # Chronological review list on profile
│       │   │   │   └── RatingDistribution.tsx    # Star count breakdown visualization
│       │   │   ├── admin/                        # Back-office administration
│       │   │   │   └── AdminDashboardPage.tsx    # Verifications queue, report resolution & suspensions
│       │   │   └── landing/                      # Marketing & Public Discovery
│       │   │       ├── pages/LandingPage.tsx     # Campus marketing landing page
│       │   │       └── components/               # Hero, WaysToTrade, CategoryShowcase, TrustSection
│       │   │
│       │   └── shared/                           # Reusable UI Primitives & Utilities
│       │       ├── api/
│       │       │   └── api-client.ts             # Axios client with auto-refresh cookie interceptors
│       │       ├── components/
│       │       │   ├── layout/                   # Structural page shells
│       │       │   │   ├── AppLayout.tsx         # Authenticated shell (TopNav, BottomNav, Main container)
│       │       │   │   ├── PublicLayout.tsx      # Unauthenticated header & footer wrapper
│       │       │   │   ├── Navbar.tsx            # Header with search, nav links & unread badge
│       │       │   │   └── BottomNav.tsx         # Mobile-first sticky bottom navigation
│       │       │   ├── ui/                       # Design system primitives
│       │       │   │   ├── Button.tsx
│       │       │   │   ├── Card.tsx
│       │       │   │   ├── Input.tsx
│       │       │   │   ├── Badge.tsx
│       │       │   │   ├── Avatar.tsx
│       │       │   │   ├── Modal.tsx
│       │       │   │   ├── Sheet.tsx
│       │       │   │   ├── Accordion.tsx
│       │       │   │   └── ImageUpload.tsx       # Client-side image compression & preview
│       │       │   ├── LanguageSwitcher.tsx      # English / Amharic locale toggle
│       │       │   └── SEO.tsx                   # OpenGraph & title metadata injector
│       │       ├── hooks/
│       │       │   └── useNavBadges.ts           # Periodic poller for unread messages & pending deals
│       │       ├── i18n/
│       │       │   └── index.ts                  # react-i18next configuration
│       │       └── utils/
│       │           ├── cn.ts                     # clsx + tailwind-merge helper
│       │           ├── media.ts                  # Media URL resolver & fallback placeholders
│       │           └── errors.ts                 # API error message extractor
│       ├── nginx/
│       │   ├── nginx.conf                        # Production Nginx reverse proxy configuration
│       │   └── default.conf                      # SPA client routing fallback (try_files /index.html)
│       ├── vite.config.ts
│       ├── tailwind.config.ts
│       ├── Dockerfile
│       └── package.json
│
├── packages/
│   ├── shared/                                   # Shared Contracts (Single Source of Truth)
│   │   ├── src/
│   │   │   ├── enums/                            # Domain Enums (State Machines & Roles)
│   │   │   │   ├── user.enums.ts                 # UserType, Role, VerificationStatus, AvailabilityStatus
│   │   │   │   ├── listing.enums.ts              # ListingType (8 types), ListingStatus (active, hidden, removed)
│   │   │   │   ├── request.enums.ts              # RequestType, RequestStatus (open, matched, closed)
│   │   │   │   ├── transaction.enums.ts          # TransactionStatus, PaymentMethod, PaymentStatus
│   │   │   │   ├── report.enums.ts               # ReportType, ReportCategory, ReportStatus
│   │   │   │   ├── notification.enums.ts         # NotificationType
│   │   │   │   └── index.ts
│   │   │   ├── schemas/                          # Shared Zod Validation Schemas
│   │   │   │   ├── auth.schemas.ts               # Login & registration validation
│   │   │   │   ├── verification.schemas.ts       # Student & provider submission schemas
│   │   │   │   ├── users.schemas.ts              # Profile update schemas
│   │   │   │   ├── listings.schemas.ts           # Listing CRUD & metadata validation
│   │   │   │   ├── requests.schemas.ts           # Demand board validation
│   │   │   │   ├── messages.schemas.ts           # Chat payload validation
│   │   │   │   ├── transactions.schemas.ts       # Deal creation & state transition schemas
│   │   │   │   ├── payments.schemas.ts           # Offline payment recording schema
│   │   │   │   ├── ratings.schemas.ts            # 1-5 star review submission schema
│   │   │   │   ├── reports.schemas.ts            # Community report schema
│   │   │   │   ├── notifications.schemas.ts      # Notification query & update schemas
│   │   │   │   ├── uploads.schemas.ts            # Presigned URL request schema
│   │   │   │   ├── admin.schemas.ts              # Admin moderation & user suspension schemas
│   │   │   │   ├── common.schemas.ts             # Pagination, UUID, phone & currency schemas
│   │   │   │   └── index.ts
│   │   │   ├── types/                            # Inferred TypeScript Types & DTOs
│   │   │   │   ├── api.types.ts                  # ApiSuccess<T>, ApiError, PaginationMeta
│   │   │   │   ├── dto.types.ts                  # UserSummary, ListingSummary, DealObject, etc.
│   │   │   │   └── index.ts
│   │   │   ├── constants/                        # Global Campus Constants
│   │   │   │   ├── categories.ts                 # Campus listing categories
│   │   │   │   ├── error-codes.ts                # Machine-readable error codes (VALIDATION_ERROR, etc.)
│   │   │   │   ├── limits.ts                     # File size (5 MB), text limits, page size (20)
│   │   │   │   ├── regex.ts                      # E.164 phone & student ID regular expressions
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── tsconfig/                                 # Shared TypeScript Base Configurations
│       ├── base.json                             # Common compiler options
│       ├── node.json                             # Node.js backend compiler options
│       ├── react.json                            # React SPA compiler options
│       └── package.json
│
├── docs/                                         # Engineering & Product Documentation
│   ├── UniMarket_MVP_PRD.md                      # Complete Product Requirements Document (v1.1)
│   ├── UniMarket_MVP_API_Contract.md             # Standardized REST API Contract
│   ├── UniMarket_Code_Review_Split.md            # 6-Person work distribution & review packages
│   └── UniMarket_Folder_Structure (1).md         # Modular Monolith Folder Structure Reference Spec
│
├── docker/                                       # Multi-stage Container Definitions
│   └── database/
│       └── Dockerfile                            # Tailored PostgreSQL 16 image
├── docker-compose.yml                            # Local development multi-container orchestration
├── commitlint.config.cjs                         # Conventional commit message enforcement
├── package.json                                  # Monorepo root workspaces & orchestrator scripts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or `v22.x LTS` (configured in `engines: >=22.0.0`)
- **npm**: `v10.x` or higher
- **Docker & Docker Compose** (optional, for fully containerized setup)

---

### Option A: Local Development Setup (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/UniMarket-Project/UniMarket.git
   cd UniMarket
   ```

2. **Install all monorepo dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the master `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
   Ensure `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `ENCRYPTION_KEY`, and `HMAC_SECRET` are properly set.

4. **Build the Shared Contract Package:**
   ```bash
   npm run build --workspace=packages/shared
   ```

5. **Initialize Database & Seed Data:**
   ```bash
   # Run Prisma migrations
   npm run db:migrate

   # Seed sample Ethiopian campus listings, users, and requests
   npm run db:seed
   ```

6. **Start Frontend & Backend Concurrently:**
   ```bash
   npm run dev
   ```
   - **Frontend SPA:** [http://localhost:5173](http://localhost:5173) (or [http://localhost:3000](http://localhost:3000))
   - **Backend API:** [http://localhost:5000](http://localhost:5000)
   - **Prisma Studio:** `npm run db:studio` (available at [http://localhost:5555](http://localhost:5555))

---

### Option B: Docker Compose Setup

Run the full containerized stack (PostgreSQL database, Node.js API, and Nginx-served SPA):

```bash
docker compose up -d --build
```

- **Web Application:** [http://localhost:3000](http://localhost:3000)
- **API Health Check:** [http://localhost:5001/health](http://localhost:5001/health)
- **Database:** `localhost:5433`

To stop the containers:
```bash
docker compose down
```

---

## 🧪 Testing & Code Quality

The monorepo includes workspace-wide quality checks:

```bash
# Type check all packages and applications
npm run typecheck

# Run unit and integration test suites
npm run test

# Run backend unit tests specifically
npm run test:unit --workspace=apps/api

# Run backend end-to-end integration tests
npm run test:e2e --workspace=apps/api
```

---

## 🔐 Security & Governance Highlights

- **Encrypted Student Identifiers:** Student ID numbers and verification documents are encrypted using AES-256-GCM before storage, and HMAC-SHA256 is used for unique lookup indexing to prevent plain-text PII leakage.
- **Privacy Enforcement:** Sensitive contact details (email, phone number, physical address) are stripped from public user profiles. Only authenticated counterparts in an active deal may access communication channels.
- **Audit Logging:** Administrative actions (verifications, suspensions, and content moderation) are recorded in an append-only `audit_log` table with timestamps and administrator IP metadata.
- **Anti-Fraud Safeguards:** Unverified users cannot create listings, post requests, or initiate transactions. Listings receiving 3 independent community reports are automatically hidden pending administrator review.

---

## 📄 License

This project is licensed under the MIT License.
