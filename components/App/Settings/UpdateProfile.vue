<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold leading-7 font-display">Personal Information</h2>
      </div>
      <p class="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
        Your personal information is not shared with anyone.
      </p>
    </template>
    <UForm class="space-y-6 max-w-lg" :schema="schema" :state="state" @submit="onSubmit">
      <div class="col-span-full">
        <UFormGroup label="Avatar" size="lg" name="avatarUrl">
          <div class="flex items-center gap-4">
            <UAvatar :src="fileUrl || state.avatarUrl" size="xl" :alt="user.name" />
            <UButton @click="open" type="button" label="Change" color="white" />
          </div>
        </UFormGroup>
      </div>
      <UFormGroup label="Email" size="lg" aria-readonly="true" readonly>
        <div
          class="cursor-not-allowed opacity-75 border-0 rounded-md text-sm px-3.5 py-2.5 shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700"
        >
          <span>{{ user.email }}</span>
        </div>
      </UFormGroup>
      <UFormGroup label="Account ID" size="lg" aria-readonly="true">
        <div
          class="cursor-not-allowed opacity-75 border-0 rounded-md text-sm px-3.5 py-2.5 shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700"
        >
          <span>{{ user.id }}</span>
        </div>
      </UFormGroup>
      <UFormGroup label="Full name" size="lg" name="name">
        <UInput placeholder="Full name" v-model="state.name" />
      </UFormGroup>
      <div>
        <UButton
          :loading="loading"
          :disabled="loading"
          type="submit"
          color="black"
          label="Save changes"
          size="lg"
        />
      </div>
    </UForm>
  </UCard>
</template>

<script setup>
import { useFileDialog, useObjectUrl } from "@vueuse/core";
import { z } from "zod";
import { toast } from "vue-sonner";

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});

const loading = ref(false);
const fileUrl = ref(null);

const { fetch: refreshSession } = useUserSession();
const { files, open, onChange } = useFileDialog({
  accept: "image/*",
  multiple: false,
});

onChange(() => {
  const objectUrl = useObjectUrl(files.value[0]);
  fileUrl.value = objectUrl.value || objectUrl;
});

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  avatarUrl: z.string().optional(),
});

const state = ref({
  name: props.user.name || "",
  avatarUrl: props.user.avatarUrl || "",
});

async function onSubmit(event) {
  try {
    loading.value = true;
    if (fileUrl.value) {
      await uploadImage();
    }
    await $fetch("/api/account/update-user", {
      method: "POST",
      body: event.data,
    });
    await refreshSession();
    toast.success("Profile updated successfully");
  } catch (error) {
    console.error(error);
    toast.error(error.data?.message || "An error occurred while updating the profile.");
  } finally {
    loading.value = false;
  }
}

async function uploadImage() {
  const file = files.value[0];
  if (!file) throw new Error("No file selected.");
  const formData = new FormData();
  formData.append("image", file);
  const response = await $fetch("/api/images/upload", {
    method: "POST",
    body: formData,
  });
  state.value.avatarUrl = response;
}
</script>
