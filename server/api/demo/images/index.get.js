import { imageActions } from "~/server/services/db/ImageActions";
import { useFileStorage } from "~/server/services/fileStorage";
const { storageProvider } = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const images = await imageActions.findImagesByUserId(user.id);

  const storageService = useFileStorage(storageProvider);
  for (const image of images) {
    image.url = await storageService.getSignedUrlForRead(image.key);
  }

  return images;
});
