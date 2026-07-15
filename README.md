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

---

# EBizHub – Phase 1 Modules Spec

### 🔐 1. Authentication & User Management
*   **Authentication Flows**: Mobile OTP Login, Email Login, Registration, Forgot Password.
*   **Role Management**:
    *   **Admin**: System administrators.
    *   **Vendor**: Business owners and service providers.
    *   **Customer**: General community consumers.
*   **Profile Integration**: User Profile Completion and Account Verification states.

### 👤 2. Member Profile Module
Every community member gets a profile containing:
*   **Personal Details**: Name, Photo, Mobile, Email, District, Panchayat / Municipality, Address.
*   **Professional Details**: Occupation, Company, Skills, About/Bio.
*   **Community Details**: Membership ID (Optional), Verification Status.

### 🏢 3. Business Registration Module
*   **Business Info**: Business Name, Category, Description, Logo, Cover Image.
*   **Contact Details**: Phone, WhatsApp, Email, Website.
*   **Location Coordinates**: Physical Address, Google Maps Location Link.
*   **Metadata**: Working Hours, Established Year, GST Number (Optional).
*   **Vetting States**: Pending, Approved, Rejected.

### 🛠️ 4. Service Provider Module
For individual professionals (e.g., Electricians, Plumbers, Lawyers, Doctors, Developers, Marketers, Photographers):
*   **Professional Meta**: Profession, Years of Experience, Skills, Portfolio Gallery, Service Area coverage, Direct Contact channels.

### 🖼️ 5. Business Showcase Module
*   **Strict Limitations**: Every business profile is capped at a **maximum of 5 Services** and a **maximum of 5 Products**.
*   **Item Content**: Image/Photo, Name, Detailed Description.

### 📋 6. Directory Module
*   **Browse Businesses by**: Category, District, Location.
*   **Browse Professionals by**: Profession, Location.

### 🔍 7. Global Search Module
*   **Unified Search Index**: Search everything (Businesses, Service Providers, Categories) with autocomplete/instant results.

### 📄 8. Business Detail Page
*   **Showcase layout**: Displays Logo, Gallery, Description, Contacts, Working Hours, Maps Link, and the list of up to 5 Products & Services.
*   **Instant Customer CTAs**: Call, WhatsApp Message, Google Maps Navigation.

### 📊 9. Interaction Tracking Module
Automatically logs metrics in the database:
*   Business/Profile Views
*   Phone click counts
*   WhatsApp redirect clicks
*   Google Maps navigation clicks

### 📈 10. Vendor Dashboard
*   **Insights**: Profile Status, Verification Badge Status, Page Views, Phone click analytics, WhatsApp click analytics, Map click analytics.
*   **Management Controls**: Manage Business Profile details, Products, and Services.

### 👑 11. Admin Dashboard
Allows administrators to manage:
*   Users & Roles
*   Business registrations & Vetting queue
*   Service Providers listings
*   Directory categories
*   Vetting Approvals/Rejections
*   System-wide analytics and reports

### 🛡️ 12. Verification Module
*   Approve or Reject Businesses and Professionals.
*   Enforces/displays the **Verified** vs. **Unverified** badge status.

### 🏷️ 13. Category Management
*   **Business Categories**: Grocery, Hotel, Medical, Printing, Electronics, etc.
*   **Service Categories**: Electrician, Plumber, Advocate, Accountant, Developer, etc.

### ⚙️ 14. Settings Module
*   Business Settings
*   Notification Settings
*   Privacy and Password reset controls.

---

# Phase 1 Database Entities

*   **Users** (Auth profiles)
*   **Member Profiles** (Community profile details)
*   **Businesses** (Shops and commercial entities)
*   **Business Categories** (Taxonomy)
*   **Service Providers** (Freelancers and professionals)
*   **Service Categories** (Taxonomy)
*   **Products** (Catalog items - max 5 per business)
*   **Services** (Catalog items - max 5 per business)
*   **Business Gallery** (Media assets)
*   **Business Locations** (Addresses and map links)
*   **Analytics** (Interaction tracking logs)
*   **Verification Requests** (Approval requests backlog)

---

# Phase 1 Application Modules

### 📱 User App (Flutter)
*   Browse verified directory, run searches, view profiles, and access Call / WhatsApp / Maps CTAs.

### 📱 Vendor App (Flutter)
*   Register businesses, manage profiles, maintain up to 5 services/products, and view dashboard analytics.

### 💻 User Web (Next.js)
*   Public-facing directory site, unified search, and business profile/showcase pages.

### 💻 Admin Web (Next.js)
*   Verification dashboard, category taxonomy control, analytics logs, and user role management.

### 🔌 API Backend (Hono)
*   REST APIs, Authentication wrappers, business operations, unified search query handlers, analytics aggregation, and admin verification endpoints.

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
