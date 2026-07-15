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

## Database Entities

- **Users** (Auth profiles, Roles, Permissions)
- **Members** (Community member profiles)
- **Businesses** (Registries, Profiles, Gallery, Locations)
- **Products & Services** (Business Showcase items - max 5 per business)
- **Service Providers** (Freelancers and individual professionals)
- **Categories** (Business & Service lookup lists)
- **Interaction Logs** (Views, clicks for Call, WhatsApp, and Maps)
- **Verification Requests** (Backend approval pipeline logs)
- **Settings** (Global system configuration)

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
