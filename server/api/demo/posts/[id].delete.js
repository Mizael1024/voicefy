import { postsActions } from "~/server/services/db/PostsActions";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const postId = getRouterParam(event, "id");
  const post = await postsActions.findPostById(postId);
  if (!post || post.userId !== user.id) {
    throw createError({ statusCode: 404, message: "Post not found" });
  }
  await postsActions.deletePost(postId);
  return { success: true };
});
