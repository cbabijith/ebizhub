# Authentication & Authorization

Authentication is delegated to Supabase Auth. The API backend parses and validates Supabase Json Web Tokens (JWT) using the official Supabase Client.

---

## 🔐 Identity Architecture: Three-Layer Identity

To prevent regular users from elevating their status or altering community credentials, all profile updates follow this strict flow:

```
Supabase Auth (Credentials)
  └── profiles (Generic Identity Table)
        └── members (Community-Specific Profile details: membership status, branch ID)
```

Clients cannot update protected properties (such as branch ID, joined dates, or roles) directly via public update profile endpoints. Changes to these parameters must be routed through distinct admin verification steps.

---

## 🎫 Token Verification & Context

Every authenticated request must provide a `Bearer <JWT_TOKEN>` string in the `Authorization` header.

The `authMiddleware` performs the following steps:
1. Validates the existence and format of the header.
2. Calls `supabase.auth.getUser(token)` to verify the signature and get user metadata.
3. Retrieves the user's `profile` record from the local `profiles` table.
4. Checks if the profile is `active` (rejects with `403` if suspended).
5. Populates the Hono context variables:
   * `c.get("user")` - Supabase user object.
   * `c.get("profile")` - Database profile record.
   * `c.get("role")` - Profile role (`admin`, `vendor`, `customer`).

---

## 🛡️ Authorization & Ownership Checks

### Require Role Middleware
Used to restrict paths to specific roles (e.g. `requireRole(["admin"])`):
```typescript
export function requireRole(allowedRoles: ("admin" | "vendor" | "customer")[]) {
  return async (c: Context, next: Next) => {
    const role = c.get("role");
    if (!role || !allowedRoles.includes(role)) {
      return errorResponse(c, "Forbidden: Insufficient permissions", [], 403);
    }
    await next();
  };
}
```

### Resource Ownership Checks
Before updating or deleting records (e.g., reviews, favorites, ratings, service providers, businesses), the service layer checks the creator of the resource:
```typescript
if (role !== "admin" && existing.createdBy !== profileId) {
  const err = new Error("Forbidden: You do not own this resource");
  (err as any).status = 403;
  throw err;
}
```
If the requesting user is not an `admin` and does not own the resource, a `403 Forbidden` error is thrown.
