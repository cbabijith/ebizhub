import { z } from "zod";

export const trackClickSchema = z.object({
  action: z.enum(["phone_click", "whatsapp_click", "map_click"]),
});
