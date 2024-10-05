import { usePayment } from "~/server/services/payment";
import { subscriptionActions } from "~/server/services/db/SubscriptionActions";
const { paymentProvider } = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const subscription = await subscriptionActions.findSubscriptionByUserId(user.id);
  if (!subscription) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid subscription",
    });
  }
  await usePayment(paymentProvider).cancelSubscription(subscription.id);
  await subscriptionActions.cancelSubscription(subscription.id);
  return { status: "success", message: "Subscription cancelled" };
});
