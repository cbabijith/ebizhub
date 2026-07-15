# Feature 02: Member Profile

## Scope & Objectives

Every authenticated community member owns a rich digital identity profile. This module separates basic authentication from community/professional attributes, supporting regional geographical location attachments, skills tracking, avatar uploads, and dynamic weighted completion percentage calculation.

* **Status:** ✅ COMPLETED
* **Version:** v1.0
* **Completed Date:** 2026-07-15

---

## API Endpoints

All endpoints are prefix-namespaced under `/api/v1/member`.

### Protected Endpoints (Requires JWT Auth Token)
* `GET /api/v1/member/me` - Get own detailed member profile (combines personal, professional, regional, skills, and computes completion index).
* `PUT /api/v1/member/me` - Update own personal, professional, and regional profile details.
* `POST /api/v1/member/skills` - Add a skill to member profile (validated; maximum of 20 skills allowed).
* `DELETE /api/v1/member/skills/:id` - Delete a skill by mapping ID.
* `POST /api/v1/member/avatar` - Upload image file to update profile avatar.
* `GET /api/v1/member/:id` - Fetch public member profile (omits private fields like `email` and `phone` for security).

---

## Database Tables

* `public.profiles` - Primary user record (names, email, role, avatar).
* `public.members` - Community membership details (district, panchayat, occupation, company, bio).
* `public.member_skills` - Skills associated with a member.

---

## Profile Completion Weight Formula

Calculated dynamically in the service layer using the following weights:
* **Photo / Avatar:** 20%
* **Bio:** 10%
* **Occupation:** 10%
* **District:** 10%
* **Skills:** 20% (if the user has $\ge 1$ skill added)
* **Company:** 10%
* **Address / Panchayat:** 20%

Total Weight: 100%
