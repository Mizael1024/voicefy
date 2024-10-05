import { postsActions } from "~/server/services/db/PostsActions";
import { userActions } from "~/server/services/db/UserActions"; // Import userActions
import { SubscriptionStatus } from "~/server/services/payment/types";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  const subscription = await userActions.findSubscriptionByUserId(user.id);
  const posts = await postsActions.findPostsByUserId(user.id);

  if (!subscription || subscription.status !== SubscriptionStatus.ACTIVE) {
    if (posts.length >= 1) {
      throw createError({
        statusCode: 403,
        statusMessage: "Free plan users can only create one post.",
      });
    }
  }

  const { title, content } = await readValidatedBody(event, (body) =>
    z.object({ title: z.string().min(1).max(50), content: z.string().min(1).max(100) }).parse(body),
  );
  const post = await postsActions.createPost({ title, content }, user.id);
  return post;
});
