import { adminActions } from "~/server/services/db/AdminActions";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  if (user.role !== "ADMIN") {
    throw createError({
      statusCode: 403,
      message: "You are not authorized to perform this action",
    });
  }
  const records = await adminActions.getAllWaitlistItems();
  return records;
});
