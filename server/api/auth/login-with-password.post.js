import { userActions } from "~/server/services/db/UserActions";
import { sanitizeUser } from "~/server/utils/auth";
import { loginWithPasswordSchema } from "~/server/validations/users";
import { verifyPassword } from "~/server/utils/hash";

async function handleUserValidation(email, password) {
  const user = await userActions.findUserByEmail(email);
  if (!user) {
    throw createError({
      statusCode: 400,
      statusMessage: "User not found",
    });
  }
  if (!user.hashedPassword && user.emailVerified) {
    const connectedOauthAccount = await userActions.findOauthAccountByUserId(user.id);
    const oAuthProvider = connectedOauthAccount.providerId;
    throw createError({
      statusCode: 400,
      statusMessage: `Account connected with ${oAuthProvider}. Please continue with ${oAuthProvider} to login.`,
    });
  }
  const isPasswordCorrect = await verifyPassword(user.hashedPassword, password);
  if (!isPasswordCorrect) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid credentials",
    });
  }
  if (!user.emailVerified) {
    throw createError({
      statusCode: 400,
      statusMessage: "User has not verified their email",
    });
  }
  if (user.banned) {
    throw createError({
      statusCode: 403,
      statusMessage: "You account has been banned",
    });
  }
  return user;
}

export default defineEventHandler(async (event) => {
  try {
    const { email, password } = await readValidatedBody(event, (body) =>
      loginWithPasswordSchema.parse(body),
    );
    const user = await handleUserValidation(email, password);
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
