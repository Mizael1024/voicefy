import {
  Plan,
  CheckoutOptions,
  CustomerPortalOptions,
  SubscriptionStatus,
  Transaction,
} from "./types";

export interface PaymentService {
  getAllPlans(): Promise<Plan[]>;
  createCheckoutLink(options: CheckoutOptions): Promise<string>;
  createCustomerPortalLink(options: CustomerPortalOptions): Promise<string>;
  pauseSubscription(id: string): Promise<void>;
  cancelSubscription(id: string): Promise<void>;
  resumeSubscription(id: string): Promise<{ status: SubscriptionStatus }>;
  updateSubscription(customerId: string, newPriceId: string): Promise<void>;
  listAllTransactions(): Promise<Transaction[]>;
  getInvoice(invoiceId: string): Promise<any>;
}
