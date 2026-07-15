# Feature 01: Authentication & Identity

## Scope & Objectives

Build a secure identity system that allows users to register, authenticate, manage their account, and access the platform based on their assigned role.

* **Status:** ✅ COMPLETED
* **Version:** v1.0
* **Completed Date:** 2026-07-15

---

## API Endpoints

### Public Endpoints
* `POST /api/v1/auth/register` - Create a new user account (email/password, accepts terms). Synchronizes into local database `profiles` and `members` tables.
* `POST /api/v1/auth/login` - Authenticate using email and password. Returns access and refresh token.
* `POST /api/v1/auth/refresh` - Refresh current session using refresh token.
* `POST /api/v1/auth/forgot-password` - Send password reset email.
* `POST /api/v1/auth/reset-password` - Reset password.

### OTP (Authentication / Verification)
* `POST /api/v1/auth/send-otp` - Request SMS OTP.
* `POST /api/v1/auth/verify-otp` - Verify SMS OTP.

### Protected Endpoints (Requires JWT Bearer Token)
* `POST /api/v1/auth/logout` - Invalidate current session.
* `GET /api/v1/auth/me` - Retrieve current authenticated profile, role, and details.

---

## Database Schema & Entities

Authentication is managed externally by Supabase Auth (`auth.users`), which synchronizes with the public schema via the user's UUID:

* **Table:** `public.profiles`
  - `id`: UUID (Primary Key, matches `auth.users.id`)
  - `fullName`: Text (Not Null)
  - `phone`: Text (Optional)
  - `email`: Text (Unique, Not Null)
  - `avatar`: Text (Optional)
  - `role`: Enum ("admin", "vendor", "customer") (Default "customer")
  - `status`: Enum ("active", "inactive", "suspended") (Default "active")

---

## Standard Response Structures

All API responses follow the standard JSON structures:

### Success Responses (HTTP 200/201)
```json
{
  "success": true,
  "message": "Success message",
  "data": {},
  "meta": {}
}
```

### Error Responses (HTTP 400/401/403/500)
```json
{
  "success": false,
  "message": "Error classification description",
  "errors": ["Validation / system failure detail list"]
}
```
