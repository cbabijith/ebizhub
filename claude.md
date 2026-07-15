# Claude Developer Guide (EzhavaClub)

This guide provides instructions, commands, and rules for Claude (or other AI assistants) working on the EzhavaClub (eBizHub) project.

## Project Context
EzhavaClub is a community platform where community vendors can register their businesses and showcase up to 5 products or services. Customers can locate them and click to call, WhatsApp, or open Google Maps. Admins and vendors track engagement metrics via dashboards.

## Technology Stack
- **API Backend**: Hono, Node.js, Drizzle ORM, PostgreSQL (Supabase)
- **Web Clients**: Next.js 14, Tailwind CSS, shadcn/ui
- **Mobile Clients**: Flutter (Dart)
- **Package Manager**: pnpm (workspaces)

## Common Commands

### Dependency Management
- Install dependencies (ignoring native build script failures in sandboxes):
  ```bash
  pnpm install --ignore-scripts
  ```

### API Service (`apps/api`)
- Run Dev Server:
  ```bash
  pnpm --filter api dev
  ```
- Build & Typecheck:
  ```bash
  pnpm --filter api build
  ```
- Drizzle Schema Push:
  ```bash
  pnpm --filter api db:push
  ```
- Drizzle Studio:
  ```bash
  pnpm --filter api db:studio
  ```

### Web Projects (`apps/admin-web`, `apps/user-web`)
- Run Admin Web Dev:
  ```bash
  pnpm --filter admin-web dev
  ```
- Run User Web Dev:
  ```bash
  pnpm --filter user-web dev
  ```

## Business Logic Guardrails
- **Max 5 Services**: Any mutation endpoint that adds a product/service to a vendor profile must count existing records and prevent additions if the limit is exceeded.
- **Analytics Event Logging**: Clicks on contact links, map locations, and WhatsApp lines must trigger event-tracking dispatchers. Ensure analytics tables capture: `vendor_id`, `event_type` (`call`, `whatsapp`, `map`), and `timestamp`.
- **Admin Vetting**: Vendors require validation before listings become public.
- **Documentation Updates**: Always update the main `README.md` at the project root after finishing any task or implementing updates.

