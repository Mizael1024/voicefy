<template>
  <main class="flex flex-col items-center justify-center h-screen">
    <div class="w-full max-w-sm mx-auto space-y-4">
      <img src="/logo.png" alt="Microbot" class="h-8 w-auto" />
      <h1 class="font-semibold text-2xl">Reset Password</h1>
      <p class="text-sm">Enter your email and we'll send you instructions to reset your password</p>
      <UForm :schema="schema" :state="state" class="space-y-4 max-w-sm" @submit="onSubmit">
        <UFormGroup label="Email" name="email" size="lg">
          <UInput v-model="state.email" />
        </UFormGroup>
        <UButton :loading="loading" color="black" type="submit" :disabled="loading" size="lg" block>
          Sign In
        </UButton>
      </UForm>
    </div>
  </main>
</template>

<script setup>
import { z } from "zod";
import { toast } from "vue-sonner";

const schema = z.object({
  email: z.string().email("Invalid email"),
});

const state = reactive({
  email: undefined,
});

const loading = ref(false);

async function onSubmit(event) {
  try {
    loading.value = true;
    await $fetch("/api/auth/reset-password", { method: "POST", body: event.data });
    toast("Email sent", {
      description: "Instructions to reset your password have been sent to your email",
    });
  } catch (error) {
    loading.value = false;
    toast.error(error.data.statusMessage);
  } finally {
    loading.value = false;
  }
}
</script>
