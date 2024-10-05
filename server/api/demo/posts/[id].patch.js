import { postsActions } from "~/server/services/db/PostsActions";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const postId = getRouterParam(event, "id");
  const { title, content } = await readValidatedBody(event, (body) =>
    z.object({ title: z.string().min(1).max(50), content: z.string().min(1).max(100) }).parse(body),
  );
  const post = await postsActions.findPostById(postId);
  if (!post || post.userId !== user.id) {
    throw createError({ statusCode: 404, message: "Post not found" });
  }
  const updatedPost = await postsActions.updatePost(postId, { title, content });
  return updatedPost;
});
