import { waitlistActions } from "~/server/services/db/WaitlistActions";
import { emailVerificationSchema } from "~/server/validations/users";

export default defineEventHandler(async (event) => {
  const { email } = await readValidatedBody(event, (body) => emailVerificationSchema.parse(body));
  const record = await waitlistActions.addEmail({ email });
  return record;
});
