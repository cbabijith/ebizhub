# EzhavaClub (eBizHub) Monorepo

EzhavaClub is a community-based digital platform designed to connect businesses, service providers, and professionals within a specific community. It serves as a centralized hub where community members can register, discover local services, and network.

---

# Phase 1 (MVP) Goal
The core focus for Phase 1 is simple:
> **Connect Ezhava community members with verified businesses and service providers in a simple, trusted platform.**

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

The schema is organized around business domains. The source code is organized module-wise under `apps/api/src/db/schema/`.

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

## Backend Architecture Design (Domain-Driven Modular)

For scalability and clean division of concerns across multiple platforms (Admin, User Web, Flutter Apps), `apps/api/` uses a **Domain-Driven Modular Architecture**.

### Folder Directory Layout
```text
apps/api/
├── src/
│   ├── app.ts                  # Hono app setup (middlewares, routes registration)
│   ├── server.ts               # Server entry point (starts Node adapter)
│   ├── routes.ts               # Versioned root routes directory
│   │
│   ├── config/                 # Global configuration settings
│   │   ├── env.ts              # Schema-validated env loader
│   │   ├── database.ts         # Drizzle connection client
│   │   ├── auth.ts             # JWT/Supabase auth handlers
│   │   └── storage.ts          # File upload configurations
│   │
│   ├── db/                     # Drizzle Database root
│   │   ├── schema/             # Partitioned schema definitions
│   │   ├── migrations/         # Drizzle output migration files
│   │   └── seed/               # Default lookup data seeds
│   │
│   ├── common/                 # Shared project modules
│   │   ├── errors/             # Custom Error handlers
│   │   ├── middleware/         # Hono core middlewares (logger, auth)
│   │   ├── validators/         # Common validator definitions
│   │   └── responses/          # Standard success/error response formats
│   │
│   └── modules/                # Business Domain Modules (Self-contained)
│       ├── auth/
│       ├── members/
│       ├── businesses/
│       ├── service-providers/
│       ├── categories/
│       ├── analytics/
│       ├── verification/
│       └── settings/
```

### Self-Contained Domain Modules
Each sub-folder inside `apps/api/src/modules/` is self-contained and holds its own business layers:
*   `*.routes.ts`: Defines Hono endpoints (no business logic).
*   `*.controller.ts`: Validates request input parameters, calls domain services, and returns standardized response models.
*   `*.service.ts`: Implements business operations logic (e.g. `registerBusiness()`, `vetVendor()`).
*   `*.repository.ts`: Handles direct Drizzle query selections and mutations (no business logic).
*   `*.validation.ts`: Zod validation schemas for input auditing.
*   `*.dto.ts` / `*.mapper.ts`: Maps raw database schema records to clean API response objects.

### Request Execution Flow
```
Client Request ──> Common Middleware ──> Routes ──> Controller ──> Service ──> Repository ──> PostgreSQL
```

### Standardized Response Formats

*   **Success Response (HTTP 200/201)**:
    ```json
    {
      "success": true,
      "message": "Resource created successfully",
      "data": {},
      "meta": {}
    }
    ```
*   **Error Response (HTTP 400/500/404)**:
    ```json
    {
      "success": false,
      "message": "Resource not found",
      "errors": ["Unable to resolve ID"]
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

