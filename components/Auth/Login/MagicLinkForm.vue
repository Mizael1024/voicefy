<template>
  <UForm :schema="magicLinkSchema" :state="state" class="space-y-4 max-w-sm" @submit="onSubmit">
    <UFormGroup label="Email" name="email" size="lg">
      <UInput v-model="state.email" />
    </UFormGroup>
    <UButton :loading="loading" color="black" type="submit" :disabled="loading" size="lg" block>
      Send Magic Link
    </UButton>
  </UForm>
</template>

<script setup>
import { ref, reactive } from "vue";
import { z } from "zod";
import { toast } from "vue-sonner";

const magicLinkSchema = z.object({
  email: z.string().email("Invalid email"),
});

const state = reactive({
  email: undefined,
});

const loading = ref(false);

async function onSubmit(event) {
  try {
    loading.value = true;
    await $fetch("/api/auth/login-with-otp", { method: "POST", body: event.data });
    toast("OTP sent to your email");
    navigateTo(`/auth/verify-otp?email=${encodeURIComponent(state.email)}&type=LOGIN`);
  } catch (error) {
    loading.value = false;
    toast.error(error.data.statusMessage);
  }
}
</script>
