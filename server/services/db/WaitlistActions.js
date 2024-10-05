import { eq, desc } from "drizzle-orm";

class WaitlistActions {
  async addEmail(payload, userId) {
    try {
      const record = await useDB()
        .insert(tables.waitlist)
        .values({ ...payload, userId })
        .onConflictDoUpdate({
          target: tables.waitlist.id,
          set: payload,
        })
        .returning()
        .get();
      return record;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to create waitlist");
    }
  }

  async deleteItem(id) {
    try {
      const record = await useDB()
        .delete(tables.waitlist)
        .where(eq(tables.waitlist.id, id))
        .returning()
        .get();
      return record;
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to delete waitlist: ${error}`);
    }
  }

  async getAllItems() {
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
}

export const waitlistActions = new WaitlistActions();
