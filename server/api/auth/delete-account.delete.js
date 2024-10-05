import { userActions } from "~/server/services/db/UserActions";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const userRecord = await userActions.deleteUser(user.id);
  if (!userRecord) {
    throw createError({
      statusCode: 400,
      statusMessage: "User not found",
    });
  }
  await clearUserSession(event);
  setResponseStatus(event, 200);
  return {
    status: "success",
    message: "Account deleted",
  };
});
