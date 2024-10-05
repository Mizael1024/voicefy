import { checkoutLinkSchema } from "~/server/validations/payments";
import { usePayment } from "~/server/services/payment";
import { subscriptionActions } from "~/server/services/db/SubscriptionActions";
const { paymentProvider } = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { variantId, redirectUrl } = await readValidatedBody(event, (body) =>
    checkoutLinkSchema.parse(body),
  );
  const subscription = await subscriptionActions.findSubscriptionByUserId(user.id);

  if (subscription) {
    const billingPortalLink = await usePayment(paymentProvider).createCustomerPortalLink({
      id: subscription.id,
      customerId: subscription.customerId,
      redirectUrl,
      flowData: {
        type: "subscription_update",
        subscription_update: {
          subscription: subscription.id,
        },
      },
    });

    return billingPortalLink;
  } else {
    const checkoutLink = await usePayment(paymentProvider).createCheckoutLink({
      userId: user.id,
      email: user.email,
      name: user.name,
      variantId,
      redirectUrl,
    });
    return checkoutLink;
  }
});
