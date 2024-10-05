import { postsActions } from "~/server/services/db/PostsActions";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const posts = await postsActions.findPostsByUserId(user.id);
  return posts;
});
