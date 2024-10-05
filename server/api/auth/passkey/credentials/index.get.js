import { userActions } from "~/server/services/db/UserActions";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  const credential = await userActions.findPasskeyCredentialByUserId(user.id);

  return {
    hasCredential: credential && credential.length > 0,
  };
});
