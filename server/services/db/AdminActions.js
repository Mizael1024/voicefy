import { desc, eq, or, like, sql } from "drizzle-orm";

class AdminActions {
  async getAllUsers({ page = 1, pageSize = 10, search = "", filter = "all" }) {
    try {
      const offset = (page - 1) * pageSize;

      let query = useDB()
        .select({
          user: tables.users,
          oauthAccounts: sql`GROUP_CONCAT(DISTINCT ${tables.oauthAccounts.providerId})`.as(
            "linkedAccounts",
          ),
          hasPasskey: sql`CASE WHEN COUNT(${tables.credentials.id}) > 0 THEN 1 ELSE 0 END`.as(
            "hasPasskey",
          ),
        })
        .from(tables.users)
        .leftJoin(tables.oauthAccounts, eq(tables.users.id, tables.oauthAccounts.userId))
        .leftJoin(tables.credentials, eq(tables.users.id, tables.credentials.userId));

      // Apply search
      if (search) {
        query = query.where(
          or(like(tables.users.name, `%${search}%`), like(tables.users.email, `%${search}%`)),
        );
      }

      // Apply filter
      if (filter === "verified") {
        query = query.where(eq(tables.users.emailVerified, true));
      } else if (filter === "unverified") {
        query = query.where(eq(tables.users.emailVerified, false));
      } else if (filter === "google") {
        query = query.where(eq(tables.oauthAccounts.providerId, "google"));
      } else if (filter === "github") {
        query = query.where(eq(tables.oauthAccounts.providerId, "github"));
      }

      // Apply pagination
      query = query
        .groupBy(tables.users.id)
        .orderBy(desc(tables.users.createdAt))
        .limit(pageSize)
        .offset(offset);

      const records = await query;

      const totalCountQuery = useDB()
        .select({ count: sql`count(*)` })
        .from(tables.users);

      if (search) {
        totalCountQuery.where(
          or(like(tables.users.name, `%${search}%`), like(tables.users.email, `%${search}%`)),
        );
      }

      if (filter === "verified") {
        totalCountQuery.where(eq(tables.users.emailVerified, true));
      } else if (filter === "unverified") {
        totalCountQuery.where(eq(tables.users.emailVerified, false));
      }

      const totalCountResult = await totalCountQuery;
      const totalCount = totalCountResult[0].count;

      const users = records.map((record) => ({
        ...record.user,
        linkedAccounts: record.oauthAccounts ? record.oauthAccounts.split(",") : [],
        passkeyConnected: Boolean(record.hasPasskey),
      }));

      return {
        users,
        totalCount,
        page,
        pageSize,
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async createNewUser(payload) {
    try {
      const newUser = await useDB().insert(tables.users).values(payload).returning().get();
      return newUser;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to create new user");
    }
  }

  async deleleUser(userId) {
    try {
      const deleted = await useDB()
        .delete(tables.users)
        .where(eq(tables.users.id, userId))
        .returning()
        .get();
      return deleted;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to delete user");
    }
  }

  async banUnbanUser(body) {
    try {
      const record = await useDB()
        .update(tables.users)
        .set({ banned: body.status, bannedReason: body.bannedReason })
        .where(eq(tables.users.id, body.userId))
        .returning()
        .get();
      return record;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to ban user");
    }
  }

  async getAllWaitlistItems() {
    try {
      const records = await useDB()
        .select()
        .from(tables.waitlist)
        .orderBy(desc(tables.waitlist.createdAt));
      return records;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  // add more methods as needed
}

export const adminActions = new AdminActions();
