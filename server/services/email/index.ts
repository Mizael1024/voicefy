import { type EmailProvider } from "~/server/services/email/EmailOptions";
import { type EmailService } from "./EmailService";
import { ResendEmailService } from "./ResendService";
import { PlunkService } from "./PlunkService";

export function useEmail(provider: EmailProvider): EmailService {
  switch (provider) {
    case "resend":
      return new ResendEmailService();
    case "plunk":
      return new PlunkService();
    default:
      throw new Error(`Unsupported email provider: ${provider}`);
  }
}
