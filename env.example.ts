import { createEnv } from "@t3-oss/env-nuxt";
import { z } from "zod";

export const env = createEnv({
  server: {
    NUXT_SESSION_PASSWORD: z.string().min(32),
    NUXT_OAUTH_GOOGLE_CLIENT_ID: z.string(),
    NUXT_OAUTH_GOOGLE_CLIENT_SECRET: z.string(),
    NUXT_OAUTH_GITHUB_CLIENT_ID: z.string(),
    NUXT_OAUTH_GITHUB_CLIENT_SECRET: z.string(),
    RESEND_API_KEY: z.string(),
    BASE_URL: z.string(),
    STRIPE_SECRET_KEY: z.string(),
    STRIPE_PUBLIC_KEY: z.string(),
    STRIPE_WEBHOOK_SECRET: z.string(),
  },
});
