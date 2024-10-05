import { customAlphabet } from "nanoid";
import { useFileStorage } from "~/server/services/fileStorage";
import { imageActions } from "~/server/services/db/ImageActions";
const { storageProvider } = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  if (storageProvider === "local") {
    throw createError({
      statusCode: 500,
      statusMessage:
        "Local storage does not support client uploads. Upload your files directly to Server instead.",
    });
  }
  const body = await readBody(event);
  const { fileName, fileType } = body;

  if (!fileName || !fileType) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing fileName or fileType",
    });
  }

  const nanoid = customAlphabet("1234567890abcdef", 10);
  const uniqueKey = `${nanoid()}-${fileName}`;

  const storageService = useFileStorage(storageProvider);

  try {
    const uploadUrl = await storageService.getClientUploadUrl(uniqueKey, fileType);
    await imageActions.createImage({ userId: user.id, key: uniqueKey });
    return { uploadUrl, key: uniqueKey };
  } catch (error) {
    console.error("Error generating client upload URL:", error);
    throw createError({
      statusCode: 500,
      statusMessage:
        "Failed to generate upload URL. This might not be supported with the current storage provider.",
    });
  }
});
