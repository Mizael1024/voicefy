import { userActions } from "~/server/services/db/UserActions";
import { authActions } from "~/server/services/db/AuthActions";
import { sanitizeUser } from "~/server/utils/auth";
import { isWithinExpiryDate } from "~/server/utils/otp";
import { otpVerificationSchema } from "~/server/validations/users";

export default defineEventHandler(async (event) => {
  try {
    const { email, code, type } = await readValidatedBody(event, (body) =>
      otpVerificationSchema.parse(body),
    );

    const otp = await authActions.findOneTimePassword(code, type, email);
    if (!otp) {
      throw createError({ statusCode: 400, statusMessage: "Invalid OTP" });
    }
    if (!isWithinExpiryDate(otp.expiresAt)) {
      throw createError({ statusCode: 400, statusMessage: "OTP has expired" });
    }
    if (type === "SIGNUP") {
      await userActions.verifyUser(otp.userId);
    }
    const user = await userActions.findUserByUserId(otp.userId);
    if (!user) {
      throw createError({ statusCode: 404, statusMessage: "User not found" });
    }

    await authActions.deleteOneTimePassword(otp.id);

    const emailVerificationCode = await authActions.findEmailVerificationCodeByUserId(user.id);
    if (emailVerificationCode) {
      await authActions.deleteEmailVerificationCode(emailVerificationCode.id);
    }

    if (user.banned) {
      throw createError({
        statusCode: 403,
        statusMessage: "You account has been banned",
      });
    }

    await userActions.updateLastActive(user.id);
    const transformedUser = sanitizeUser(user);
    await setUserSession(event, { user: transformedUser });
    return sendRedirect(event, "/dashboard");
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
