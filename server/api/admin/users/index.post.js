import { adminActions } from "~/server/services/db/AdminActions";
import { userActions } from "~/server/services/db/UserActions";
import { sanitizeUser } from "~/server/utils/auth";
import { z } from "zod";
import { generateEmailVerificationCode, generateOneTimePassword } from "~/server/utils/auth";
import { OneTimePasswordTypes } from "~/server/database/schema";
import { useEmail } from "~/server/services/email";
import { renderOtpTemplate } from "~/server/utils/email-templates";
import { hashPassword } from "~/server/utils/hash";

const adminAddUserSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Must be at least 8 characters"),
  emailVerified: z.boolean().optional().default(false),
});

const { fromEmail, emailProvider } = useRuntimeConfig();
const { baseUrl } = useRuntimeConfig().public;

async function sendVerificationEmail(email, oneTimePassword, emailVerificationCode) {
  if (import.meta.dev) {
    // dev only
    console.table({ email, oneTimePassword, emailVerificationCode });
  } else {
    const html = renderOtpTemplate({
      logoUrl: "https://microbot.dev/logo.png",
      code: oneTimePassword,
      link: `${baseUrl}/api/auth/verify-email-token?token=${emailVerificationCode}`,
      domain: baseUrl,
      type: "verification",
    });
    const emailOptions = {
      to: email,
      from: fromEmail,
      subject: "Supersaas - Signup",
      html,
    };
    await useEmail(emailProvider).send(emailOptions);
  }
}

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  if (user.role !== "ADMIN") {
    throw createError({
      statusCode: 403,
      message: "You are not authorized to perform this action",
    });
  }

  const body = await readValidatedBody(event, (body) => adminAddUserSchema.parse(body));
  const { email, password, name, emailVerified } = body;
  const hashedPassword = await hashPassword(password);

  const existingUser = await userActions.findUserByEmail(email);
  if (existingUser) {
    throw createError({
      statusCode: 400,
      statusMessage: "User already exists",
    });
  }

  try {
    const newUser = await adminActions.createNewUser({
      email,
      name,
      hashedPassword,
      emailVerified,
    });
    const emailVerificationCode = await generateEmailVerificationCode(newUser.id);
    const oneTimePassword = await generateOneTimePassword(
      newUser.id,
      email,
      OneTimePasswordTypes.signup,
    );
    await sendVerificationEmail(email, oneTimePassword, emailVerificationCode);
    setResponseStatus(event, 201);
    return sanitizeUser(newUser);
  } catch (error) {
    console.error(error);
    throw createError({
      statusCode: 500,
      message: "Failed to create new user",
    });
  }
});
