import { eq } from "drizzle-orm";

class ImageActions {
  async createImage(payload) {
    try {
      const record = await useDB().insert(tables.images).values(payload).returning().get();
      return record;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to create image");
    }
  }

  async findImageById(id) {
    try {
      const [image] = await useDB().select().from(tables.images).where(eq(tables.images.id, id));
      return image || null;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to find image by ID");
    }
  }

  async deleteImage(id) {
    try {
      const record = await useDB()
        .delete(tables.images)
        .where(eq(tables.images.id, id))
        .returning()
        .get();
      return record;
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to delete image: ${error}`);
    }
  }

  async findImagesByUserId(userId) {
    try {
      const images = await useDB()
        .select()
        .from(tables.images)
        .where(eq(tables.images.userId, userId));
      return images;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}

export const imageActions = new ImageActions();
