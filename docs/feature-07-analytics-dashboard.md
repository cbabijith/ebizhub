# Feature 07 — Analytics Dashboard

**Version:** v1.0  
**Status:** ✅ COMPLETED  
**Module Paths:** `apps/api/src/features/business/analytics/`, `apps/api/src/features/service-providers/analytics/`, `apps/api/src/features/discovery/analytics/`

---

## Overview

The Analytics Dashboard tracks customer engagement with business and service-provider profiles. It records individual interaction events (profile views, phone clicks, WhatsApp clicks, map clicks) and keeps live aggregate counters so vendors and admins can view profile activity. Search analytics are also collected to surface popular queries.

## Tracked Events

| Action | Meaning |
|--------|---------|
| `profile_view` | Profile page was viewed |
| `phone_click` | Customer clicked the phone number |
| `whatsapp_click` | Customer clicked the WhatsApp action |
| `map_click` | Customer clicked the map / Google Maps action |
| `website_click` | Customer clicked the website link (discovery tracking) |
| `share_click` | Customer shared the profile (discovery tracking) |

---

## Database Schema

### `business_analytics`
- `id` (uuid, primary key)
- `businessId` (uuid → `businesses.id`, unique)
- `profileViews` (integer)
- `phoneClicks` (integer)
- `whatsappClicks` (integer)
- `mapClicks` (integer)
- `updatedAt` (timestamp)

### `provider_analytics`
- `id` (uuid, primary key)
- `providerId` (uuid → `service_providers.id`, unique)
- `profileViews` (integer)
- `phoneClicks` (integer)
- `whatsappClicks` (integer)
- `mapClicks` (integer)
- `updatedAt` (timestamp)

### `interaction_logs`
- `id` (uuid, primary key)
- `businessId` (uuid → `businesses.id`)
- `action` (enum: `profile_view`, `phone_click`, `whatsapp_click`, `map_click`)
- `ip` (text)
- `device` (text)
- `createdAt` (timestamp)

### `provider_interaction_logs`
- `id` (uuid, primary key)
- `providerId` (uuid → `service_providers.id`)
- `action` (enum)
- `ip` (text)
- `createdAt` (timestamp)

### `search_analytics`
- `id` (uuid, primary key)
- `keyword` (text)
- `resultCount` / `businessCount` / `providerCount` / `categoryCount` (integers)
- `ip` (text)
- `createdAt` (timestamp)

---

## API Endpoints

### Business Analytics — `/api/v1/business-analytics`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/:id/click` | Public | Record a click/view event for a business |
| `GET`  | `/:id/summary` | Owner / Admin | Get aggregate analytics for a business |

### Provider Analytics — `/api/v1/provider-analytics`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/:id/click` | Public | Record a click/view event for a provider |
| `GET`  | `/:id/summary` | Owner / Admin | Get aggregate analytics for a provider |

### Discovery Analytics — `/api/v1/discovery`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/businesses/:id/click` | Public | Track business interaction from discovery |
| `POST` | `/providers/:id/click` | Public | Track provider interaction from discovery |

### Search Analytics
- Recorded automatically by `GET /api/v1/discovery/search` and stored in `search_analytics`.

---

## Business Rules

- Click endpoints are public — no authentication required.
- Each valid action triggers a database transaction that:
  1. Inserts a row into the appropriate interaction log.
  2. Increments the matching aggregate counter (upsert pattern).
- Dashboard summary endpoints require authentication and are restricted to the profile owner or an admin.
- `map_click`, `phone_click`, `whatsapp_click`, and `profile_view` are the core tracked events for business/provider analytics; discovery analytics additionally accepts `website_click` and `share_click`.
- Search analytics are fire-and-forget and do not block search results.

---

## Response Formats

### Click Success (200)
```json
{
  "success": true,
  "message": "Interaction tracked successfully",
  "data": {},
  "meta": {}
}
```

### Summary Success (200)
```json
{
  "success": true,
  "message": "Analytics summary retrieved successfully",
  "data": {
    "businessId": "...",
    "profileViews": 120,
    "phoneClicks": 34,
    "whatsappClicks": 18,
    "mapClicks": 9,
    "updatedAt": "2026-07-17T..."
  },
  "meta": {}
}
```

### Error (400/403/404)
```json
{
  "success": false,
  "message": "Business not found",
  "errors": ["Business not found"]
}
```

---

## Tests

- `apps/api/tests/business-e2e.test.ts`
- `apps/api/tests/service-provider-e2e.test.ts`
- `apps/api/tests/discovery-e2e.test.ts`
