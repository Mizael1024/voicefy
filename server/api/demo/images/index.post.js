import { customAlphabet } from "nanoid";
import { validateBlob } from "~/server/utils/blob";
import { useFileStorage } from "~/server/services/fileStorage";
import { imageActions } from "~/server/services/db/ImageActions";
const { storageProvider } = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const form = await readFormData(event);
  const image = form.get("image");

  if (!(image instanceof Blob)) {
    throw new Error("Image is not a Blob");
  }
  validateBlob(image, { maxSize: "1MB", types: ["image/png", "image/jpeg", "image/webp"] });
  const nanoid = customAlphabet("1234567890abcdef", 10);
  const uniqueKey = `${nanoid()}-${image.name}`;

  const storageService = useFileStorage(storageProvider);
  const publicUrl = await storageService.upload({ key: uniqueKey, data: image });

  await imageActions.createImage({ userId: user.id, key: uniqueKey });

  return publicUrl;
});
