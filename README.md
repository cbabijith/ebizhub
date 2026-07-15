# EzhavaClub (eBizHub) Monorepo

EzhavaClub is a community-based digital platform designed to connect businesses, service providers, and professionals within a specific community. It serves as a centralized hub where community members can register, discover local services, and network.

## Project Overview

The primary goal of EzhavaClub is to boost community commerce and connectivity. Vendors can showcase their offerings, while customers can easily find, contact, and navigate to local businesses.

## Business Modules & Features

### 🛡️ 1. Onboarding & Verification Module
*   **Vendor Registration**: Vendors can register their profiles, upload business descriptions, specify physical addresses, and provide contact details.
*   **Admin Vetting Pipeline**: All vendor submissions are initially marked as *Unverified*. They must be approved/vetted by an Admin before they appear in the public feeds.
*   **Authentication**: Secure authentication and identity flows powered by Supabase Auth.

### 📋 2. Business Profile & Directory Module
*   **Search & Discovery**: Customers can search and filter through the public business directory on `user-web` and `user-app`.
*   **Directory Listings**: Displays verified vendor business information (business name, description, category, and locations).

### 🛍️ 3. Catalog & Showcase Module
*   **Strict Listing Limits**: Vendors can add their products or services up to a **maximum of 5 items** to maintain quality and highlight core offerings.
*   **Product/Service Details**: Allows adding title, description, and key features for each of the 5 allowed items.

### 📞 4. Direct Customer Engagement Module
Allows customers to connect directly with the vendor with one click:
*   **Direct Dial**: Click-to-call vendor phone number.
*   **WhatsApp Chat**: Click-to-chat with a pre-filled WhatsApp message indicating interest.
*   **Google Maps Navigation**: Click-to-open map location for direct navigation to the physical store.

### 📊 5. Analytics & Interaction Tracking Module
Automatically tracks interactions in the database to compile reports:
*   **Profile Views**: Incremented every time a customer views a vendor profile.
*   **CTA Clicks**: Logged every time a customer clicks on the Call, WhatsApp, or Google Map buttons.
*   **Vendor Dashboard**: Displays views and click metrics to vendors so they can measure customer interest.
*   **Admin Dashboard**: Aggregates platform-wide engagement, vendor sign-ups, and activity logs.

---

## Detailed Functions by User Role

### 👑 Platform Administrators (Admin)
*   **Approve/Reject Listings**: Manage the verification queue for new vendor registration profiles.
*   **Audit Catalog Limits**: Enforce that vendors do not exceed the 5-item catalog limit.
*   **Monitor Analytics**: Access system-wide tracking logs for clicks, views, and sign-ups.

### 🏪 Vendors / Members
*   **Profile Management**: Update shop metadata, contact details, operating hours, and location.
*   **Catalog Management**: Add, edit, or remove up to 5 showcase services/products.
*   **View Shop Analytics**: Review the performance of their listings (how many customers called, clicked WhatsApp, or requested Map directions).

### 👥 End Customers
*   **Browse & Filter**: Find verified community businesses by service category or location.
*   **Get Directions**: Navigate to a shop directly using the built-in Google Maps link.
*   **Instant Connection**: Call the vendor or message them on WhatsApp with one click.

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

## Prerequisites

- **Node.js**: `>= 18.0.0`
- **pnpm**: `>= 9.0.0` (Recommended)
- **Flutter**: `>= 3.0.0`
- **Dart**: `>= 3.0.0`

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
