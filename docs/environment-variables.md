# Environment Variable Reference

The EBizHub backend and integrations rely on the following environment parameters. Configure these in `apps/api/.env` for local development.

---

## 📋 Environment Configuration Reference

| Parameter | Required? | Category | Secret? | Purpose / Default Value |
|---|---|---|---|---|
| `PORT` | Optional | API Server | No | Port on which the API server binds (default: `3001`). |
| `NODE_ENV` | Optional | API Server | No | active runtime context (`development` / `production`). |
| `DATABASE_URL` | **Yes** | Database | **Yes** | Fully qualified connection string for Supabase PostgreSQL. |
| `SUPABASE_URL` | **Yes** | Auth | No | Supabase project API gateway URL. |
| `SUPABASE_ANON_KEY` | **Yes** | Auth | No | Client gateway public token. |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Auth | **Yes** | Administrative bypass token for auth sync scripts. |
| `EMAIL_ENABLED` | Optional | Email | No | Set to `true` to enable live sending. Defaults to `false`. |
| `EMAIL_PROVIDER` | Optional | Email | No | Selects engine (`dev`, `smtp`, `resend`). Defaults to `dev`. |
| `EMAIL_FROM` | Optional | Email | No | Sender address (e.g. `info@abijithcb.com`). |
| `SMTP_HOST` | Conditionally | Email | No | SMTP relay address (e.g. `smtp.gmail.com`). |
| `SMTP_PORT` | Conditionally | Email | No | SMTP binding port (default: `465`). |
| `SMTP_SECURE` | Conditionally | Email | No | Set `true` for Port 465 (SSL), `false` otherwise. |
| `SMTP_USER` | Conditionally | Email | **Yes** | Authentication username (e.g., `info@abijithcb.com`). |
| `SMTP_PASSWORD` | Conditionally | Email | **Yes** | Gmail SMTP App Password. |
| `EMAIL_API_KEY` | Conditionally | Email | **Yes** | Resend API token. |

---

> [!WARNING]
> If `EMAIL_ENABLED=true` and `EMAIL_PROVIDER=smtp`, validation guards in `env.ts` will halt server startup if `SMTP_HOST`, `SMTP_USER`, or `SMTP_PASSWORD` are missing.

---

## 🔒 Secret Classification Guidelines
* **Database Connection Details** (`DATABASE_URL`): Must never be committed to Git.
* **SMTP Credentials** (`SMTP_PASSWORD`): Store locally in environment files that are ignored by Git. Never expose these variables in command line parameters or standard system outputs.
