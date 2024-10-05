import { subscriptionActions } from "~/server/services/db/SubscriptionActions";
import { usePayment } from "~/server/services/payment";
const { paymentProvider } = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const subscription = await subscriptionActions.findSubscriptionByUserId(user.id);
  const plans = await usePayment(paymentProvider).getAllPlans();

  if (!subscription) {
    return {
      activeSubscription: null,
      plans,
    };
  }

  const plan = plans.find((plan) => plan.id === subscription.planId);
  if (!plan) {
    return { error: "Plan not found" };
  }

  const variant = plan.variants.find((variant) => variant.id === subscription.variantId);
  if (!variant) {
    return { error: "Variant not found" };
  }

  const activeSubscription = {
    ...subscription,
    name: plan.name,
    description: plan.description,
    price: variant.price,
    currency: variant.currency,
    interval: variant.interval,
  };

  return {
    activeSubscription,
    plans,
  };
});
