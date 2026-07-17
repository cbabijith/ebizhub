# Project-Scoped Agent Guidelines & Rules

Welcome to the **EzhavaClub (eBizHub)** codebase development agent rules. These guidelines govern code style, database design, architecture patterns, and business constraints for this workspace.

---

## 🏁 EBizHub Phase 1 – Admin Panel Development Notes

### Objective
The primary objective of Phase 1 is **not** to build a large enterprise admin panel.
The goal is to **collect, verify, organize, and publish as much community information as possible**, making it searchable and discoverable by every community member.

### Core Goals
1. Register every community member.
2. Register every business.
3. Register every service provider.
4. Verify the information.
5. Publish verified information to the public website and mobile app.
6. Build a searchable digital community directory.

### Build Only the Core Admin Modules
1. **Dashboard**: Platform growth stats (Total Members, Businesses, Providers, Pending Verifications, Recently Added). No complex analytics.
2. **Member Management (Highest Priority)**: Complete profile CRUD, soft deletes, and verification.
3. **Business Management**: directory list, verification queue, search, filters.
4. **Service Provider Management**: verified professional listing list, search, filters.
5. **Categories**: Simple Business & Service categories. No nesting.
6. **Community Content**: Basic CRUD for News, Events, Jobs, Offers, Notices.
7. **Banner Management**: Home & Ad banners.
8. **Admin Profile**: Profile edits, password changes.

### Modules NOT Required in Phase 1 (Do not spend development time on these yet)
* Reports & Advanced Analytics, Audit Logs, Email Template Builder.
* Multiple Admin Roles & Permission Management.
* Membership Plans, Subscription Systems, Payment Gateways, Wallets, Marketplace.
* AI Features, Chat System, Advanced Notifications, ERP Integrations.

### Development Philosophy
Every screen should answer one question:
**"Does this help us collect, verify, manage, or display community information?"**
If the answer is **No**, postpone it. Simplicity, speed, data quality, and easy verification are key.

---

## 1. Core Business Rules & Constraints

When modifying or building features for the client apps or backend:
- **Maximum 5 Services/Products**: A vendor is strictly capped at a maximum of 5 products or services in the database. Ensure backend validations (`apps/api`) and frontend UI controls enforce this.
- **Direct-to-Customer Contact Options**: Always display Contact, WhatsApp, and Google Map buttons on business/service details pages.
- **Analytics & Event Tracking**: Track every profile visit, and every click on Contact, WhatsApp, and Google Map. Write tracking logs to the database or send them to the analytics endpoint of `apps/api`.
- **Verified Status**: Vendors must be vetted/verified by the admin before their listings appear in the main feed of `user-web` and `user-app`.
- **Three-Layer Identity Architecture**: Ensure all profile models strictly follow: `Supabase Auth` (credentials) ──> `profiles` (generic identity) ──> `members` (community-specific details). Never allow client profile updates to directly modify community/admin status, branch assignments, joined date, or membership IDs. Use Zod parsing to strip protected parameters.

---

## 2. Technical Code Guidelines

### Backend (`apps/api` - Hono + Drizzle)
- Use **Drizzle ORM** for database interaction.
- Keep schemas defined in `apps/api/src/database/schema.ts`.
- Place routes, validation, and business logic organized cleanly under `apps/api/src/`.
- Import local modules with explicit `.js` extensions (e.g. `import { db } from "./config/database.js"`).

### Next.js Client Apps (`apps/admin-web`, `apps/user-web`)
- Use Next.js 14 App Router layout structure.
- Style using Tailwind CSS. Use semantic components where possible.
- Use Supabase Auth for authorization and identity.

### Flutter Mobile Apps (`apps/admin-app`, `apps/user-app`)
- Use clean Dart formatting and package structures.
- Follow the state management pattern defined in the mobile projects (Provider/Riverpod).

---

## 3. Workflow Constraints
- Always perform local validation/compilation after modifying TypeScript files by running `bun run tsc --noEmit` or `bun run build`.
- Avoid triggering native builders like `turbo` if they SIGSEGV in sandbox environment; build packages directly.
- **README Updates**: After completing any task or implementing a change, always update the project `README.md` to reflect the latest changes, features, or architectural adjustments.

