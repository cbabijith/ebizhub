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
4. **Feature 04: Service Providers** — ✅ Sprint 1 Complete
5. **Feature 05: Search & Discovery** — ⏳ Not Started
6. **Feature 06: Verification Queue** — ⏳ Not Started
7. **Feature 07: Analytics Dashboard** — ⏳ Not Started

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
│       └── business/           # Module 3
│           ├── categories/
│           ├── businesses/
│           ├── gallery/
│           ├── products/
│           ├── services/
│           ├── verification/
│           ├── search/
│           └── analytics/
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
```
*(Ensure the backend server is running and configured with correct Supabase environment variables beforehand).*
