# EzhavaClub (eBizHub) Agent Guidelines & Architecture Manual

## Project Overview
EzhavaClub is a community-based digital directory platform designed to connect community members with verified local businesses, service providers, and professionals.

## Technology Stack
- **API Backend**: Hono (TypeScript, Node.js / Bun runtime)
- **Database ORM**: Drizzle ORM
- **Database Engine**: PostgreSQL (Supabase Connection Pooling)
- **Authentication**: Supabase Auth (JWT verification)
- **Web Applications**: Next.js 14 App Router, Tailwind CSS, shadcn/ui
- **Mobile Applications**: Flutter (Dart, Provider/Riverpod)

---

## Feature List & Status

1. **Feature 01: Authentication & Identity** — ✅ Completed v1.0
2. **Feature 02: Member Profile** — ✅ Completed v2.5
3. **Feature 03: Business Management** — ✅ Completed v2.0
4. **Feature 04: Service Providers** — ✅ Completed v4.0
5. **Feature 05: Search & Discovery** — ⚠️ Functionally complete; production hardening pending v1.1
6. **Feature 06: Verification Queue** — ✅ Completed v1.0
7. **Feature 07: Analytics Dashboard** — ✅ Completed v1.0
8. **Feature 08: Frontend & Mobile Apps** — ⏳ Not Started (skeleton only)

---

## Folder Structure (FDD Layout)

```text
apps/api/
├── src/
│   ├── app.ts                  # Middlewares and router config
│   ├── routes.ts               # Versioned root api routes mapping
│   ├── server.ts               # Server entry point
│   ├── config/                 # Database and Supabase clients config
│   ├── database/               # Schemas and Drizzle migration scripts
│   ├── shared/                 # Common middlewares, errors, responses
│   └── features/               # Self-contained feature folders
│       ├── auth/               # Module 1
│       ├── members/            # Module 2
│       ├── business/           # Module 3
│       │   ├── categories/
│       │   ├── businesses/
│       │   ├── gallery/
│       │   ├── products/
│       │   ├── services/
│       │   ├── verification/
│       │   ├── search/
│       │   └── analytics/
│       ├── service-providers/  # Module 4
│       │   ├── service-categories/
│       │   ├── providers/
│       │   ├── portfolio/
│       │   ├── provider-skills/
│       │   ├── service-areas/
│       │   ├── search/
│       │   ├── public/
│       │   ├── verification/
│       │   └── analytics/
│       └── discovery/          # Module 5
│           ├── home/
│           ├── business-directory/
│           ├── provider-directory/
│           ├── search/
│           ├── categories/
│           ├── analytics/
│           ├── featured/
│           ├── recommendations/
│           ├── trending/
│           ├── recent/
│           └── popular-categories/
```

---

## Coding Conventions

### 1. Feature-Driven Development (FDD) Pattern
Keep capabilities self-contained inside feature folders:
- `routes.ts`: Maps paths to controller methods.
- `controller.ts`: Parses query/body params and formats responses.
- `service.ts`: Houses business rules, checks, and limitations.
- `repository.ts`: Performs raw database interactions using Drizzle.
- `validation.ts`: Declares Zod schemas.

### 2. Strict Zod & Parameter Valids
All client payloads must go through schema-based validation. Route parameters containing `:id` must use the `validateParamId` UUID validation middleware to prevent SQL issues or crashes.

### 3. Soft Deletes
Never hard-delete primary entities. Set the `deletedAt` field to the current date/time and update status fields to `inactive`. Filter reads using `isNull(table.deletedAt)`.

### 4. Ownership Checks
Enforce ownership controls on write operations. Vendors/members can only modify resources they own unless bypassed by an `admin` role check.

### 5. Bun Runtime & Command Prefers
Always prefer utilizing `bun` CLI utilities for execution, TS/TSX compiling, and testing commands:
- Generate Drizzle migrations: `bun node_modules/drizzle-kit/bin.cjs generate`
- Run typechecking: `bun run tsc --noEmit`
- Run test files: `bun test tests/business-e2e.test.ts`

---

## Testing Instructions

To run integration/E2E test files inside `apps/api/tests/`:
```bash
~/.bun/bin/bun test tests/business-e2e.test.ts
~/.bun/bin/bun test tests/service-provider-e2e.test.ts
~/.bun/bin/bun test tests/discovery-e2e.test.ts
```
*(Ensure the backend server is running and configured with correct Supabase environment variables beforehand).*

## Current Implementation Notes

- Backend API features 01–07 are implemented and wired in `apps/api/src/routes.ts`.
- Web and mobile client applications under `apps/admin-web/`, `apps/user-web/`, `apps/admin-app/`, and `apps/user-app/` are generated skeletons with placeholder home screens only.
- Database migrations folder does not yet exist; use `bun node_modules/drizzle-kit/bin.cjs push` (or `bun run db:push` inside `apps/api`) to sync schema changes.
