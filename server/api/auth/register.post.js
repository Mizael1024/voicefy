import { userActions } from "~/server/services/db/UserActions";
import { sanitizeUser } from "~/server/utils/auth";
import { registerationSchema } from "~/server/validations/users";
import { hashPassword } from "~/server/utils/hash";
import { generateEmailVerificationCode, generateOneTimePassword } from "~/server/utils/auth";
import { OneTimePasswordTypes } from "~/server/database/schema";
import { useEmail } from "~/server/services/email";
import { renderOtpTemplate } from "~/server/utils/email-templates";

const { fromEmail, emailProvider } = useRuntimeConfig();
const { baseUrl } = useRuntimeConfig().public;

async function handleUserValidation(email) {
  const existingUser = await userActions.findUserByEmail(email);
  if (existingUser) {
    throw createError({
      statusCode: 400,
      statusMessage: "User already exists",
    });
  }
}

async function createUser({ email, name, password }) {
  const hashedPassword = await hashPassword(password);
  return await userActions.createUserWithPassword({
    email,
    name,
    hashedPassword,
  });
}

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
  try {
    const { email, name, password } = await readValidatedBody(event, (body) =>
      registerationSchema.parse(body),
    );
    await handleUserValidation(email);
    const user = await createUser({ email, name, password });
    const emailVerificationCode = await generateEmailVerificationCode(user.id);
    const oneTimePassword = await generateOneTimePassword(
      user.id,
      email,
      OneTimePasswordTypes.signup,
    );
    await sendVerificationEmail(email, oneTimePassword, emailVerificationCode);
    setResponseStatus(event, 201);
    return sanitizeUser(user);
  } catch (error) {
    console.log(error);
    throw error.statusCode
      ? error
      : createError({
          statusCode: 500,
          statusMessage: "Internal Server Error",
        });
  }
});
