<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormGroup label="Name" name="name" size="lg">
      <UInput v-model="state.name" />
    </UFormGroup>
    <UFormGroup label="Email" name="email" size="lg">
      <UInput v-model="state.email" />
    </UFormGroup>
    <UFormGroup label="Password" name="password" size="lg">
      <UInput v-model="state.password" type="password" />
    </UFormGroup>
    <UButton block color="black" type="submit" size="lg" :loading="loading" :disabled="loading">
      Create Account
    </UButton>
  </UForm>
</template>

<script setup>
import { z } from "zod";
import { toast } from "vue-sonner";

const loading = ref(false);
const schema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Must be at least 8 characters"),
});

const state = reactive({
  name: undefined,
  email: undefined,
  password: undefined,
});

async function onSubmit(event) {
  try {
    loading.value = true;
    await $fetch("/api/auth/register", { method: "POST", body: event.data });
    toast.success("Account created");
    return navigateTo(`/auth/verify-otp?email=${encodeURIComponent(state.email)}&type=SIGNUP`);
  } catch (error) {
    loading.value = false;
    if (error.data && error.data.data && error.data.data.name === "ZodError") {
      const issues = error.data.data.issues
        .map((issue) => {
          const path = issue.path.join(".");
          return `Invalid ${path}: ${issue.message}`;
        })
        .join("\n");
      console.log(issues);
    }
    toast.error(error.data ? error.data.statusMessage : "An unknown error occurred");
  }
}
</script>
