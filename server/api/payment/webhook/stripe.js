import Stripe from "stripe";
import { SubscriptionStatus } from "~/server/services/payment/types";
import { subscriptionActions } from "~/server/services/db/SubscriptionActions";

export default defineEventHandler(async (event) => {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("Stripe Webhook Secret is missing");
    }

    const stripe = new Stripe(process.env.STRIPE_API_KEY);
    const body = await readRawBody(event);
    const stripeSignature = getHeader(event, "stripe-signature");
    if (!stripeSignature) {
      throw createError({
        statusCode: 400,
        statusMessage: "Stripe signature is missing",
      });
    }

    if (!body) {
      throw createError({
        statusCode: 400,
        statusMessage: "Request body is missing",
      });
    }

    let stripeEvent;
    try {
      stripeEvent = await stripe.webhooks.constructEventAsync(body, stripeSignature, webhookSecret);
    } catch (err) {
      throw createError({
        statusCode: 400,
        statusMessage: `Webhook Error: ${err.message}`,
      });
    }

    const type = stripeEvent.type;
    const relevantEvents = [
      "customer.subscription.created",
      "customer.subscription.updated",
      "customer.subscription.deleted",
    ];

    if (!relevantEvents.includes(type)) {
      console.log("Not a relevant event");
      return "OK";
    }

    const statusMap = {
      active: SubscriptionStatus.ACTIVE,
      past_due: SubscriptionStatus.PAST_DUE,
      unpaid: SubscriptionStatus.UNPAID,
      canceled: SubscriptionStatus.CANCELED,
      incomplete: SubscriptionStatus.INCOMPLETE,
      incomplete_expired: SubscriptionStatus.EXPIRED,
      trialing: SubscriptionStatus.TRIALING,
      paused: SubscriptionStatus.PAUSED,
    };

    const data = stripeEvent.data.object;
    if (!data) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid event data",
      });
    }

    const payload = {
      id: String(data.id),
      userId: data.metadata?.user_id,
      customerId: String(data.customer),
      planId: String(data.plan.product),
      variantId: String(data.plan.id),
      status: statusMap[data.status],
      paymentProvider: "stripe",
      nextPaymentDate: new Date((data.trial_end ?? data.current_period_end ?? 0) * 1000),
    };
    await subscriptionActions.updateOrCreateSubscription(payload);
    return "OK";
  } catch (error) {
    console.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
