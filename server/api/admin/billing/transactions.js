import { usePayment } from "~/server/services/payment";
const { paymentProvider } = useRuntimeConfig();

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
  const transactions = await usePayment(paymentProvider).listAllTransactions();
  return transactions;
});
