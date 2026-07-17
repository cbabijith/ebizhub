import { z } from "zod";

export const noticeSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required"),
  noticeType: z.enum(["lost_documents", "blood_needed", "emergency", "meeting_notice", "volunteer_request"]),
  priority: z.enum(["normal", "high", "critical"]).optional().default("normal"),
  branchId: z.string().uuid("Invalid branch ID").optional().nullable(),
  expiresAt: z.string().datetime("Invalid expiresAt ISO format").optional().nullable(),
  status: z.enum(["active", "archived"]).optional().default("active"),
});
