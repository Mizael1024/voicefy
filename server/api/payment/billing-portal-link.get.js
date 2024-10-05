import { usePayment } from "~/server/services/payment";
import { subscriptionActions } from "~/server/services/db/SubscriptionActions";
const { baseUrl } = useRuntimeConfig().public;
const { paymentProvider } = useRuntimeConfig();
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const subscription = await subscriptionActions.findSubscriptionByUserId(user.id);

  const query = getQuery(event);
  const flow = query.flow || "default";

  let flowData;

  switch (flow) {
    case "update-plan":
      flowData = {
        type: "subscription_update",
        subscription_update: {
          subscription: subscription.id,
        },
      };
      break;
    case "update-payment-info":
      flowData = {
        type: "payment_method_update",
      };
      break;
    case "cancel":
      flowData = {
        type: "subscription_cancel",
        subscription_cancel: {
          subscription: subscription.id,
        },
      };
      break;
    default:
      flowData = undefined;
      break;
  }

  const billingPortalLink = await usePayment(paymentProvider).createCustomerPortalLink({
    id: subscription.id,
    customerId: subscription.customerId,
    redirectUrl: `${baseUrl}/dashboard/settings/billing`,
    flowData,
  });
  return billingPortalLink;
});
