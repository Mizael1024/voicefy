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

  const query = getQuery(event);
  const page = parseInt(query.page) || 1;
  const pageSize = parseInt(query.pageSize) || 10;
  const search = query.search || "";
  const filter = query.filter || "all";

  const result = await adminActions.getAllUsers({ page, pageSize, search, filter });

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

  return {
    users: cleanedRecords,
    totalCount: result.totalCount,
    page: result.page,
    pageSize: result.pageSize,
  };
});
