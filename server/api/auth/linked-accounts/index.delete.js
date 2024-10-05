import { userActions } from "~/server/services/db/UserActions";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { accountId } = await readBody(event);

  if (!accountId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Account ID is required",
    });
  }

  const unlinked = await userActions.unlinkAccount(user.id, accountId);

  if (!unlinked) {
    throw createError({
      statusCode: 404,
      statusMessage: "Linked account not found",
    });
  }

  return { message: "Account unlinked successfully" };
});
