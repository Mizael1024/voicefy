import { eq } from "drizzle-orm";
import { SubscriptionStatus } from "~/server/services/payment/types";
class SubscriptionActions {
  async updateOrCreateSubscription(payload) {
    try {
      const result = await useDB()
        .insert(tables.subscriptions)
        .values(payload)
        .onConflictDoUpdate({
          target: tables.subscriptions.id,
          set: payload,
        })
        .returning();

      return result[0];
    } catch (error) {
      console.error(error);
      throw new Error("Failed to sync subscription", { cause: error });
    }
  }

  async findSubscriptionByUserId(userId) {
    try {
      const [subscription] = await useDB()
        .select()
        .from(tables.subscriptions)
        .where(eq(tables.subscriptions.userId, userId));
      return subscription || null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async findSubscriptionById(id) {
    try {
      const [subscription] = await useDB()
        .select()
        .from(tables.subscriptions)
        .where(eq(tables.subscriptions.id, id));
      return subscription || null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async cancelSubscription(subscriptionId) {
    try {
      const subscription = findSubscriptionById(subscriptionId);
      if (!subscription) {
        throw new Error("Subscription not found");
      }
      if (subscription.status !== "ACTIVE") {
        throw new Error("Subscription is not active");
      }
      const payload = {
        status: SubscriptionStatus.CANCELED,
      };
      const updatedSubscription = await updateOrCreateSubscription(payload);
      return updatedSubscription;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to cancel subscription");
    }
  }
}

export const subscriptionActions = new SubscriptionActions();
