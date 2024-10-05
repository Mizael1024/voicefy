import { useFileStorage } from "~/server/services/fileStorage";
const { storageProvider } = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, "key");
  if (!key) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing image key",
    });
  }

  const { user } = await requireUserSession(event);
  const storageService = useFileStorage(storageProvider);

  const image = await imageActions.findImageById(key);
  if (!image || image.userId !== user.id) {
    throw createError({
      statusCode: 403,
      statusMessage: "You don't have permission to view this image",
    });
  }

  const url = await storageService.getSignedUrlForRead(key);
  return { url };
});
