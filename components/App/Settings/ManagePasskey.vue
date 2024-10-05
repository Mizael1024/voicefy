<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold leading-7 font-display">Manage Passkey</h2>
      </div>
      <p class="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
        Securely manage your passkey for this account.
      </p>
    </template>
    <div v-if="loading" class="flex justify-center">
      <UIcon name="i-ph-spinner" class="animate-spin" />
    </div>
    <div v-else>
      <div v-if="hasPasskey" class="flex items-center gap-2">
        <UIcon name="i-ph-fingerprint" class="text-2xl text-green-500 flex-shrink-0" />
        <p class="text-sm">You have a passkey linked to this account.</p>
        <span class="flex-1" />
        <UButton
          color="rose"
          variant="soft"
          icon="i-ph-trash"
          @click="deletePasskey"
          :loading="deleting"
          :disabled="deleting"
        >
          Delete Passkey
        </UButton>
      </div>
      <div v-else class="flex items-center gap-2 flex-wrap">
        <UIcon name="i-ph-fingerprint" class="text-green-500 text-xl flex-shrink-0" />
        <p>You don't have a passkey linked to this account.</p>
        <span class="flex-1" />
        <UButton
          size="lg"
          color="black"
          @click="createPasskey"
          :loading="creating"
          :disabled="creating"
        >
          Create Passkey
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup>
import { startRegistration } from "@simplewebauthn/browser";
import { toast } from "vue-sonner";

const hasPasskey = ref(false);
const loading = ref(true);
const creating = ref(false);
const deleting = ref(false);

async function checkPasskeyStatus() {
  try {
    const { hasCredential } = await $fetch("/api/auth/passkey/credentials");
    hasPasskey.value = hasCredential;
  } catch (error) {
    console.error(error);
    toast.error("Failed to check passkey status");
  } finally {
    loading.value = false;
  }
}

async function createPasskey() {
  try {
    creating.value = true;
    const creationOptionsJSON = await $fetch("/api/auth/passkey/manage/create-key", {
      method: "POST",
    });
    const registrationResponse = await startRegistration(creationOptionsJSON);
    await $fetch("/api/auth/passkey/manage/verify-key", {
      method: "POST",
      body: {
        credential: registrationResponse,
      },
    });
    toast.success("Passkey created successfully");
    await checkPasskeyStatus();
  } catch (error) {
    console.error(error);
    toast.error(error.data?.statusMessage ?? "Failed to create passkey");
  } finally {
    creating.value = false;
  }
}

async function deletePasskey() {
  try {
    deleting.value = true;
    await $fetch("/api/auth/passkey/manage", {
      method: "DELETE",
    });
    toast.success("Passkey deleted successfully");
    await checkPasskeyStatus();
  } catch (error) {
    console.error(error);
    toast.error(error.data?.statusMessage ?? "Failed to delete passkey");
  } finally {
    deleting.value = false;
  }
}

onMounted(checkPasskeyStatus);
</script>
