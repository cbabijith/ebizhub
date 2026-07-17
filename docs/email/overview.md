# Email Architecture & SMTP Setup

System-wide email dispatch is handled via a provider abstraction layer that ensures security and test safety.

---

## ✉️ Supported Email Types
* `welcome` — Welcome emails.
* `business-verification` — Business verification updates.
* `provider-verification` — Provider verification updates.
* `password-reset` — Password resets.
* `event-registration` — Event registration confirmations.
* `job-application` — Job application receipts.
* `contact-form` — Contact notifications.
* `account-status-update` — Account status modifications.

---

## 🛠️ Provider Abstraction
```typescript
export interface EmailProvider {
  sendEmail(input: {
    to: string;
    subject: string;
    html?: string;
    text?: string;
  }): Promise<{
    providerMessageId?: string;
    skipped?: boolean;
  }>;
}
```

---

## 🛡️ SMTP Security & Configuration

To integrate with your SMTP provider (e.g. Gmail using app passwords), edit the local `.env` variables. **Never commit actual credentials to Git.**

### Required Environment Configuration
```env
# apps/api/.env
EMAIL_ENABLED=true
EMAIL_PROVIDER=smtp
EMAIL_FROM=info@abijithcb.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=info@abijithcb.com
SMTP_PASSWORD=<set locally; never commit>
```

### Safety Rules
1. **Gmail App Passwords**: Do not use your normal Google Account password. Generate a 16-character App Password from Google Account settings.
2. **Environment Isolation**: Live emails are disabled by default. If `EMAIL_ENABLED` is omitted or set to `false`, the system uses `DevEmailProvider` which writes emails to the local console instead of dispatching them.
3. **No Secrets Logging**: The database log tables (`email_logs`) strictly record metadata only. They never store SMTP passwords, reset tokens, or request authorization headers.
4. **Test Safe**: During E2E tests, the test configuration disables email transmission. Emails are marked as `skipped` in the logs.
5. **Port Configuration**: Port `465` must be used with `SMTP_SECURE=true`.
