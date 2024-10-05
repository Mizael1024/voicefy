import { userActions } from "~/server/services/db/UserActions";
import { authActions } from "~/server/services/db/AuthActions";
import { sanitizeUser } from "~/server/utils/auth";

async function handleOAuthLogin(oauthUser) {
  let user = await userActions.findUserByEmail(oauthUser.email);
  if (!user) {
    user = await userActions.createUserWithOAuthAccount({
      email: oauthUser.email,
      name: oauthUser.name,
      avatarUrl: oauthUser.avatarUrl,
      emailVerified: true,
    });
  } else if (!user.avatarUrl) {
    user = await userActions.updateUser(user.id, { avatarUrl: oauthUser.avatarUrl });
  }

  await authActions.linkOAuthAccount(user.id, oauthUser.providerId, oauthUser.providerUserId);

  return user;
}

export default oauthGoogleEventHandler({
  async onSuccess(event, { user }) {
    const oauthUser = {
      email: user.email,
      name: user.name,
      avatarUrl: user.picture,
      providerId: "google",
      providerUserId: user.sub,
    };
    const dbUser = await handleOAuthLogin(oauthUser);
    if (dbUser.banned) {
      throw createError({
        statusCode: 403,
        statusMessage: "You account has been banned",
      });
    }
    const transformedUser = sanitizeUser(dbUser);
    await setUserSession(event, { user: transformedUser });
    return sendRedirect(event, "/dashboard");
  },
  onError(event, error) {
    console.error("Google OAuth error:", error);
    return sendRedirect(event, "/");
  },
});
