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
    console.table({ email, resetPasswordToken });
  } else {
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

  const userId = getRouterParam(event, "id");
  const userRecord = await userActions.findUserByUserId(userId);
  if (!userRecord) {
    throw createError({
      statusCode: 400,
      message: "User not found",
    });
  }
  if (!userRecord.emailVerified) {
    throw createError({
      statusCode: 400,
      message: "User has not verified their email",
    });
  }
  const resetPasswordToken = await generateResetPasswordToken(userRecord.id);
  await sendPasswordResetEmail(userRecord.email, resetPasswordToken);
  setResponseStatus(event, 200);
  return {
    status: "success",
    message: "Password reset link sent to your email",
  };
});
