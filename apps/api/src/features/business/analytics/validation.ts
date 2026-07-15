import { z } from "zod";

export const clickEventSchema = z.object({
  action: z.enum(["profile_view", "phone_click", "whatsapp_click", "map_click"]),
});
