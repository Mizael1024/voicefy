import { forgotPasswordSchema } from "~/server/validations/users";
import { userActions } from "~/server/services/db/UserActions";
import { authActions } from "~/server/services/db/AuthActions";
import { isWithinExpiryDate } from "~/server/utils/otp";
import { hashPassword } from "~/server/utils/hash";

export default defineEventHandler(async (event) => {
  const { code, password } = await readValidatedBody(event, (body) =>
    forgotPasswordSchema.parse(body),
  );

  const resetPasswordToken = await authActions.findPasswordResetToken(code);
  if (!resetPasswordToken) {
    throw createError({
      statusCode: 400,
      statusMessage: "Password reset link expired",
    });
  }
  if (!isWithinExpiryDate(resetPasswordToken.expiresAt)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Password reset token has expired",
    });
  }
  const user = await userActions.findUserByUserId(resetPasswordToken.userId);
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
  const hashedPassword = await hashPassword(password);
  await userActions.updateUserPassword(user.id, hashedPassword);
  await authActions.deletePasswordResetToken(resetPasswordToken.id);
  return { message: "Password has been successfully reset" };
});
