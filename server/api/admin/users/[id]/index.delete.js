import { adminActions } from "~/server/services/db/AdminActions";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  if (user.role !== "ADMIN") {
    throw createError({
      statusCode: 403,
      message: "You are not authorized to perform this action",
    });
  }

  const userId = getRouterParam(event, "id");

  const deleted = await adminActions.deleleUser(userId);

  if (!deleted) {
    throw createError({
      statusCode: 500,
      message: "Failed to delete user",
    });
  }

  return { message: "User deleted successfully" };
});
