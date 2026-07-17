import * as dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3001,
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/ezhavaclub",
  NODE_ENV: process.env.NODE_ENV || "development",
  SUPABASE_URL: process.env.SUPABASE_URL || "https://iaaoxxoabdwbbcbamcso.supabase.co",
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  // Email configuration
  EMAIL_ENABLED: process.env.EMAIL_ENABLED === "true",
  EMAIL_PROVIDER: (process.env.EMAIL_PROVIDER || "dev").toLowerCase(), // "dev" | "resend" | "smtp"
  EMAIL_FROM: process.env.EMAIL_FROM || "noreply@ezhavaclub.com",
  EMAIL_API_KEY: process.env.EMAIL_API_KEY || "",
  EMAIL_SMTP_HOST: process.env.SMTP_HOST || "",
  EMAIL_SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465,
  EMAIL_SMTP_SECURE: process.env.SMTP_SECURE === "true",
  EMAIL_SMTP_USER: process.env.SMTP_USER || "",
  EMAIL_SMTP_PASS: process.env.SMTP_PASSWORD || "",
};

// Validate that required SMTP fields are present when SMTP is configured
if (env.EMAIL_ENABLED && env.EMAIL_PROVIDER === "smtp") {
  if (!env.EMAIL_SMTP_HOST) {
    throw new Error("Missing SMTP_HOST configuration while SMTP provider is active.");
  }
  if (!env.EMAIL_SMTP_USER) {
    throw new Error("Missing SMTP_USER configuration while SMTP provider is active.");
  }
  if (!env.EMAIL_SMTP_PASS) {
    throw new Error("Missing SMTP_PASSWORD configuration while SMTP provider is active.");
  }
}


