# Feature 02: Member Management

## Scope & Objectives

Every authenticated user gets a complete community profile in the directory. This module allows members to retrieve and modify their personal details, professional descriptors, and geographical community assignments.

* **Status:** ✅ COMPLETED
* **Version:** v1.0
* **Completed Date:** 2026-07-15

---

## API Endpoints

All endpoints are namespaces under `/api/v1/members`.

### Protected Endpoints (Requires JWT Auth Token)
* `GET /api/v1/members/me` - Get own detailed member profile (combines personal, professional, regional details, and computes completion percentage).
* `PUT /api/v1/members/me` - Update own details (accepts `fullName`, `phone`, `avatar`, `occupation`, `company`, `bio`, `districtId`, `panchayatId`).
* `GET /api/v1/members/:id` - Fetch public member profile (omits private contact fields like `email` and `phone` for security).

---

## Profile Completion Calculation

The completion percentage is computed dynamically in the Service layer over 8 criteria fields:
1. Name (`profiles.fullName`)
2. Phone (`profiles.phone`)
3. Avatar URL (`profiles.avatar`)
4. Occupation (`members.occupation`)
5. Company (`members.company`)
6. Biography (`members.bio`)
7. District ID (`members.districtId`)
8. Panchayat ID (`members.panchayatId`)

Formula:
$$\text{Completion } \% = \text{Round}\left(\frac{\text{Count of non-null, non-empty fields}}{8} \times 100\right)$$
