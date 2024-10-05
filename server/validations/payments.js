import { z } from "zod";

export const checkoutLinkSchema = z.object({
  variantId: z.string(),
  redirectUrl: z.string().optional(),
});
