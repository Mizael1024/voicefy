import { sqliteTable, text, integer, uniqueIndex, blob } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";
import { SubscriptionStatus } from "../../server/services/payment/types";

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$default(() => createId()),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "boolean" }).notNull().default(false),
  role: text("role").notNull().default(UserRole.USER),
  name: text("name").notNull(),
  avatarUrl: text("avatarUrl"),
  hashedPassword: text("hashedPassword"),
  banned: integer("banned", { mode: "boolean" }).notNull().default(false),
  bannedReason: text("bannedReason"),
  onboarded: integer("onboarded", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$default(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdate(() => new Date()),
  lastActive: integer("last_active", { mode: "timestamp" }).$onUpdate(() => new Date()),
});

export const credentials = sqliteTable("credentials", {
  id: text("id")
    .primaryKey()
    .$default(() => createId()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name"),
  externalID: text("external_id").unique().notNull(),
  publicKey: blob("public_key", { mode: "buffer" }).unique().notNull(),
  signCount: integer("sign_count").default(0).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$default(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdate(() => new Date()),
});

export const oauthAccounts = sqliteTable(
  "oauth_accounts",
  {
    id: text("id")
      .primaryKey()
      .$default(() => createId()),
    providerId: text("providerId").notNull(),
    providerUserId: text("providerUserId").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" }).$default(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdate(() => new Date()),
  },
  (table) => ({
    uniqueProviderUser: uniqueIndex("unique_provider_user").on(
      table.providerId,
      table.providerUserId,
    ),
  }),
);

export const images = sqliteTable("images", {
  id: text("id")
    .primaryKey()
    .$default(() => createId()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  publicUrl: text("publicUrl"),
  createdAt: integer("created_at", { mode: "timestamp" }).$default(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdate(() => new Date()),
});

export const subscriptions = sqliteTable("subscriptions", {
  id: text("id")
    .primaryKey()
    .$default(() => createId()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  customerId: text("customerId").notNull(),
  status: text("status").notNull().default(SubscriptionStatus.TRIALING),
  planId: text("planId").notNull(),
  variantId: text("variantId").notNull(),
  paymentProvider: text("paymentProvider").notNull(),
  nextPaymentDate: integer("nextPaymentDate", { mode: "timestamp" }).notNull(),
});

export const emailVerificationCodes = sqliteTable("email_verification_codes", {
  id: integer("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  code: integer("code").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

export const passwordResetTokens = sqliteTable("password_reset_tokens", {
  id: integer("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  code: integer("code").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

export enum OneTimePasswordTypes {
  signup = "SIGNUP",
  login = "LOGIN",
  forgotPassword = "FORGOT_PASSWORD",
}

export const oneTimePasswords = sqliteTable("one_time_passwords", {
  id: text("id")
    .primaryKey()
    .$default(() => createId()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  identifier: text("identifier").notNull(),
  code: text("code").notNull(),
  type: text("type").notNull().default(OneTimePasswordTypes.signup),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

export const posts = sqliteTable("posts", {
  id: text("id")
    .primaryKey()
    .$default(() => createId()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$default(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdate(() => new Date()),
});

export const waitlist = sqliteTable("waitlist", {
  id: text("id")
    .primaryKey()
    .$default(() => createId()),
  email: text("email").notNull().unique(),
  referrer: text("referrer"),
  createdAt: integer("created_at", { mode: "timestamp" }).$default(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdate(() => new Date()),
});

export type SelectUser = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type SelectOauthAccount = typeof oauthAccounts.$inferSelect;
export type InsertOauthAccount = typeof oauthAccounts.$inferInsert;
export type SelectSubscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;
export type SelectEmailVerificationCode = typeof emailVerificationCodes.$inferSelect;
export type InsertEmailVerificationCode = typeof emailVerificationCodes.$inferInsert;
export type SelectOneTimePassword = typeof oneTimePasswords.$inferSelect;
export type InsertOneTimePassword = typeof oneTimePasswords.$inferInsert;
export type SelectPost = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;
export type OneTimePassword = keyof typeof OneTimePasswordTypes;
