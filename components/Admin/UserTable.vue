<template>
  <div class="rounded-lg border border-gray-200 dark:border-white/10">
    <UTable :loading="loading" :rows="rows" :columns="columns">
      <template #avatar-data="{ row }">
        <UAvatar :src="row.avatarUrl" :alt="row.name" size="sm" />
      </template>

      <template #name-data="{ row }">
        {{ row.name }}
      </template>

      <template #email-data="{ row }">
        {{ maskedEmail(row.email) }}
      </template>

      <template #emailVerified-data="{ row }">
        <UIcon
          name="i-ph-check-circle-duotone"
          v-if="row.emailVerified"
          class="text-green-500 text-2xl"
        />
        <UIcon
          name="i-ph-circle-duotone"
          v-else
          class="text-2xl text-gray-300 dark:text-gray-600"
        />
      </template>

      <template #banned-data="{ row }">
        <UIcon name="i-ph-check-circle-duotone" v-if="row.banned" class="text-red-500 text-2xl" />
        <UIcon
          name="i-ph-circle-duotone"
          v-else
          class="text-2xl text-gray-300 dark:text-gray-600"
        />
      </template>

      <template #role-data="{ row }">
        <UBadge :color="row.role === 'ADMIN' ? 'red' : 'blue'" variant="subtle">
          {{ row.role }}
        </UBadge>
      </template>

      <template #linkedAccounts-data="{ row }">
        <div class="flex items-center gap-x-2">
          <Icon
            v-for="account in row.linkedAccounts"
            :key="account"
            :name="getProviderIcon(account)"
            class="h-4 w-4"
          />
        </div>
      </template>

      <template #passkeyConnected-data="{ row }">
        <UIcon
          name="i-ph-check-circle-duotone"
          v-if="row.passkeyConnected"
          class="text-green-500 text-2xl"
        />
        <UIcon
          name="i-ph-circle-duotone"
          v-else
          class="text-2xl text-gray-300 dark:text-gray-600"
        />
      </template>

      <template #createdAt-data="{ row }">
        {{ formatDate(row.createdAt) }}
      </template>

      <template #lastActive-data="{ row }">
        {{ timeAgo(row.lastActive) }}
      </template>

      <template #actions-data="{ row }">
        <UDropdown :ui="{ width: 'w-64' }" :items="getActionItems(row)">
          <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
        </UDropdown>
      </template>
    </UTable>
  </div>
</template>

<script setup>
import { useDateFormat, useTimeAgo } from "@vueuse/core";

const props = defineProps({
  rows: Array,
  loading: Boolean,
  getActionItems: Function,
  totalRows: Number,
  page: Number,
  pageSize: Number,
  maskEmails: Boolean,
});

const emit = defineEmits(["update:page", "update:pageSize"]);

const currentPage = computed({
  get: () => props.page,
  set: (value) => emit("update:page", value),
});

const pageSize = computed({
  get: () => props.pageSize,
  set: (value) => emit("update:pageSize", value),
});

const pageFrom = computed(() => (currentPage.value - 1) * pageSize.value + 1);
const pageTo = computed(() => Math.min(currentPage.value * pageSize.value, props.totalRows));

const columns = [
  { key: "avatar", label: "Avatar" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "emailVerified", label: "Verified" },
  { key: "banned", label: "Banned" },
  { key: "role", label: "Role" },
  { key: "createdAt", label: "Created" },
  { key: "lastActive", label: "Last Active" },
  { key: "linkedAccounts", label: "Linked" },
  { key: "passkeyConnected", label: "Passkey" },
  { key: "actions", label: "" },
];

const formatDate = (dateString) => {
  return useDateFormat(new Date(dateString), "DD MMM YY");
};

const timeAgo = (dateString) => {
  return useTimeAgo(new Date(dateString));
};

const getProviderIcon = (providerId) => {
  const icons = {
    google: "i-logos-google-icon",
    github: "i-bi-github",
    twitter: "i-logos-twitter",
  };
  return icons[providerId.toLowerCase()] || "i-ph-link";
};

function maskedEmail(email) {
  if (!props.maskEmails) {
    return email;
  }

  const [localPart, domain] = email.split("@");
  if (!domain) {
    return email;
  }

  let maskedLocal = localPart[0] + "•".repeat(Math.max(localPart.length - 1, 2));
  return `${maskedLocal}@${domain}`;
}
</script>
