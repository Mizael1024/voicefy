import { userActions } from "~/server/services/db/UserActions";
import { emailVerificationSchema } from "~/server/validations/users";
import { generateEmailVerificationCode, generateOneTimePassword } from "~/server/utils/auth";
import { useEmail } from "~/server/services/email";
import { renderOtpTemplate } from "~/server/utils/email-templates";

const { fromEmail, emailProvider } = useRuntimeConfig();
const { baseUrl } = useRuntimeConfig().public;

async function sendOtpEmail(email, oneTimePassword, emailVerificationCode) {
  if (import.meta.dev) {
    // dev only
    console.table({ email, oneTimePassword, emailVerificationCode });
  } else {
    const html = renderOtpTemplate({
      logoUrl: "https://microbot.dev/logo.png",
      code: oneTimePassword,
      link: `${baseUrl}/api/auth/verify-email-token?token=${emailVerificationCode}`,
      domain: baseUrl,
      type: "login",
    });
    const emailOptions = {
      to: email,
      from: fromEmail,
      subject: "Supersaas - Login with OTP",
      html,
    };
    await useEmail(emailProvider).send(emailOptions);
  }
}

export default defineEventHandler(async (event) => {
  try {
    const { email } = await readValidatedBody(event, (body) => emailVerificationSchema.parse(body));
    const user = await userActions.findUserByEmail(email);
    if (!user) {
      throw createError({
        statusCode: 400,
        statusMessage: "User not found",
      });
    }
    if (!user.emailVerified) {
      throw createError({
        statusCode: 400,
        statusMessage: "User has not verified their email",
      });
    }
    const emailVerificationCode = await generateEmailVerificationCode(user.id);
    const oneTimePassword = await generateOneTimePassword(user.id, email, "LOGIN");
    await sendOtpEmail(email, oneTimePassword, emailVerificationCode);
    setResponseStatus(event, 201);
    return { status: "success", message: "One Time Password sent to your email" };
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
