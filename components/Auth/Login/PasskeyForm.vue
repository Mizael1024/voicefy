<template>
  <UForm :schema="passkeySchema" :state="state" class="space-y-4 max-w-sm" @submit="onSubmit">
    <UFormGroup label="Email" name="email" size="lg">
      <UInput v-model="state.email" />
    </UFormGroup>
    <UButton :loading="loading" color="black" type="submit" :disabled="loading" size="lg" block>
      Login with fingerprint
    </UButton>
  </UForm>
</template>

<script setup>
import { z } from "zod";
import { toast } from "vue-sonner";
import { startAuthentication } from "@simplewebauthn/browser";
const { fetch: refreshSession } = useUserSession();

const passkeySchema = z.object({
  email: z.string().email("Invalid email"),
});

const state = reactive({
  email: undefined,
});

const loading = ref(false);

async function getAuthenticationOptionsJSON(email) {
  const options = await $fetch("/api/auth/passkey/login/create-key", {
    method: "POST",
    body: {
      email,
    },
  });
  return options;
}

async function loginUserWithPasskey(challenge, email, authenticationResponse) {
  const user = await $fetch("/api/auth/passkey/login/login-user", {
    method: "POST",
    body: {
      email,
      challenge,
      authenticationResponse,
    },
  });
  return user;
}

async function onSubmit(event) {
  try {
    loading.value = true;
    const authenticationOptionsJSON = await getAuthenticationOptionsJSON(event.data.email);
    const authenticationResponse = await startAuthentication(authenticationOptionsJSON);
    await loginUserWithPasskey(
      authenticationOptionsJSON.challenge,
      event.data.email,
      authenticationResponse,
    );
    await refreshSession();
    toast.success("Logged in successfully");
    return navigateTo(`/dashboard`);
  } catch (error) {
    console.error(error);
    toast.error(error.data?.statusMessage ?? "An error occurred during login");
  } finally {
    loading.value = false;
  }
}
</script>
