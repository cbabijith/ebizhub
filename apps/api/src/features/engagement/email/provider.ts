import { env } from "../../../config/env.js";
import nodemailer from "nodemailer";

export interface EmailSendInput {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

export interface EmailSendResult {
  providerMessageId?: string;
  skipped?: boolean;
}

export interface EmailProvider {
  sendEmail(input: EmailSendInput): Promise<EmailSendResult>;
}

// ─── Dev provider: logs to console, never sends real emails ──────────────────
class DevEmailProvider implements EmailProvider {
  async sendEmail(input: EmailSendInput): Promise<EmailSendResult> {
    console.log("[EMAIL DEV] Would send email:", {
      to: input.to,
      subject: input.subject,
      preview: input.text?.slice(0, 80) ?? input.html?.slice(0, 80),
    });
    return { skipped: true };
  }
}

// ─── Resend provider ─────────────────────────────────────────────────────────
class ResendEmailProvider implements EmailProvider {
  async sendEmail(input: EmailSendInput): Promise<EmailSendResult> {
    if (!env.EMAIL_API_KEY) {
      throw new Error("EMAIL_API_KEY is not configured for Resend provider");
    }
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.EMAIL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });
    if (!res.ok) {
      throw new Error(`Resend delivery failed: HTTP ${res.status}`);
    }
    const data = await res.json() as { id?: string };
    return { providerMessageId: data.id };
  }
}

// ─── SMTP provider using nodemailer ──────────────────────────────────────────
class SmtpEmailProvider implements EmailProvider {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.EMAIL_SMTP_HOST,
      port: env.EMAIL_SMTP_PORT,
      secure: env.EMAIL_SMTP_SECURE, // true for 465, false for other ports
      auth: {
        user: env.EMAIL_SMTP_USER,
        pass: env.EMAIL_SMTP_PASS,
      },
    });
  }

  async sendEmail(input: EmailSendInput): Promise<EmailSendResult> {
    try {
      const info = await this.transporter.sendMail({
        from: env.EMAIL_FROM,
        to: input.to,
        subject: input.subject,
        text: input.text,
        html: input.html,
      });
      return { providerMessageId: info.messageId };
    } catch (err: any) {
      // Safe error wrapping without credential exposure
      throw new Error(`SMTP delivery failed: ${err.message || "Unknown SMTP error"}`);
    }
  }
}

// ─── Provider factory ─────────────────────────────────────────────────────────
export function getEmailProvider(): EmailProvider {
  if (!env.EMAIL_ENABLED) {
    return new DevEmailProvider();
  }
  switch (env.EMAIL_PROVIDER) {
    case "resend":
      return new ResendEmailProvider();
    case "smtp":
      return new SmtpEmailProvider();
    default:
      return new DevEmailProvider();
  }
}
