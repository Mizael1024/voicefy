<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold leading-7 font-display">Manage Linked Accounts</h2>
      </div>
      <p class="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
        View and manage your linked social accounts.
      </p>
    </template>
    <div v-if="loading" class="flex justify-center">
      <UIcon name="i-ph-spinner" class="animate-spin" />
    </div>
    <div v-else>
      <div v-if="linkedAccounts.length === 0" class="text-center py-4">
        <p>You don't have any linked accounts.</p>
      </div>
      <ul v-else role="list" class="divide-y divide-gray-100 dark:divide-gray-800">
        <li
          v-for="account in linkedAccounts"
          :key="account.id"
          class="flex items-center justify-between gap-6 py-4"
        >
          <div class="flex gap-x-4">
            <UIcon
              :name="getProviderIcon(account.providerId)"
              class="h-6 w-6 flex-none rounded-full"
            />
            <div class="min-w-0 flex-auto flex items-center gap-x-2">
              <p class="text-sm font-semibold leading-6 capitalize">{{ account.providerId }}</p>
              <p class="mt-px truncate text-xs leading-5 text-gray-500">
                Connected on {{ formatDate(account.createdAt) }}
              </p>
            </div>
          </div>
          <UButton
            color="rose"
            variant="soft"
            icon="i-ph-trash"
            :loading="unlinking === account.id"
            :disabled="unlinking === account.id"
            @click="unlinkAccount(account.id)"
          >
            Unlink
          </UButton>
        </li>
      </ul>
    </div>
  </UCard>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { toast } from "vue-sonner";

const linkedAccounts = ref([]);
const loading = ref(true);
const unlinking = ref(null);

const getProviderIcon = (providerId) => {
  const icons = {
    google: "i-logos-google-icon",
    github: "i-bi-github",
    twitter: "i-logos-twitter",
  };
  return icons[providerId.toLowerCase()] || "i-ph-link";
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

const fetchLinkedAccounts = async () => {
  try {
    loading.value = true;
    const response = await $fetch("/api/auth/linked-accounts");
    linkedAccounts.value = response.accounts;
  } catch (error) {
    console.error(error);
    toast.error("Failed to fetch linked accounts");
  } finally {
    loading.value = false;
  }
};

const unlinkAccount = async (accountId) => {
  try {
    unlinking.value = accountId;
    await $fetch("/api/auth/linked-accounts", {
      method: "DELETE",
      body: { accountId },
    });
    toast.success("Account unlinked successfully");
    await fetchLinkedAccounts();
  } catch (error) {
    console.error(error);
    toast.error(error.data?.statusMessage ?? "Failed to unlink account");
  } finally {
    unlinking.value = null;
  }
};

onMounted(fetchLinkedAccounts);
</script>
