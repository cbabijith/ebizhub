# Project Overview

EBizHub (EzhavaClub) is a community-based digital directory platform designed to connect community members with verified local businesses, service providers, and professionals. It provides a central workspace for members to register, manage listings, explore job opportunities, publish and register for events, search categories, share links, bookmark, and review community operations.

---

## 👥 Main User Types & Roles

1. **Guest / Anonymous User**: Can browse verified businesses and service providers, search listings, and resolve share links.
2. **Customer / Registered Member**: A logged-in profile associated with a community branch. Can write reviews, rate listings, bookmark items, and add items to favorites.
3. **Vendor**: A member registered with special permissions to list and manage up to 5 products/services under a Business or Service Provider profile.
4. **Admin**: Oversees platform health. Responsible for member verification, listing approval/rejection, review moderation, email template editing, and viewing logs.

---

## 🛠️ Technology Stack

* **API Backend**: Hono (TypeScript, Node.js runtime)
* **Database ORM**: Drizzle ORM
* **Database Engine**: PostgreSQL (Supabase Connection Pooling)
* **Authentication**: Supabase Auth (JWT verification)
* **Web Applications**: Next.js 14 App Router, Tailwind CSS, shadcn/ui
* **Mobile Applications**: Flutter (Dart, Provider/Riverpod state management)
* **Email Provider**: NodeMailer (SMTP support, fallback Dev logger)

---

## 📊 Application Implementation Status Matrix

The following table reflects the actual status of the workspace components as of **July 17, 2026**:

| Module / Feature | Backend API Status | Admin Web Status | User Web Status | Mobile App Status | Notes / Constraints |
|---|---|---|---|---|---|
| **01: Auth & Identity** | ✅ Complete | ⏳ Skeleton Only | ⏳ Skeleton Only | ⏳ Skeleton Only | Supabase JWT Verification. |
| **02: Member Profile** | ✅ Complete | ⏳ Skeleton Only | ⏳ Skeleton Only | ⏳ Skeleton Only | Profile branch validation. |
| **03: Business Management** | ✅ Complete | ⏳ Skeleton Only | ⏳ Skeleton Only | ⏳ Skeleton Only | ⚠️ Vendor strictly capped at max 5 products/services. |
| **04: Service Providers** | ✅ Complete | ⏳ Skeleton Only | ⏳ Skeleton Only | ⏳ Skeleton Only | Provider skill/portfolio. |
| **05: Discovery Platform** | ✅ Complete | ⏳ Skeleton Only | ⏳ Skeleton Only | ⏳ Skeleton Only | Caching & sorting. |
| **06: Verification Queue** | ✅ Complete | ⏳ Skeleton Only | ⏳ Skeleton Only | ⏳ Skeleton Only | Admin status controls. |
| **07: Analytics Dashboard**| ✅ Complete | ⏳ Skeleton Only | ⏳ Skeleton Only | ⏳ Skeleton Only | Page view & click count logs. |
| **Engagement: Favorites** | ✅ Complete | ⏳ Skeleton Only | ⏳ Skeleton Only | ⏳ Skeleton Only | Business & provider likes. |
| **Engagement: Ratings** | ✅ Complete | ⏳ Skeleton Only | ⏳ Skeleton Only | ⏳ Skeleton Only | 1–5 range restriction. |
| **Engagement: Reviews** | ✅ Complete | ⏳ Skeleton Only | ⏳ Skeleton Only | ⏳ Skeleton Only | Reporting + Admin moderation. |
| **Engagement: Bookmarks** | ✅ Complete | ⏳ Skeleton Only | ⏳ Skeleton Only | ⏳ Skeleton Only | Restricted to news, event, job, offer. |
| **Engagement: Share Links** | ✅ Complete | ⏳ Skeleton Only | ⏳ Skeleton Only | ⏳ Skeleton Only | Cryptographic tokens (64-char hex). |
| **Engagement: Email** | ✅ Complete | ⏳ Skeleton Only | ⏳ Skeleton Only | ⏳ Skeleton Only | SMTP integration. |

---

## 🏁 Current MVP Scope & Known Gaps

* **Source of Truth**: The Backend API (`apps/api`) is 100% complete and verified by integration tests. 
* **Frontends (Web/Mobile)**: `apps/admin-web`, `apps/user-web`, `apps/admin-app`, and `apps/user-app` are **placeholder skeletons** containing basic boilerplate code, layouts, and main entry pages. They have not yet integrated with the REST API.
