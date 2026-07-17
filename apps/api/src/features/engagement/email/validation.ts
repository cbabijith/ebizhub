import { z } from "zod";
import { EMAIL_TYPES } from "./templates.js";

export const emailTypeEnum = z.enum(EMAIL_TYPES);

export const createTemplateSchema = z.object({
  templateKey: emailTypeEnum,
  subject: z.string().min(1).max(255),
  htmlBody: z.string().min(1).max(50000),
  textBody: z.string().max(50000).optional(),
  variables: z.array(z.string().regex(/^\w+$/, "Variable names must be alphanumeric")).max(20).optional(),
});

export const updateTemplateSchema = z.object({
  subject: z.string().min(1).max(255).optional(),
  htmlBody: z.string().min(1).max(50000).optional(),
  textBody: z.string().max(50000).optional(),
  variables: z.array(z.string().regex(/^\w+$/)).max(20).optional(),
  isActive: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, { message: "At least one field must be provided" });

export const sendEmailSchema = z.object({
  templateKey: emailTypeEnum,
  recipientEmail: z.string().email("Invalid email address"),
  recipientProfileId: z.string().uuid("Invalid profile UUID").optional(),
  variables: z.record(z.string(), z.string().max(1000)).optional(),
  idempotencyKey: z.string().max(255).optional(),
});

export const logQuerySchema = z.object({
  status: z.enum(["pending", "sent", "failed", "skipped"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
