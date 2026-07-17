# Frontend Client Applications

This section outlines the layout, tech stack, and implementation status of the web and mobile frontend applications.

---

## 💻 Admin Web Application (`apps/admin-web`)
* **Tech Stack**: Next.js 14, React 18, Tailwind CSS, TS.
* **Layout Structure**: Utilizes Next.js App Router.
* **Current Status**: **Skeleton Only**. The directory contains default Tailwind layouts, basic styling, and home placeholders. No live API requests are integrated yet.
* **Implementation Plan**:
  1. **Admin Authentication**: Connect authentication pages to Supabase.
  2. **Layout & Dashboard**: Design sidebar navigation and dashboard landing page.
  3. **Verification Queue**: Implement list views for pending members, businesses, and provider approvals.
  4. **Listing Management**: Add CRUD forms to review businesses and service provider listings.
  5. **Moderation Queue**: Review flagged comments and delete rejected reviews.
  6. **Email Templates**: Configure editing interfaces for system email layouts.
  7. **Logs & Audits**: Read and query system email/activity logs.

---

## 🌐 User Web Application (`apps/user-web`)
* **Tech Stack**: Next.js 14, Tailwind CSS, TypeScript.
* **Current Status**: **Skeleton Only**. Boilerplate page setup with directory structures. No API integrations.
* **Implementation Plan**:
  1. Directory browsing feed (active business listings).
  2. Search filtering and category index selectors.
  3. User registration and branch assignment.
  4. User engagement actions: bookmarking, review submissions, and favorite toggles.

---

## 📱 Mobile Applications (`apps/admin-app`, `apps/user-app`)
* **Tech Stack**: Flutter, Dart.
* **State Management**: Provider / Riverpod ready.
* **Current Status**: **Skeleton Only**. Boilerplate packages with default `main.dart` files. No UI screens or networking packages implemented.
