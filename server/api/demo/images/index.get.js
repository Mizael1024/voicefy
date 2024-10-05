import { imageActions } from "~/server/services/db/ImageActions";

export default defineEventHandler(async (event) => {
  const r2PublicUrl = process.env.S3_PUBLIC_ACCESS_URL;
  const { user } = await requireUserSession(event);
  const images = await imageActions.findImagesByUserId(user.id);
  for (const image of images) {
    image.url = `${r2PublicUrl}/${image.publicUrl}`;
  }
  return images;
});
