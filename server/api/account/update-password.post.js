import { userActions } from "~/server/services/db/UserActions";
import { updatePasswordSchema } from "~/server/validations/users";
import { hashPassword } from "~/server/utils/hash";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { password } = await readValidatedBody(event, (body) => updatePasswordSchema.parse(body));
  const hashedPassword = await hashPassword(password);
  await userActions.updateUserPassword(user.id, hashedPassword);
  return {
    status: "success",
    message: "Password updated",
  };
});
