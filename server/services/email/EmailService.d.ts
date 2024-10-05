import { type EmailOptions } from "./EmailOptions";

export interface EmailService {
  send(emailOptions: EmailOptions): Promise<void>;
}
