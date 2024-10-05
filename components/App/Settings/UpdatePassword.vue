<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold leading-7 font-display">Security</h2>
      </div>
      <p class="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
        Your credentials are encrypted and stored securely.
      </p>
    </template>
    <UForm class="space-y-6 max-w-lg" :schema="schema" :state="state" @submit="onSubmit">
      <UFormGroup label="New Password" size="lg" name="password">
        <UInput type="password" placeholder="Enter a new password" v-model="state.password" />
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
import { z } from "zod";
import { toast } from "vue-sonner";

const loading = ref(false);
const schema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

const state = ref({
  password: "",
});

async function onSubmit(event) {
  try {
    loading.value = true;
    await $fetch("/api/account/update-password", {
      method: "POST",
      body: event.data,
    });
    toast.success("Password updated successfully");
  } catch (error) {
    console.error(error);
    toast.error(error.data?.message || "An error occurred while updating the profile.");
  } finally {
    loading.value = false;
  }
}
</script>
