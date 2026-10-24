# UniMarket API E2E Testing & Test Factories

This directory contains the automated end-to-end (E2E) integration test suite and test data builders for the **UniMarket API**.

---

## 1. Test Architecture

The testing structure follows the monorepo architecture defined in `docs/UniMarket_Folder_Structure (1).md`:

```
apps/api/tests/
├── setup/
│   └── test-db.ts               # Database truncation helper for test isolation
├── factories/                   # Test data builders
│   ├── user.factory.ts          # Generates test users with unique credentials & profiles
│   ├── listing.factory.ts       # Generates test listings across types (sell, rent, etc.)
│   ├── transaction.factory.ts   # Generates test transactions & deal states
│   └── auth.helper.ts           # Creates user + signed JWT access token pair
├── e2e/                         # Supertest full-flow integration tests
│   ├── auth-flow.e2e.ts         # Register, login, profile retrieval, refresh, logout
│   ├── verified-seller-flow.e2e.ts # Unverified 403 guard, listing creation, search, patch
│   ├── deal-completion-flow.e2e.ts # Deal lifecycle: initiate, accept, both confirm, rate
│   └── moderation-flow.e2e.ts   # 3 distinct community reports auto-hide listing
└── README.md
```

---

## 2. Test Flows Covered

### A. Authentication Flow (`auth-flow.e2e.ts`)
- **Student Registration:** Validates university email format, phone regex, password strength, and user profile initialization.
- **Conflict Handling:** Enforces unique email and phone constraints (409 Conflict).
- **Login & Token Issuance:** Verifies password hash and issues short-lived JWT access tokens and HTTP-only refresh cookies.
- **Authenticated Identity:** Tests access to `GET /api/v1/users/me` using `Bearer <token>`.
- **Invalid Credentials:** Ensures failed logins return 401 Unauthorized.

### B. Verified Seller Flow (`verified-seller-flow.e2e.ts`)
- **Campus Trust Guard:** Rejects listing creation by unverified students with `403 FORBIDDEN` (`VERIFICATION_REQUIRED`).
- **Verified Listing Creation:** Verified students can post active listings across all 7 supported transaction types.
- **Search & Filter:** Verifies listings appear in public search (`GET /api/v1/listings?category=...`).
- **Owner Modifications:** Verified seller can update prices and details (`PATCH /api/v1/listings/:id`).

### C. Deal Completion & Reviews Flow (`deal-completion-flow.e2e.ts`)
- **Deal Initiation:** Buyer initiates transaction on active listing (`POST /api/v1/transactions`).
- **Seller Acceptance:** Seller transitions transaction to `in_progress`.
- **Two-Sided Confirmation:** Both buyer and seller submit confirmation (`confirmed: true`).
- **Completion Transition:** Deal automatically transitions to `completed` upon mutual confirmation.
- **Peer Rating:** Buyer submits 5-star rating and review (`POST /api/v1/ratings`).
- **Profile Stats Aggregate:** Validates recalculation of seller's average rating and total ratings in their public profile.

### D. Auto-Moderation Flow (`moderation-flow.e2e.ts`)
- **Threshold Enforcement:** Three distinct campus users submit reports against a suspicious listing (`POST /api/v1/reports`).
- **Automated Removal:** Upon reaching the 3-report threshold (`LIMITS.REPORT_AUTO_HIDE_THRESHOLD`), the listing automatically transitions to `status: 'hidden'`.
- **Feed Exclusion:** Hidden listings are immediately excluded from public marketplace search queries.

---

## 3. Test Isolation & Database Cleanup

Between test runs, `truncateTestDatabase()` in `setup/test-db.ts` resets all database tables in reverse dependency order:
`AuditLog` → `Notification` → `Report` → `RatingReview` → `Payment` → `Message` → `Transaction` → `Request` → `Listing` → `RefreshToken` → `UserVerification` → `UserProfile` → `User`.

This ensures:
1. Zero test state pollution between test suites.
2. Full compatibility with both local Docker Postgres instances and ephemeral CI runners.

---

## 4. Running the Tests

To execute the end-to-end test suite:

```bash
# From workspace root
npm run test:e2e --workspace=@unimarket/api

# Or directly using tsx test runner
npx tsx --test apps/api/tests/e2e/*.e2e.ts
```
