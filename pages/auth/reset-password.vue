<template>
  <main class="flex flex-col items-center justify-center h-screen">
    <div class="w-full max-w-sm mx-auto space-y-4">
      <img src="/logo.png" alt="Microbot" class="h-8 w-auto" />
      <h1 class="font-semibold text-2xl">Set up a new password</h1>
      <p class="text-sm">Your password must be different from your previous one.</p>
      <UForm :schema="schema" :state="state" class="space-y-4 max-w-sm" @submit="onSubmit">
        <UFormGroup label="New password" name="password" size="lg">
          <UInput v-model="state.password" type="password" />
        </UFormGroup>
        <UFormGroup label="Confirm new password" name="passwordConfirmation" size="lg">
          <UInput v-model="state.passwordConfirmation" type="password" />
        </UFormGroup>
        <UButton :loading="loading" color="black" type="submit" :disabled="loading" size="lg" block>
          Reset password
        </UButton>
      </UForm>
    </div>
  </main>
</template>

<script setup>
definePageMeta({
  middleware: "reset-password",
});
import { z } from "zod";
import { toast } from "vue-sonner";

const route = useRouter().currentRoute.value;
const { token } = route.query;
const loading = ref(false);

const state = reactive({
  password: undefined,
  passwordConfirmation: undefined,
});

const schema = z
  .object({
    password: z.string().min(8, "Must be at least 8 characters"),
    passwordConfirmation: z.string().min(8, "Must be at least 8 characters"),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords must match",
    path: ["passwordConfirmation"],
  });

async function onSubmit(event) {
  try {
    loading.value = true;
    await $fetch("/api/auth/reset-password", {
      method: "PATCH",
      body: { password: state.password, code: token },
    });
    toast("Password reset", {
      description: "Password has been reset",
    });
    return navigateTo("/auth/login");
  } catch (error) {
    loading.value = false;
    toast.error(`Error: ${error.data.statusMessage}`);
  }
}
</script>
