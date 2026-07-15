import { z } from "zod";

export const verificationSchema = z.object({
  remarks: z.string().max(1000, "Remarks must be under 1000 characters").optional().nullable(),
});
