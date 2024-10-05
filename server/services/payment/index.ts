import { PaymentProvider } from "./types";
import { PaymentService } from "./PaymentService";
import { StripeService } from "./StripeService";
import { LemonSqueezyService } from "./LemonSqueezyService";

export function usePayment(provider: PaymentProvider): PaymentService {
  switch (provider) {
    case "stripe":
      return new StripeService();
    case "lemonsqueezy":
      return new LemonSqueezyService();
    default:
      throw new Error(`Unsupported payment provider: ${provider}`);
  }
}
