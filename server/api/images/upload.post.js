import { customAlphabet } from "nanoid";
import { validateBlob } from "~/server/utils/blob";
import { useFileStorage } from "~/server/services/fileStorage";
const { storageProvider } = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const r2PublicUrl = process.env.S3_PUBLIC_ACCESS_URL;
  const form = await readFormData(event);
  const image = form.get("image");

  if (!(image instanceof Blob)) {
    throw new Error("Image is not a Blob");
  }
  validateBlob(image, { maxSize: "1MB", types: ["image/png", "image/jpeg", "image/webp"] });
  const nanoid = customAlphabet("1234567890abcdef", 10);
  const uniqueKey = `${nanoid()}-${image.name}`;

  const storageService = useFileStorage(storageProvider);
  const response = await storageService.upload({ key: uniqueKey, data: image });
  const path = storageProvider === "nuxthub" ? `${r2PublicUrl}/${response.pathname}` : response;
  return path;
});
