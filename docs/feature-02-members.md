# Feature 02: Member Module

## Scope & Objectives

Build a comprehensive community directory profile management system under the **Three-Layer Identity Model**. This structure separates basic authentication from user profiles and community-specific attributes, supporting branch normalization, regional attachments, skills tracking, avatar uploads, and admin verification workflows.

* **Status:** ✅ COMPLETED
* **Version:** v1.0
* **Completed Date:** 2026-07-15

---

## Three-Layer Identity Architecture

```
  Supabase Auth (auth.users)    [Who can log in?]
              │
              ▼
    public.profiles             [Who is this user?]
              │
              ▼
    public.members              [What is their community relationship?]
```

---

## API Endpoints

### Member Directory Endpoints (`/api/v1/members`)
* `GET /api/v1/members/me` - Retrieve current user's combined three-layer profile (includes profile, member details, branch details, and profile completion index).
* `PUT /api/v1/members/me` - Update own personal, professional, and regional profile details.
* `POST /api/v1/members/skills` - Add a skill to member profile (validated; maximum of 20 skills allowed).
* `DELETE /api/v1/members/skills/:id` - Delete a skill by mapping ID.
* `POST /api/v1/members/avatar` - Upload image file to update profile avatar.
* `GET /api/v1/members/:id` - Fetch public member profile (omits private contact fields like `email` and `phone` for security).

### Admin Verification Endpoints (Admin Only)
* `POST /api/v1/members/:id/verify` - Approve verification status for a member (verified/rejected/pending).
* `POST /api/v1/members/:id/suspend` - Suspend a member's community status.

### Branch Directory Endpoints (`/api/v1/branches`)
* `GET /api/v1/branches` - Get directory list of all normalized branch definitions.
* `GET /api/v1/branches/:id/members` - List all members associated with a specific branch.

---

## Database Tables

* `public.profiles` - Primary user identity record (names, email, role, avatar).
* `public.members` - Community membership details (district, panchayat, branchId, joinedDate, verificationStatus, communityStatus, memberType).
* `public.member_skills` - Skills associated with a member.
* `public.branches` - Master branch definition registry.

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
