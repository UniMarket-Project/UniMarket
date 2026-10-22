# UniMarket Database Fixtures & Seed Documentation

This directory contains database fixtures, schema definitions, and migration tooling for the **UniMarket** campus marketplace API.

---

## 1. Quick Start

### Running the Seed Script

From the repository root or the API package:

```bash
# From workspace root
npm run db:seed

# Or specifically targeting the API workspace
npm run db:seed --workspace=@unimarket/api
```

### Idempotency Guarantee
The seed script (`prisma/seed/index.ts`) is **strictly idempotent**. It cleans existing database records in reverse dependency order before inserting the fixtures:
`AuditLog` → `Notification` → `Report` → `RatingReview` → `Payment` → `Message` → `Transaction` → `Request` → `Listing` → `RefreshToken` → `UserVerification` → `UserProfile` → `User`.

You can execute `npm run db:seed` multiple times safely without encountering duplicate records or unique constraint collisions.

---

## 2. Demo User Accounts & Credentials

> [!IMPORTANT]
> In development environments, the demo password defaults to **`Password123!`**.
> In production environments (`NODE_ENV === 'production'`), hardcoded default passwords are blocked: you must explicitly provide the `DEMO_USER_PASSWORD` environment variable.

| User | Email | Default Password | Role / Type | Verification | Campus & Location | Showcase Role |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@aau.edu.et` | `Password123!` | `admin` / `staff` | `verified` | AAU Sidist Kilo, Admin Bldg | Review pending verifications, inspect reports, audit logs |
| **Abebe Bikila** | `abebe.bikila@aau.edu.et` | `Password123!` | `user` / `student` | `verified` | AAU 4-Kilo, Block 42 | High-reputation student seller (4.9 ⭐, 14 reviews) |
| **Chaltu Kebede** | `chaltu.kebede@aau.edu.et` | `Password123!` | `user` / `student` | `verified` | AAU 6-Kilo, Dorm Block B | Active student buyer & exchanger (5.0 ⭐, 9 reviews) |
| **Tadesse Worku** | `tadesse.repair@gmail.com` | `Password123!` | `user` / `provider` | `verified` | Off-campus King George VI St | Registered electronics technician with business license |
| **Dawit Alemu** | `dawit.alemu@aau.edu.et` | `Password123!` | `user` / `student` | `unverified` | AAU Freshmen Dorms | Freshman user showing unverified state restrictions |
| **Hiwot Tsegaye** | `hiwot.tsegaye@aau.edu.et` | `Password123!` | `user` / `student` | `pending` | AAU Sidist Kilo | Demonstrates student ID submission awaiting admin approval |

---

## 3. Seeded Listings (All 7 Transaction Types)

All active listings are pre-configured with 60-day expiry timestamps:

| # | Type | Item / Service | Category | Price (ETB) | Seller | Location |
| :-: | :--- | :--- | :--- | :-: | :--- | :--- |
| **1** | `sell` | Original Casio fx-991EX ClassWiz Calculator | `Electronics` | 1,850.00 | Abebe | AAU 4-Kilo Science Library |
| **2** | `sell` | Introduction to Algorithms (CLRS 3rd Ed) | `Academic Books` | 1,200.00 | Abebe | AAU 4-Kilo Computer Science |
| **3** | `sell` | Single Coil Mini Electric Stove (Mitchad) 1000W | `Dorm Essentials` | 950.00 | Chaltu | AAU 6-Kilo Dormitory Gate |
| **4** | `rent` | Rotring Engineering Drawing Board (A3) + T-Square | `Stationery` | 450.00 | Chaltu | AAU 6-Kilo Engineering Bldg |
| **5** | `lend` | LED Rechargeable Study Desk Lamp (USB-C) | `Dorm Essentials` | 0.00 (Free) | Abebe | AAU 4-Kilo Campus |
| **6** | `service` | Student Laptop Diagnostics, Thermal Paste & OS Install | `Services` | 500.00 | Tadesse | 6-Kilo Next to CBE |
| **7** | `exchange` | Redragon Mechanical Keyboard for Type-C Hub | `Electronics` | 0.00 (Trade) | Chaltu | AAU 6-Kilo SE Lab |
| **8** | `food` | Fresh Campus Dorm Shiro & Teff Injera Weekly Pack | `Food & Groceries` | 350.00 | Abebe | AAU 4-Kilo Main Gate |
| **9** | `transport` | Morning Campus Ride Share (6-Kilo to 4-Kilo / Sidist) | `Transport` | 25.00 | Abebe | AAU 6-Kilo Main Gate |

---

## 4. Student Demands & Requests

1. **Academic Book Request (`product`):**
   - Requester: Chaltu Kebede
   - Item: *Gilbert Strang: Linear Algebra and Its Applications (4th Ed)*
   - Budget: 500 – 1,000 ETB
2. **Tutoring Request (`service`):**
   - Requester: Dawit Alemu
   - Topic: C++ Object-Oriented Programming (3 sessions/week)
   - Budget: 800 – 1,500 ETB
3. **Engineering Book Exchange (`exchange`):**
   - Requester: Abebe Bikila
   - Offering (`exchangeHave`): *Signals & Systems 2nd Edition Textbook and Digital Logic Notes*
   - Seeking (`exchangeWant`): *Arduino Uno R3 starter kit with breadboard, sensors, and jumper wires*

---

## 5. Transactions, Payments & Reviews

- **Completed Deal:**
  - Item: Casio fx-991EX ClassWiz Calculator
  - Seller: Abebe Bikila | Buyer: Chaltu Kebede
  - Status: `completed` (both `buyerConfirmed` and `sellerConfirmed` are `true`)
  - Payment: Offline Telebirr transfer (`method: 'transfer'`, `status: 'recorded'`)
  - Ratings: Mutual 5-star reviews with genuine student testimonials
- **Active Pending Deal:**
  - Item: Introduction to Algorithms (CLRS 3rd Edition)
  - Seller: Abebe Bikila | Buyer: Chaltu Kebede
  - Status: `pending`
  - Messages Thread: 3 messages simulating real-time buyer-seller negotiation and meeting scheduling

---

## 6. Moderation & Audit Fixtures

- **Community Report:**
  - Reporter: Abebe Bikila
  - Target: Dawit Alemu
  - Reason: `spam` (multiple duplicate inquiries)
  - Status: `submitted` (ready for Admin resolution demo)
- **Audit Log:**
  - Action: `SYSTEM_INITIALIZED`
  - Admin: `admin@aau.edu.et`
  - Details: `{ "environment": "development", "version": "1.0.0-mvp" }`

---

## 7. 5-Minute Showcase Presentation Script

1. **Campus Browse & Discovery (1 min):**
   - Log in as **Chaltu** (`chaltu.kebede@aau.edu.et`).
   - Filter listings by category (`Electronics`, `Food & Groceries`) and transaction type (`sell`, `exchange`, `rent`).
2. **Private Messaging & Negotiation (1 min):**
   - Open the conversation thread with **Abebe** regarding the CLRS textbook.
   - Demonstrate unread count badges and 5-second polling synchronization.
3. **Demands Board & Exchange (1 min):**
   - Navigate to `/requests` to showcase student demand posts.
   - Show Abebe's hardware-for-book exchange request with `exchangeHave` and `exchangeWant` details.
4. **Deal Lifecycle & Ratings (1 min):**
   - View the completed Casio calculator transaction.
   - Highlight the mutual 5-star reviews and Telebirr payment confirmation.
5. **Admin Moderation & Student Verification (1 min):**
   - Log in as **Admin** (`admin@aau.edu.et`).
   - Review **Hiwot's** pending student verification (`ECN/8899/15`).
   - View **Dawit's** submitted spam report and the platform audit log.
