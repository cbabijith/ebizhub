# Feature 04 — Service Provider Management

This feature allows verified community members to register and manage their professional service provider profiles, portfolios, skills, and service areas.

## Database Schema

### `service_providers`
- `id` (uuid, primary key)
- `profileId` (uuid referencing `profiles.id`)
- `memberId` (uuid referencing `members.id`)
- `serviceCategoryId` (integer referencing `service_categories.id`)
- ...other profile info columns

### `service_provider_portfolio`
- `id` (uuid, primary key)
- ...portfolio image/certificate details

### `service_provider_skills`
- `id` (uuid, primary key)
- ...skills and experience details

### `service_provider_areas`
- `id` (serial)
- ...district/panchayat details

### `provider_analytics` & `provider_interaction_logs`
- Used for tracking profile views.

---

## API Endpoints

### Service Providers
- `POST /v1/providers` — Register provider profile (authenticated)
- `GET /v1/providers/me` — Get own provider profile (authenticated)
- `PUT /v1/providers/:id` — Update own provider profile (authenticated)
- `DELETE /v1/providers/:id` — Soft delete own profile (authenticated)
- `PATCH /v1/providers/:id/status` — Admin update status (admin-only)

### Public Directory & Search
- `GET /v1/service-providers` — List active, verified providers (public)
- `GET /v1/service-providers/:id` — Public profile details (public)
- `GET /v1/service-providers/search` — Search providers (public)

### Portfolios, Skills & Areas
- `POST /v1/portfolio` — Add portfolio item
- `PUT /v1/portfolio/:id` — Update portfolio item
- `DELETE /v1/portfolio/:id` — Soft delete portfolio item
- `POST /v1/provider-skills` — Add skill
- `POST /v1/service-areas` — Add area
