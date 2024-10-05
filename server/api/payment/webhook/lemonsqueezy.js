import { SubscriptionStatus } from "~/server/services/payment/types";
import { subscriptionActions } from "~/server/services/db/SubscriptionActions";
import { verifySignature } from "~/server/utils/verifySignature";

export default defineEventHandler(async (event) => {
  try {
    const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("LemonSqueezy Webhook Secret is missing");
    }

    const body = await readRawBody(event);
    const signatureHeader = getHeader(event, "x-signature");
    if (!signatureHeader) {
      throw createError({
        statusCode: 400,
        statusMessage: "LemonSqueezy signature is missing",
      });
    }

    if (!body) {
      throw createError({
        statusCode: 400,
        statusMessage: "Request body is missing",
      });
    }

    const isValidSignature = await verifySignature(body, signatureHeader, webhookSecret);
    if (!isValidSignature) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid signature",
      });
    }

    const payload = JSON.parse(body);
    const {
      meta: { event_name: eventName, custom_data: customData },
      data,
    } = payload;

    const relevantEvents = [
      "subscription_created",
      "subscription_updated",
      "subscription_cancelled",
      "subscription_expired",
      "subscription_resumed",
    ];

    if (!relevantEvents.includes(eventName)) {
      console.log("Not a relevant event");
      return "OK";
    }

    const statusMap = {
      active: SubscriptionStatus.ACTIVE,
      past_due: SubscriptionStatus.PAST_DUE,
      unpaid: SubscriptionStatus.UNPAID,
      cancelled: SubscriptionStatus.CANCELED,
      expired: SubscriptionStatus.EXPIRED,
      on_trial: SubscriptionStatus.TRIALING,
      paused: SubscriptionStatus.PAUSED,
    };

    if (!data) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid event data",
      });
    }

    const eventData = data.attributes;

    const subscriptionPayload = {
      id: String(data.id),
      userId: customData?.user_id,
      customerId: String(eventData.customer_id),
      planId: String(eventData.product_id),
      variantId: String(eventData.variant_id),
      status: statusMap[eventData.status],
      paymentProvider: "lemonsqueezy",
      nextPaymentDate: new Date(eventData.trial_ends_at ?? eventData.renews_at),
    };

    await subscriptionActions.updateOrCreateSubscription(subscriptionPayload);
    return "OK";
  } catch (error) {
    console.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
