import { waitlistActions } from "~/server/services/db/WaitlistActions";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  if (user.role !== "ADMIN") {
    throw createError({
      statusCode: 403,
      message: "You are not authorized to perform this action",
    });
  }
  const recordId = getRouterParam(event, "id");
  await waitlistActions.deleteItem(recordId);
  return { success: true };
});
