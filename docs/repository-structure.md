# Repository Structure

EBizHub is organized as a monorepo containing multiple apps. The following directory structure details where files live and how code should be added.

---

## 📂 Directory Layout

```text
ebizhub/
├── apps/
│   ├── api/                    # Hono Backend API (FDD layout)
│   │   ├── drizzle/            # Sync/migration snapshot JSON files
│   │   ├── src/
│   │   │   ├── config/         # Database and auth config
│   │   │   ├── database/       # Schema definitions and migrations
│   │   │   ├── shared/         # Common middlewares, errors, responses, pagination
│   │   │   ├── features/       # Self-contained feature folders
│   │   │   │   ├── auth/
│   │   │   │   ├── members/
│   │   │   │   ├── business/
│   │   │   │   ├── service-providers/
│   │   │   │   ├── community/
│   │   │   │   ├── discovery/
│   │   │   │   └── engagement/  # Module 7: Favorites, Ratings, Reviews, Bookmarks, Share, Email
│   │   │   └── server.ts       # Server entry point
│   │   └── tests/              # E2E integration test suites
│   ├── admin-web/              # Admin Next.js Web App (Skeleton)
│   ├── user-web/               # User Next.js Web App (Skeleton)
│   ├── admin-app/              # Flutter Admin Mobile App (Skeleton)
│   └── user-app/               # Flutter User Mobile App (Skeleton)
├── docs/                       # Project documentation
├── package.json                # Root package workspace metadata
└── pnpm-workspace.yaml         # PNPM workspace configurations
```

---

## 📜 Coding & Naming Conventions

1. **Feature-Driven Development (FDD)**: Keep modules self-contained in `apps/api/src/features/<group>/<feature>/`. Each sub-feature must contain:
   * `routes.ts`: Maps paths to controller methods.
   * `controller.ts`: Parses Hono context parameters and manages JSON request/responses.
   * `service.ts`: Implements business validation rules.
   * `repository.ts`: Houses Drizzle queries and DB operations.
   * `validation.ts`: Zod schema declarations.
2. **File Import Extensions**: Always import local TypeScript files with explicit `.js` extensions (e.g. `import { db } from "./config/database.js"`).
3. **Database Schema Additions**: Schema files must be placed in `apps/api/src/database/schema/` using kebab-case naming (e.g. `share-links.ts`), exported from `apps/api/src/database/schema.ts`, and synced to the database using `bun run db:push`.
4. **Soft-Delete Rule**: Do not hard-delete rows for core entities. Set a `deletedAt` timestamp and filter with `isNull(table.deletedAt)`.
