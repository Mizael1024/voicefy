import { userActions } from "~/server/services/db/UserActions";
import { updateUserSchema } from "~/server/validations/users";
import { sanitizeUser } from "~/server/utils/auth";
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { name, password, avatarUrl } = await readValidatedBody(event, (body) =>
    updateUserSchema.parse(body),
  );
  const updatedUser = await userActions.updateUser(user.id, { name, password, avatarUrl });
  const transformedUser = sanitizeUser(updatedUser);
  await setUserSession(event, { user: transformedUser });
  return transformedUser;
});
