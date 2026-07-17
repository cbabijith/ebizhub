// ─── Supported email types ────────────────────────────────────────────────────
export const EMAIL_TYPES = [
  "welcome",
  "business-verification",
  "provider-verification",
  "password-reset",
  "event-registration",
  "job-application",
  "contact-form",
  "account-status-update",
] as const;

export type EmailType = typeof EMAIL_TYPES[number];

// ─── Default HTML templates ───────────────────────────────────────────────────
// These are used as seed defaults. Admins can override via the DB.
export const DEFAULT_TEMPLATES: Record<EmailType, { subject: string; htmlBody: string; textBody: string; variables: string[] }> = {
  welcome: {
    subject: "Welcome to EzhavaClub — {{name}}",
    htmlBody: `<h1>Welcome, {{name}}!</h1><p>Your account has been created. Email: {{email}}</p>`,
    textBody: "Welcome {{name}}! Your account has been created. Email: {{email}}",
    variables: ["name", "email"],
  },
  "business-verification": {
    subject: "Your business \"{{businessName}}\" has been {{status}}",
    htmlBody: `<h1>Business Verification Update</h1><p>Hi {{name}}, your business <strong>{{businessName}}</strong> status is now: <strong>{{status}}</strong>.</p>{{#if notes}}<p>Notes: {{notes}}</p>{{/if}}`,
    textBody: "Hi {{name}}, your business {{businessName}} status is now: {{status}}.",
    variables: ["name", "businessName", "status", "notes"],
  },
  "provider-verification": {
    subject: "Your provider profile has been {{status}}",
    htmlBody: `<h1>Provider Verification Update</h1><p>Hi {{name}}, your provider profile status is now: <strong>{{status}}</strong>.</p>`,
    textBody: "Hi {{name}}, your provider profile status is now: {{status}}.",
    variables: ["name", "status"],
  },
  "password-reset": {
    subject: "Reset your EzhavaClub password",
    htmlBody: `<h1>Password Reset</h1><p>Hi {{name}}, click below to reset your password. This link expires in {{expiresIn}}.</p><p><a href="{{resetLink}}">Reset Password</a></p>`,
    textBody: "Hi {{name}}, reset your password: {{resetLink}} (expires in {{expiresIn}})",
    variables: ["name", "resetLink", "expiresIn"],
  },
  "event-registration": {
    subject: "Registration confirmed — {{eventTitle}}",
    htmlBody: `<h1>You're registered!</h1><p>Hi {{name}}, your registration for <strong>{{eventTitle}}</strong> on {{eventDate}} is confirmed.</p>`,
    textBody: "Hi {{name}}, registered for {{eventTitle}} on {{eventDate}}.",
    variables: ["name", "eventTitle", "eventDate"],
  },
  "job-application": {
    subject: "Application submitted — {{jobTitle}}",
    htmlBody: `<h1>Application Received</h1><p>Hi {{name}}, we received your application for <strong>{{jobTitle}}</strong> at {{businessName}}.</p>`,
    textBody: "Hi {{name}}, application received for {{jobTitle}} at {{businessName}}.",
    variables: ["name", "jobTitle", "businessName"],
  },
  "contact-form": {
    subject: "New contact message from {{senderName}}",
    htmlBody: `<h1>Contact Form Submission</h1><p><strong>From:</strong> {{senderName}} ({{senderEmail}})</p><p><strong>Message:</strong><br/>{{message}}</p>`,
    textBody: "Contact from {{senderName}} ({{senderEmail}}): {{message}}",
    variables: ["senderName", "senderEmail", "message"],
  },
  "account-status-update": {
    subject: "Your EzhavaClub account status has been updated",
    htmlBody: `<h1>Account Status Update</h1><p>Hi {{name}}, your account status is now: <strong>{{status}}</strong>.</p>{{#if reason}}<p>Reason: {{reason}}</p>{{/if}}`,
    textBody: "Hi {{name}}, your account status is now {{status}}.",
    variables: ["name", "status", "reason"],
  },
};

// ─── Variable interpolation ───────────────────────────────────────────────────
// Only replaces {{var}} patterns. Does not execute code. Safe substitution.
export function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}
