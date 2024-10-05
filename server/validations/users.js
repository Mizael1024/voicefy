import { z } from "zod";
const OneTimePasswordTypes = {
  signup: "SIGNUP",
  login: "LOGIN",
  forgotPassword: "FORGOT_PASSWORD",
};

export const registerationSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255),
  password: z.string().min(8),
});

export const updateUserSchema = z
  .object({
    name: z.string().min(1).optional(),
    password: z.string().min(8).optional(),
    avatarUrl: z.string().optional(),
  })
  .refine((data) => data.name || data.password || data.avatarUrl, {
    message: "Nothing to update",
  });

export const updatePasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const userIdSchema = z.object({
  userId: z.string().min(1).max(255),
});

export const loginWithPasswordSchema = z.object({
  email: z
    .string()
    .email()
    .min(1)
    .max(255)
    .transform((v) => v.toLowerCase()),
  password: z.string().min(8).max(255),
});

export const emailVerificationSchema = z.object({
  email: z.string().email(),
});

export const forgotPasswordSchema = z.object({
  code: z.string(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const emailCodeVerificationSchema = z.object({
  token: z.string(),
});

export const otpVerificationSchema = z.object({
  email: z
    .string()
    .email()
    .min(1)
    .max(255)
    .transform((v) => v.toLowerCase()),
  code: z.string().length(6),
  type: z.enum(Object.values(OneTimePasswordTypes)),
});

export const passkeyVerificationSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255),
  verification: z.any().optional(),
  authenticationResponse: z.any().optional(),
});

export const passkeyLoginSchema = z.object({
  email: z.string().email(),
  challenge: z.string(),
  authenticationResponse: z.any().optional(),
});
