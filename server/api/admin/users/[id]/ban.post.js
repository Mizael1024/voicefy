import { adminActions } from "~/server/services/db/AdminActions";
import { userActions } from "~/server/services/db/UserActions";
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  if (user.role !== "ADMIN") {
    throw createError({
      statusCode: 403,
      message: "You are not authorized to perform this action",
    });
  }
  const body = await readBody(event);
  const userRecord = await userActions.findUserByUserId(body.userId);
  if (!userRecord) {
    throw createError({
      statusCode: 400,
      message: "User not found",
    });
  }
  const record = await adminActions.banUnbanUser(body);
  return record;
});
