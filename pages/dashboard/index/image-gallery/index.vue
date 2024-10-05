<template>
  <AppPageContainer
    title="Image Gallery"
    description="A demo page to showcase image gallery with file storage"
  >
    <div class="flex items-center gap-2 mb-4">
      <UButton
        :loading="loadingServer"
        label="Upload from Server"
        color="black"
        size="md"
        @click="openServerUpload"
      />
      <UButton
        :loading="loadingClient"
        label="Directly Upload to S3 from Browser"
        color="black"
        size="md"
        @click="openClientUpload"
      />
    </div>
    <UAlert
      v-if="isCloudflare"
      icon="i-ph-warning-duotone"
      color="rose"
      variant="subtle"
      title="Cloudflare Support"
      description="Cloudflare Pages/Workers do not support S3 directly. Please use a different provider."
      :actions="[
        {
          label: 'Workaround',
          variant: 'solid',
          color: 'rose',
          target: '_blank',
          to: 'https://github.com/mhart/aws4fetch',
        },
      ]"
    />
    <div class="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      <div v-for="image in images" :key="image.id" class="relative group">
        <img
          v-if="image.url"
          class="rounded-lg aspect-square w-full h-auto object-cover ring-1 ring-gray-200 dark:ring-white/20"
          :src="image.url"
          alt="Image"
        />
        <UButton
          class="absolute top-2 right-2 opacity-20 group-hover:opacity-100"
          icon="i-ph-trash-duotone"
          color="rose"
          variant="soft"
          size="xs"
          :loading="imageDeletionLoading[image.id]"
          @click="deleteImage(image.id)"
        />
      </div>
    </div>
  </AppPageContainer>
</template>

<script setup>
import { useFileDialog } from "@vueuse/core";
import { toast } from "vue-sonner";

const isCloudflare = import.meta.env.NITRO_PRESET === "cloudflare_pages";
const loadingServer = ref(false);
const loadingClient = ref(false);
const imageDeletionLoading = ref({});

const { data: images, refresh } = await useFetch("/api/demo/images");

const { open: openServerUpload, onChange: onServerFileChange } = useFileDialog({
  accept: "image/*",
  multiple: false,
});

const { open: openClientUpload, onChange: onClientFileChange } = useFileDialog({
  accept: "image/*",
  multiple: false,
});

onServerFileChange(async (files) => {
  if (!files.length) return;

  const file = files[0];
  const formData = new FormData();
  formData.append("image", file);

  try {
    loadingServer.value = true;
    await $fetch("/api/demo/images", {
      method: "POST",
      body: formData,
    });
    await refresh();
    toast.success("Image uploaded successfully");
  } catch (error) {
    console.error(error);
    toast.error(error.data?.message || "Failed to upload image");
  } finally {
    loadingServer.value = false;
  }
});

onClientFileChange(async (files) => {
  if (!files.length) return;

  const file = files[0];
  try {
    loadingClient.value = true;
    const { uploadUrl } = await $fetch("/api/demo/images/client-upload", {
      method: "POST",
      body: {
        fileName: file.name,
        fileType: file.type,
      },
    });

    await uploadFile(uploadUrl, file);
    await refresh();
    toast.success("Image uploaded successfully");
  } catch (error) {
    console.error(error);
    toast.error(error.data?.message || "Failed to upload image");
  } finally {
    loadingClient.value = false;
  }
});

async function uploadFile(url, file) {
  await $fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });
}

async function deleteImage(imageId) {
  try {
    imageDeletionLoading.value = { ...imageDeletionLoading.value, [imageId]: true };
    await $fetch(`/api/demo/images/${imageId}`, { method: "DELETE" });
    await refresh();
    toast.success("Image deleted successfully");
  } catch (error) {
    console.error(error);
    toast.error("Failed to delete image");
  } finally {
    imageDeletionLoading.value = { ...imageDeletionLoading.value, [imageId]: false };
  }
}
</script>
