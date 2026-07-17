# Operations & Troubleshooting Guide

Common issues encountered during development or deployment, their causes, and how to resolve them.

---

## 🔌 API Fails to Start: Port Collision
* **Symptoms**: `Error: listen EADDRINUSE: address already in use :::3001`.
* **Cause**: Another process is already running on port 3001.
* **Fix**: Find and kill the process:
  ```bash
  lsof -i :3001
  kill -9 <PID>
  ```
  Alternatively, configure a different port:
  ```env
  PORT=3002
  ```

---

## 🗄️ Database Changes are Not Syncing
* **Symptoms**: Model fields are returning undefined, or insert queries are throwing database errors.
* **Cause**: Your local database schema is out of sync with the Drizzle TS mappings.
* **Fix**: Push the updated Drizzle schema mapping:
  ```bash
  bun run db:push
  ```

---

## 🔑 Supabase Authorization Failures
* **Symptoms**: API returns `401 Unauthorized` or JWT validation errors.
* **Cause**: The API's `SUPABASE_ANON_KEY` or `SUPABASE_URL` do not match the values configured in your client application.
* **Fix**: Verify your `.env` configuration against your Supabase dashboard settings.

---

## 📧 Email Delivery Failures
* **Symptoms**: Logs show email status = `failed`, or `nodemailer` throws connection timeout errors.
* **Cause**:
  * Outbound SMTP port blocking (common with host providers blocking port 25 or 587).
  * Wrong username or app password credentials.
* **Fix**:
  * Set `SMTP_PORT=465` and `SMTP_SECURE=true` to use standard SSL.
  * Verify that `SMTP_PASSWORD` is a Google App Password, not your standard Gmail account password.
