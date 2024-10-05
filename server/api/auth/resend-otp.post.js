import { userActions } from "~/server/services/db/UserActions";
import { authActions } from "~/server/services/db/AuthActions";
import { emailVerificationSchema } from "~/server/validations/users";
import { generateEmailVerificationCode, generateOneTimePassword } from "~/server/utils/auth";
import { useEmail } from "~/server/services/email";
import { renderOtpTemplate } from "~/server/utils/email-templates";
import { isWithinExpiryDate } from "~/server/utils/otp";

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

    // Check for existing OTP
    const existingOtp = await authActions.findLatestOneTimePasswordByEmail(email, "LOGIN");
    let oneTimePassword;
    let emailVerificationCode;

    if (existingOtp && isWithinExpiryDate(existingOtp.expiresAt)) {
      // Resend existing OTP if it's still valid
      oneTimePassword = existingOtp.code;
      emailVerificationCode = await authActions.findEmailVerificationCodeByUserId(user.id);
      if (!emailVerificationCode) {
        emailVerificationCode = await generateEmailVerificationCode(user.id);
      }
    } else {
      // Delete expired OTP if exists
      if (existingOtp) {
        await authActions.deleteOneTimePassword(existingOtp.id);
      }
      // Generate new OTP and email verification code
      emailVerificationCode = await generateEmailVerificationCode(user.id);
      oneTimePassword = await generateOneTimePassword(user.id, email, "LOGIN");
    }

    await sendOtpEmail(email, oneTimePassword, emailVerificationCode.code);

    setResponseStatus(event, 200);
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
