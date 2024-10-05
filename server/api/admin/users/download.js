import { adminActions } from "~/server/services/db/AdminActions";
import { sanitizeUser } from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  if (user.role !== "ADMIN") {
    throw createError({
      statusCode: 403,
      message: "You are not authorized to perform this action",
    });
  }

  const result = await adminActions.getAllUsers({ page: 1, pageSize: Number.MAX_SAFE_INTEGER });

  if (!result) {
    throw createError({
      statusCode: 500,
      message: "Failed to fetch user data",
    });
  }

  const cleanedRecords = result.users.map((record) => ({
    ...sanitizeUser(record, true),
    hasPassword: record.hashedPassword && record.hashedPassword.length > 0,
    linkedAccounts: record.linkedAccounts,
    passkeyConnected: record.passkeyConnected,
  }));

  return cleanedRecords;
});
