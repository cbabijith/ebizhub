import { z } from "zod";

export const eventBaseSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional().nullable(),
  banner: z.string().optional().nullable(),
  categoryId: z.string().uuid("Invalid category ID").optional().nullable(),
  organizerId: z.string().uuid("Invalid organizer ID").optional().nullable(),
  branchId: z.string().uuid("Invalid branch ID").optional().nullable(),
  venue: z.string().min(1, "Venue is required"),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  startDate: z.string().datetime("Invalid start date ISO format").transform(val => new Date(val)),
  endDate: z.string().datetime("Invalid end date ISO format").transform(val => new Date(val)),
  registrationStart: z.string().datetime("Invalid registration start ISO format").optional().nullable().transform(val => val ? new Date(val) : null),
  registrationEnd: z.string().datetime("Invalid registration end ISO format").optional().nullable().transform(val => val ? new Date(val) : null),
  maxParticipants: z.number().int().positive().optional().nullable(),
  entryFee: z.string().regex(/^\d+(\.\d+)?$/, "Invalid entry fee").optional().default("0"),
  contactPhone: z.string().optional().nullable(),
  contactEmail: z.string().email("Invalid contact email").optional().nullable(),
  status: z.enum(["upcoming", "ongoing", "completed", "cancelled"]).optional().default("upcoming"),
});

export const eventSchema = eventBaseSchema.refine(data => data.startDate < data.endDate, {
  message: "Start date must be before end date",
  path: ["endDate"],
});

export const eventRegistrationSchema = z.object({
  eventId: z.string().uuid("Invalid event ID"),
  paymentStatus: z.enum(["pending", "paid", "free"]).optional().default("free"),
  remarks: z.string().optional().nullable(),
});
