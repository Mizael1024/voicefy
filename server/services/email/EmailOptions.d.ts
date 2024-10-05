export type EmailOptions = {
  from: string;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
};

export type EmailProvider = "resend" | "plunk" | "sendgrid" | "postmark";
