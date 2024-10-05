import { imageActions } from "~/server/services/db/ImageActions";
import { useFileStorage } from "~/server/services/fileStorage";
const { storageProvider } = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const id = getRouterParam(event, "id");

  const image = await imageActions.findImageById(id);
  if (!image || image.userId !== user.id) {
    throw new Error("Image not found or you don't have permission to delete it.");
  }

  const storageService = useFileStorage(storageProvider);
  await storageService.delete(image.key);
  await imageActions.deleteImage(id);

  return { success: true };
});
