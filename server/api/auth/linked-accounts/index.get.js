import { userActions } from "~/server/services/db/UserActions";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const accounts = await userActions.findLinkedAccountsByUserId(user.id);
  return { accounts };
});
