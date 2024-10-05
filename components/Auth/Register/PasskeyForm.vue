<template>
  <UForm :schema="passkeySchema" :state="state" class="space-y-4 max-w-sm" @submit="onSubmit">
    <UFormGroup label="Name" name="name" size="lg">
      <UInput v-model="state.name" />
    </UFormGroup>
    <UFormGroup label="Email" name="email" size="lg">
      <UInput v-model="state.email" />
    </UFormGroup>
    <UButton :loading="loading" color="black" type="submit" :disabled="loading" size="lg" block>
      Create Account
    </UButton>
  </UForm>
</template>

<script setup>
import { startRegistration } from "@simplewebauthn/browser";
import { z } from "zod";
import { toast } from "vue-sonner";
const { fetch: refreshSession } = useUserSession();

const passkeySchema = z.object({
  email: z.string().email("Invalid email"),
  name: z.string().min(1).max(255),
});

const state = reactive({
  email: undefined,
  name: undefined,
});

const loading = ref(false);

async function getRegistrationOptions(event) {
  const { email, name } = event.data;
  const options = await $fetch("/api/auth/passkey/register/create-key", {
    method: "POST",
    body: {
      email,
      name,
    },
  });
  return options;
}

async function verifyRegistration(registrationResponse, challenge) {
  const verification = await $fetch("/api/auth/passkey/register/verify-key", {
    method: "POST",
    body: {
      credential: registrationResponse,
      challenge,
    },
  });
  return verification;
}

async function registerWithPasskey(event, verification) {
  const { email, name } = event.data;
  const user = await $fetch("/api/auth/passkey/register/create-user", {
    method: "POST",
    body: {
      email,
      name,
      verification,
    },
  });
  return user;
}

async function onSubmit(event) {
  try {
    loading.value = true;
    const creationOptionsJSON = await getRegistrationOptions(event);
    const registrationResponse = await startRegistration(creationOptionsJSON);
    const verificationResponse = await verifyRegistration(
      registrationResponse,
      creationOptionsJSON.challenge,
    );
    await registerWithPasskey(event, verificationResponse);
    toast("Account created with passkey");
    await refreshSession();
    return navigateTo(`/dashboard`);
  } catch (error) {
    console.log(error);
    loading.value = false;
    toast.error(error.data.statusMessage ?? "An error occurred");
  }
}
</script>
