import { emailVerificationSchema } from "~/server/validations/users";
import { userActions } from "~/server/services/db/UserActions";
import { generateResetPasswordToken } from "~/server/utils/auth";
import { useEmail } from "~/server/services/email";
const { fromEmail, emailProvider } = useRuntimeConfig();
const { baseUrl } = useRuntimeConfig().public;
const SUBJECT = "Supersaas Essentials - Reset Password";

async function sendPasswordResetEmail(email, resetPasswordToken) {
  const emailOptions = {
    to: email,
    from: fromEmail,
    subject: SUBJECT,
    html: `Here's your reset password link: <a href="${baseUrl}/auth/reset-password?token=${resetPasswordToken}">${baseUrl}/auth/reset-password?token=${resetPasswordToken}</a>`,
  };
  if (import.meta.dev) {
    console.table(emailOptions);
  } else {
    await useEmail(emailProvider).send(emailOptions);
  }
}

export default defineEventHandler(async (event) => {
  const { email } = await readValidatedBody(event, (body) => emailVerificationSchema.parse(body));

  const user = await userActions.findUserByEmail(email);
  if (!user) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email not found",
    });
  }
  if (!user.emailVerified) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email not verified",
    });
  }
  const resetPasswordToken = await generateResetPasswordToken(user.id);
  await sendPasswordResetEmail(user.email, resetPasswordToken);
  setResponseStatus(event, 201);
  return {
    status: "success",
    message: "Password reset link sent to your email",
  };
});
