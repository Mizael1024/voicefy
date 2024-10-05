import { eq, and } from "drizzle-orm";

class PostsActions {
  async createPost(payload, userId) {
    try {
      const record = await useDB()
        .insert(tables.posts)
        .values({ ...payload, userId })
        .onConflictDoUpdate({
          target: tables.posts.id,
          set: payload,
        })
        .returning()
        .get();
      return record;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to create post");
    }
  }

  async findPostById(id) {
    try {
      const [post] = await useDB().select().from(tables.posts).where(eq(tables.posts.id, id));
      return post || null;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to find post by ID");
    }
  }

  async updatePost(id, payload) {
    try {
      const record = await useDB()
        .update(tables.posts)
        .set(payload)
        .where(eq(tables.posts.id, id))
        .returning()
        .get();
      return record;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to update post");
    }
  }

  async deletePost(id) {
    try {
      const record = await useDB()
        .delete(tables.posts)
        .where(eq(tables.posts.id, id))
        .returning()
        .get();
      return record;
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to delete post: ${error}`);
    }
  }

  async findPostsByUserId(userId) {
    try {
      const posts = await useDB()
        .select()
        .from(tables.posts)
        .where(eq(tables.posts.userId, userId));
      return posts;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}

export const postsActions = new PostsActions();
