// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    "@nuxt/ui",
    "@vueuse/nuxt",
    "nuxt-auth-utils",
    "@nuxt/fonts",
    "radix-vue/nuxt",
    "@nuxthub/core",
  ],
  runtimeConfig: {
    session: {
      maxAge: 60 * 60 * 24 * 7, // Session expires after 7 days
    },
    expectedOrigin: process.env.BASE_URL ?? "http://localhost:3000",
    expectedRPID: process.env.RPID ?? "localhost",
    fromEmail: process.env.FROM_EMAIL,
    emailProvider: process.env.EMAIL_PROVIDER,
    paymentProvider: process.env.PAYMENT_PROVIDER,
    storageProvider: process.env.STORAGE_PROVIDER,
    public: {
      baseUrl: process.env.BASE_URL,
    },
  },
  hub: {
    blob: true,
    database: true,
    remote: process.env.NUXT_HUB_REMOTE === "true" ? true : undefined,
  },
  compatibilityDate: "2024-07-04",
});
