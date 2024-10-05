import { usePayment } from "~/server/services/payment";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  if (user.role !== "ADMIN") {
    throw createError({
      statusCode: 403,
      message: "You are not authorized to perform this action",
    });
  }
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "Stripe API key is missing",
    });
  }
  const { id } = getQuery(event);
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing invoice ID",
    });
  }
  const invoice = await usePayment("stripe").getInvoice(id);
  return invoice;
});
