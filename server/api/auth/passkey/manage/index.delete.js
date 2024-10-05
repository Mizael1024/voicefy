import { userActions } from "~/server/services/db/UserActions";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  const deleted = await userActions.deletePasskeyCredential(user.id);

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: "Passkey not found",
    });
  }

  return { message: "Passkey deleted successfully" };
});
