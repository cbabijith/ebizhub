# EzhavaClub (eBizHub) Monorepo

EzhavaClub is a community-based digital platform designed to connect businesses, service providers, and professionals within a specific community. It serves as a centralized hub where community members can register, discover local services, and network.

---

# Phase 1 (MVP) Goal
The core focus for Phase 1 is simple:
> **Connect Ezhava community members with verified businesses and service providers in a simple, trusted platform.**

All design and development decisions support the objective of collecting, verifying, organizing, and publishing community information so it is searchable by every member.

---

# EBizHub Phase 1 – Admin Panel Development Notes

## Objective
The primary objective of Phase 1 is **not** to build a large enterprise admin panel.
The goal is to **collect, verify, organize, and publish as much community information as possible**, making it searchable and discoverable by every community member.

### Phase 1 Core Goals
1. Register every community member.
2. Register every business.
3. Register every service provider.
4. Verify the information.
5. Publish verified information to the public website and mobile app.
6. Build a searchable digital community directory.

---

## Core Admin Modules to Build

### 1. Dashboard
Provide a quick overview of platform growth. Avoid complex analytics for Phase 1.
* Total Members
* Total Businesses
* Total Service Providers
* Pending Verifications
* Recently Added Records

### 2. Member Management (Highest Priority)
Collect complete details for every community member.
* Member List
* Add/View/Edit Member
* Delete Member (Soft Delete)
* Verify & Search Members
* Filter & Export Members
* Future: Excel/CSV Import

### 3. Business Management
Build the largest verified business directory for the community.
* Business List
* Add/View/Edit/Delete Business
* Verify Business
* Search & Filters

### 4. Service Provider Management
Create a verified directory of professionals and skilled workers.
* Provider List
* Add/View/Edit/Delete Provider
* Verify Provider
* Search & Filters

### 5. Categories
Keep it simple with no advanced hierarchy:
* Business Categories
* Service Categories

### 6. Community Content (Basic CRUD)
Keep the community active with useful information:
* News, Events, Jobs, Offers, Notices

### 7. Banner Management
* Home Banners
* Advertisement Banners

### 8. Admin Profile
* My Profile
* Change Password

---

## Modules NOT Required in Phase 1 (Postponed)
Do not spend development time on these yet:
* Reports & Advanced Analytics
* Audit Logs & Email Template Builder
* Multiple Admin Roles & Permission Management
* Membership Plans & Subscription System
* Payment Gateway, Wallet, & Marketplace
* AI Features, Chat System, & ERP Integrations

---

## Recommended Sidebar
* Dashboard
* Members
* Businesses
* Service Providers
* Categories
* Community (News, Events, Jobs, Offers, Notices)
* Banners
* Profile

---

## Development Philosophy
Every screen should answer one question:
**"Does this help us collect, verify, manage, or display community information?"**
If the answer is **No**, postpone it. Simplicity, speed, data quality, and easy verification are key.


---

## Workspace Structure

This project is a monorepo managed using `pnpm` workspaces:

```
ebizhub/
├── apps/
│   ├── api/                # Hono API service with TypeScript & Drizzle ORM (PostgreSQL)
│   ├── admin-web/          # Admin Next.js web application
│   ├── user-web/           # User Next.js web application
│   ├── admin-app/          # Admin Flutter mobile application
│   └── user-app/           # User Flutter mobile application
├── packages/
│   ├── shared/             # Shared utilities and TypeScript types
│   └── ui/                 # Shared UI components
├── pnpm-workspace.yaml     # pnpm workspace configuration
└── turbo.json              # Turborepo configuration
```

---

## Tech Stack

### Backend & Database
- **API Framework**: [Hono](https://hono.dev) (TypeScript)
- **Database ORM**: [Drizzle ORM](https://orm.drizzle.team)
- **Database Engine**: PostgreSQL (Supabase Connection Pooling)
- **Authentication & User Management**: Supabase Auth

### Web Clients
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Component Library**: shadcn/ui

### Mobile Clients
- **Framework**: Flutter
- **Language**: Dart
- **State Management**: Provider / Riverpod

# EBizHub – Core Modules (Phase 1)

For a scalable architecture, we organize the system in terms of **9 Core Business Modules**. Submodules and features map directly to these core modules.

## Core Modules & Submodules

### 1. Authentication & Identity
**Purpose:** Manage users, authorization, and platform access.
*   **Submodules**: Login, Registration, OTP, Roles (Admin, Vendor, Customer), Permissions, Account Verification.

### 2. Member Management
**Purpose:** Manage community members.
*   **Submodules**: Member Profile, Professional Details, Community Details, Membership Status, Profile Management.

### 3. Business Management
**Purpose:** Manage businesses registered on the platform.
*   **Submodules**: Business Registration, Business Profile, Business Gallery, Contact Information, Business Hours, Business Verification, Business Showcase (Products & Services - capped at a **max of 5 items**).

### 4. Service Provider Management
**Purpose:** Manage professionals who provide services (e.g. Electricians, Plumbers, Lawyers, Doctors, Developers).
*   **Submodules**: Professional Profile, Skills, Experience, Portfolio, Service Areas.

### 5. Directory & Discovery
**Purpose:** Help users discover businesses and professionals.
*   **Submodules**: Business Directory, Service Directory, Category Browsing, Location Filtering, Global Search, Business Detail Page.

### 6. Customer Interaction
**Purpose:** Connect customers directly with businesses.
*   **Submodules**: Click to Call, WhatsApp, Google Maps, Share Profile, Favourite (optional).

### 7. Analytics
**Purpose:** Measure engagement and profile activity.
*   **Submodules**: Profile Views, Phone Clicks, WhatsApp Clicks, Map Clicks, Dashboard Reports.

### 8. Administration
**Purpose:** Manage the platform.
*   **Submodules**: User Management, Business Management, Verification Queue, Category Management, Reports, Dashboard.

### 9. Master Data Management
**Purpose:** Manage reusable lookup and system configuration data.
*   **Submodules**: Business Categories, Service Categories, Districts, Panchayats, Cities, Settings.

---

# Core Architecture

```
Authentication & Identity
│
├── Member Management
├── Business Management
├── Service Provider Management
├── Directory & Discovery
├── Customer Interaction
├── Analytics
├── Administration
└── Master Data Management
```

## Database Schema Design (Drizzle & PostgreSQL)

The schema is organized around business domains. The source code is organized module-wise under `apps/api/src/database/schema/`.

### 1. Authentication & Identity
*   **Table:** `profiles` (References Supabase `auth.users`)
    *   `id` (UUID, Primary Key, references `auth.users.id`)
    *   `full_name` (Text, Not Null)
    *   `phone` (Text)
    *   `email` (Text, Unique, Not Null)
    *   `avatar` (Text)
    *   `role` (Enum: `admin`, `vendor`, `customer` - default `customer`)
    *   `status` (Enum: `active`, `inactive`, `suspended` - default `active`)
    *   `created_at` / `updated_at` (Timestamps with timezone)

### 2. Member Management
*   **Table:** `members`
    *   `id` (UUID, Primary Key, default random)
    *   `profile_id` (UUID, Foreign Key → `profiles.id`)
    *   `membership_number` (Text)
    *   `district_id` (Integer, Foreign Key → `districts.id`)
    *   `panchayat_id` (Integer, Foreign Key → `panchayats.id`)
    *   `occupation` (Text)
    *   `company` (Text)
    *   `bio` (Text)
    *   `verification_status` (Enum: `pending`, `verified`, `rejected` - default `pending`)
    *   `created_at` / `updated_at` (Timestamps with timezone)

### 3. Business Management
*   **Table:** `businesses`
    *   `id` (UUID, Primary Key, default random)
    *   `owner_id` (UUID, Foreign Key → `profiles.id`)
    *   `category_id` (Integer, Foreign Key → `business_categories.id`)
    *   `business_name` (Text, Not Null)
    *   `slug` (Text, Unique, Not Null)
    *   `description` (Text)
    *   `phone` (Text, Not Null)
    *   `whatsapp` (Text)
    *   `email` (Text)
    *   `website` (Text)
    *   `logo` (Text)
    *   `cover_image` (Text)
    *   `address` (Text, Not Null)
    *   `district_id` (Integer, Foreign Key → `districts.id`)
    *   `panchayat_id` (Integer, Foreign Key → `panchayats.id`)
    *   `latitude` / `longitude` (Double Precision)
    *   `working_hours` (Text)
    *   `gst_number` (Text)
    *   `established_year` (Integer)
    *   `verification_status` (Enum: `pending`, `verified`, `rejected` - default `pending`)
    *   `status` (Enum: `active`, `inactive` - default `active`)
    *   `created_at` / `updated_at` (Timestamps with timezone)

*   **Table:** `business_gallery`
    *   `id` (UUID, Primary Key)
    *   `business_id` (UUID, Foreign Key → `businesses.id`)
    *   `image_url` (Text, Not Null)
    *   `sort_order` (Integer, default 0)
    *   `created_at` (Timestamp with timezone)

*   **Table:** `business_products` (Max 5 products restriction enforced in API)
    *   `id` (UUID, Primary Key)
    *   `business_id` (UUID, Foreign Key → `businesses.id`)
    *   `title` (Text, Not Null)
    *   `description` (Text)
    *   `image` (Text)
    *   `display_order` (Integer, default 0)
    *   `status` (Enum: `active`, `inactive` - default `active`)

*   **Table:** `business_services` (Max 5 services restriction enforced in API)
    *   `id` (UUID, Primary Key)
    *   `business_id` (UUID, Foreign Key → `businesses.id`)
    *   `title` (Text, Not Null)
    *   `description` (Text)
    *   `image` (Text)
    *   `display_order` (Integer, default 0)
    *   `status` (Enum: `active`, `inactive` - default `active`)

### 4. Service Provider Management
*   **Table:** `service_providers`
    *   `id` (UUID, Primary Key)
    *   `profile_id` (UUID, Foreign Key → `profiles.id`)
    *   `service_category_id` (Integer, Foreign Key → `service_categories.id`)
    *   `experience` (Integer, default 0)
    *   `bio` (Text)
    *   `phone` (Text, Not Null)
    *   `service_radius` (Integer, default 10)
    *   `status` (Enum: `active`, `inactive` - default `active`)
    *   `verification_status` (Enum: `pending`, `verified`, `rejected` - default `pending`)
    *   `created_at` / `updated_at` (Timestamps with timezone)

### 5. Directory & Discovery (Master Data Categories)
*   **Table:** `business_categories`
    *   `id` (Serial, Primary Key)
    *   `name` (Text, Unique, Not Null)
    *   `slug` (Text, Unique, Not Null)
    *   `icon` (Text)
    *   `sort_order` (Integer, default 0)
    *   `status` (Enum: `active`, `inactive` - default `active`)

*   **Table:** `service_categories`
    *   `id` (Serial, Primary Key)
    *   `name` (Text, Unique, Not Null)
    *   `slug` (Text, Unique, Not Null)
    *   `icon` (Text)
    *   `sort_order` (Integer, default 0)
    *   `status` (Enum: `active`, `inactive` - default `active`)

### 6. Locations (Master Data)
*   **Table:** `districts`
    *   `id` (Serial, Primary Key)
    *   `name` (Text, Unique, Not Null)

*   **Table:** `panchayats`
    *   `id` (Serial, Primary Key)
    *   `district_id` (Integer, Foreign Key → `districts.id`)
    *   `name` (Text, Not Null)

### 7. Customer Interaction & Analytics
*   **Table:** `interaction_logs`
    *   `id` (UUID, Primary Key)
    *   `business_id` (UUID, Foreign Key → `businesses.id`)
    *   `action` (Enum: `profile_view`, `phone_click`, `whatsapp_click`, `map_click`)
    *   `ip` / `device` (Text)
    *   `created_at` (Timestamp with timezone)

*   **Table:** `business_analytics`
    *   `id` (UUID, Primary Key)
    *   `business_id` (UUID, Foreign Key → `businesses.id`, Unique)
    *   `profile_views` / `phone_clicks` / `whatsapp_clicks` / `map_clicks` (Integer, default 0)
    *   `updated_at` (Timestamp with timezone)

### 8. Administration (Verification Queue)
*   **Table:** `verification_requests`
    *   `id` (UUID, Primary Key)
    *   `business_id` (UUID, Foreign Key → `businesses.id`)
    *   `submitted_by` (UUID, Foreign Key → `profiles.id`)
    *   `status` (Enum: `pending`, `approved`, `rejected` - default `pending`)
    *   `reviewed_by` (UUID, Foreign Key → `profiles.id`)
    *   `reviewed_at` (Timestamp with timezone)
    *   `remarks` (Text)
    *   `created_at` (Timestamp with timezone)

### 9. Master Settings
*   **Table:** `settings`
    *   `key` (Text, Primary Key)
    *   `value` (Text, Not Null)


---

# Application Architectures

### User App (Flutter)
- Authentication
- Directory & Discovery
- Business Pages
- Service Provider Pages
- Profile Management

### Vendor App (Flutter)
- Authentication
- Business Management
- Service Showcase Management
- Analytics Reports

### User Web (Next.js)
- Directory & Discovery
- Unified Search Index
- Business & Service Pages

### Admin Web (Next.js)
- Vetting & Verification Queue
- Category & Master Data Management
- System-wide Analytics & Reports
- User Role Management

### API Backend (Hono)
- Auth & Role Middleware
- Members & Business Operations
- Directory Search Query Handlers
- Analytics Event Trackers
- Admin Approvals & Verification Actions
- Master Data Lookup Endpoints

---

## Phase 1 Deliverable

By the end of Phase 1, a community member should be able to:
1. Register an account.
2. Register a business or service.
3. Get verified by an administrator.
4. Be listed in the public directory.
5. Be discovered through search and categories.
6. Receive calls, WhatsApp messages, and map visits from customers.
7. Track profile views and customer interactions from their dashboard.

---

## Backend Architecture Design (Feature-Driven Development - FDD)

For EBizHub, the backend uses a **Feature-Driven Development (FDD)** architecture. This structure ensures that code is organized around business features rather than technical layers alone, keeping capabilities self-contained and making scalability seamless.

### Folder Directory Layout
```text
apps/api/
├── src/
│   ├── app.ts                  # Hono app setup (middlewares, feature registration)
│   ├── server.ts               # Server entry point (starts Node adapter)
│   ├── routes.ts               # Versioned root routes router
│   │
│   ├── config/                 # Global configuration settings
│   │   ├── env.ts              # Environment loader
│   │   ├── database.ts         # Drizzle connection client
│   │   ├── auth.ts             # Auth handlers (Supabase JWT checking)
│   │   └── storage.ts          # File upload config
│   │
│   ├── database/               # Drizzle Database folder
│   │   ├── schema/             # Drizzle schemas divided by domain
│   │   ├── schema.ts           # Central schema exports entry point
│   │   ├── migrations/         # Drizzle output migration files
│   │   └── seed/               # Default database seeds
│   │
│   ├── shared/                 # Common modules (shared by all features)
│   │   ├── middleware/         # Custom middlewares (auth, admin, role checking)
│   │   ├── utils/              # Utility helper functions
│   │   ├── errors/             # Custom error classes
│   │   ├── responses/          # Standard response JSON models
│   │   ├── constants/          # Shared constants
│   │   └── pagination/         # Common pagination helpers
│   │
│   └── features/               # Feature Modules (Self-contained)
│       ├── auth/               # Mobile OTP, roles, registration
│       ├── members/            # Personal and professional profile management
│       ├── businesses/         # Shop profiles, catalogues (max 5 services/products)
│       ├── service-providers/  # Professional profiles, experience, service areas
│       ├── categories/         # Directory categories taxonomy lookup
│       ├── search/             # Global directory search query operations
│       ├── analytics/          # Views, phone/WhatsApp/Map clicks interaction tracking
│       ├── verification/       # Approval queues and admin review backlog
│       ├── dashboard/          # Vendor analytics dashboard aggregates
│       └── uploads/            # S3/Supabase storage upload controllers
```

### Self-Contained Feature Folder Contract
Every feature folder inside `apps/api/src/features/` follows a standardized structure contract:
*   `routes.ts`: Defines endpoint URLs only (no business logic).
*   `controller.ts`: Handles requests, parses inputs, triggers services, and builds standard responses.
*   `service.ts`: Houses core business logic (e.g. `registerBusiness()`, `verifyBusiness()`).
*   `repository.ts`: Isolates raw database queries using Drizzle (no business logic).
*   `validation.ts`: Holds Zod validation schemas.
*   `dto.ts` & `mapper.ts`: Handles data transfer models and database record mapper conversions.
*   `permissions.ts`: Domain-specific role checks.
*   `*.openapi.ts`: OpenAPI specifications for auto-generated docs.

### Feature-Driven Request Flow
```
Client Request ──> Shared Middleware ──> Routes ──> Controller ──> Service ──> Repository ──> Drizzle ORM ──> PostgreSQL
```

### Suggested Development Order (Phase 1)
1. **Authentication** (Feature 1) - ✅ Completed v1.0
2. **Members** (Feature 2) - ✅ Completed v2.5
3. **Business Management** (Feature 3) - ✅ Completed v2.0
4. **Service Providers** (Feature 4) - ✅ Completed v4.0
5. **Search & Discovery** (Feature 5) - ⚠️ Functionally complete; production hardening pending (v1.1)
6. **Verification Queue** (Feature 6) - ✅ Completed v1.0
7. **Analytics Dashboard** (Feature 7) - ✅ Completed v1.0
8. **Community Engagement Platform** (Feature 06 - New Phase) - ✅ Completed v1.0
9. **Frontend & Mobile Apps** (Feature 8) - ⏳ Skeleton only

### Standardized Response Formats

*   **Success Response (HTTP 200/201)**:
    ```json
    {
      "success": true,
      "message": "Resource retrieved successfully",
      "data": {},
      "meta": {}
    }
    ```
*   **Error Response (HTTP 400/500/404)**:
    ```json
    {
      "success": false,
      "message": "Validation failed",
      "errors": ["District ID is required"]
    }
    ```

---

## Setup & Installation

1. **Install Workspace Dependencies**:
   ```bash
   pnpm install --ignore-scripts
   ```

2. **Configure Environment Variables**:
   - Duplicate the example env files and configure them:
     - **API Service**: `cp apps/api/.env.example apps/api/.env` (Configure `DATABASE_URL` with your Postgres pooler)
     - **Admin Web**: `cp apps/admin-web/.env.example apps/admin-web/.env.local`
     - **User Web**: `cp apps/user-web/.env.example apps/user-web/.env.local`

3. **Verify Database Connection / Run Migrations**:
   ```bash
   # Run from apps/api directory to push schema/migrations
   pnpm --filter api db:push
   ```

---

## Local Development

### Run Dev Servers

- **API Service (Hono)**:
  ```bash
  pnpm --filter api dev
  ```
- **Admin Web (Next.js)**:
  ```bash
  pnpm --filter admin-web dev
  ```
- **User Web (Next.js)**:
  ```bash
  pnpm --filter user-web dev
  ```
- **Mobile Apps (Flutter)**:
  ```bash
  # Run Admin Mobile App
  cd apps/admin-app
  flutter run

  # Run User Mobile App
  cd apps/user-app
  flutter run
  ```

---

## Project Documentation

Detailed system documentation resources:
- 📊 **[Database Schema Design & ERD](file:///home/abijithcb/.gemini/antigravity-ide/brain/7988d6c2-7460-437a-9ebc-50ec02eaa7bf/db_schema_documentation.md)**: Tables, constraints, columns, and relations mappings.
- 🔀 **[System Data Flow Diagrams](file:///home/abijithcb/.gemini/antigravity-ide/brain/7988d6c2-7460-437a-9ebc-50ec02eaa7bf/data_flow_diagrams.md)**: Visual sequence diagrams mapping out vendor onboarding, search/discovery, click-tracking, and admin vetting workflows.
- 🔑 **[Feature 01: Authentication & Identity](file:///home/abijithcb/Projects/ebizhub/docs/feature-01-authentication.md)**: Details on authentication registers and live Supabase Auth integration.
- 👥 **[Feature 02: Member Module](file:///home/abijithcb/Projects/ebizhub/docs/feature-02-members.md)**: Details on Three-Layer Identity, normalized branch lookups, and profile completion formulas.
- 🏢 **[Feature 03: Business Management](file:///home/abijithcb/Projects/ebizhub/docs/feature-03-business-management.md)**: Business registration, gallery, products/services (max 5), verification, search, and analytics.
- �️ **[Feature 04: Service Providers](file:///home/abijithcb/Projects/ebizhub/docs/feature-04-service-providers.md)**: Provider profiles, portfolios, skills, service areas, public listings, search, and analytics.
- �🔍 **[Feature 05: Discovery Platform](file:///home/abijithcb/Projects/ebizhub/docs/feature-05-discovery.md)**: Details on Discovery aggregates, directory listings, unified search, categories, recommendations, and analytics.
- ✅ **[Feature 06: Verification Queue](file:///home/abijithcb/Projects/ebizhub/docs/feature-06-verification-queue.md)**: Business and service-provider verification submit/approve/reject workflows.
- 📊 **[Feature 07: Analytics Dashboard](file:///home/abijithcb/Projects/ebizhub/docs/feature-07-analytics-dashboard.md)**: Profile views, phone/WhatsApp/map click tracking, aggregate analytics, and search analytics.
- 🧪 **[QA Member Verification Report](file:///home/abijithcb/Projects/ebizhub/docs/qa/member-verification.md)**: Verified E2E Functional and Security validation scorecards.
- 🧪 **[QA Business Management Report](file:///home/abijithcb/Projects/ebizhub/docs/qa/feature-03-business-qa.md)**: Feature 03 Stage 1 Functional + Stage 2 Authorization QA scorecard.
- 🧪 **[QA Discovery Platform Verification Report](file:///home/abijithcb/Projects/ebizhub/docs/qa/feature-05-verification.md)**: Feature 05 Sprint 4 QA functional verification report.
- 🧪 **[QA Discovery Platform Performance Report](file:///home/abijithcb/Projects/ebizhub/docs/qa/feature-05-performance.md)**: Feature 05 Performance and latency test results.


