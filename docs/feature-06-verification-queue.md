# Feature 06 — Verification Queue

**Version:** v1.0  
**Status:** ✅ COMPLETED  
**Module Paths:** `apps/api/src/features/business/verification/`, `apps/api/src/features/service-providers/verification/`

---

## Overview

The Verification Queue manages the approval lifecycle for businesses and service providers. Vendors submit their profiles for verification; administrators review them and either approve or reject. Approval updates the entity's `verificationStatus` to `verified`, making it visible in public discovery endpoints. Rejection records the reason and keeps the profile out of public listings.

## Workflow

```
Vendor submits profile for review
        │
        ▼
  Status = pending
        │
        ▼
Admin reviews ──► approve ──► verified
           │
           └──── reject ───► rejected + remarks
```

---

## Database Schema

### `verification_requests`
- `id` (uuid, primary key)
- `businessId` (uuid → `businesses.id`)
- `submittedBy` (uuid → `profiles.id`)
- `status` (enum: `pending`, `approved`, `rejected`)
- `reviewedBy` (uuid → `profiles.id`)
- `reviewedAt` (timestamp)
- `remarks` (text)
- `createdAt` (timestamp)

### `provider_verification_requests`
- `id` (uuid, primary key)
- `providerId` (uuid → `service_providers.id`)
- `submittedBy` (uuid → `profiles.id`)
- `status` (enum: `pending`, `approved`, `rejected`)
- `reviewedBy` (uuid → `profiles.id`)
- `reviewedAt` (timestamp)
- `remarks` (text)
- `createdAt` (timestamp)

Both tables mirror the `verificationStatus` field on `businesses` and `service_providers`.

---

## API Endpoints

### Business Verification — `/api/v1/business-verification`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/:id/submit` | Vendor / Admin | Submit a business for verification |
| `GET`  | `/:id` | Vendor / Admin | Get verification history for a business |
| `POST` | `/:id/verify` | Admin | Approve business and log review |
| `POST` | `/:id/reject` | Admin | Reject business with optional remarks |

### Service Provider Verification — `/api/v1/provider-verification`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/submit` | Vendor / Admin | Submit a provider profile for verification |
| `GET`  | `/history/:providerId` | Vendor / Admin | Get verification history for a provider |
| `POST` | `/:id/approve` | Admin | Approve provider and update status |
| `POST` | `/:id/reject` | Admin | Reject provider with optional remarks |

---

## Business Rules

- Only the owner or an admin can submit a verification request.
- Admin-only actions: approve / reject.
- Submitting a business sets `verificationStatus` to `pending` and creates a `verification_requests` log.
- Submitting a provider sets `verificationStatus` to `pending` and creates a `provider_verification_requests` log.
- For providers, a pending request already in flight blocks a duplicate submission.
- Review actions update the request's `reviewedBy`, `reviewedAt`, `status`, and `remarks` and sync `verificationStatus` on the target entity.
- All endpoints require a valid JWT via `authMiddleware`.

---

## Response Formats

### Success (200/201)
```json
{
  "success": true,
  "message": "Business verification approved successfully",
  "data": { ...request log... },
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

Integration tests for verification flows are covered in:
- `apps/api/tests/business-e2e.test.ts`
- `apps/api/tests/service-provider-e2e.test.ts`
