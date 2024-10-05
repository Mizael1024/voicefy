<template>
  <AppPageContainer title="Waitlist" :description="`${waitlist.length} users are on the waitlist`">
    <UTable :rows="waitlist" :columns="columns">
      <template #email-data="{ row }">
        {{ row.email }}
      </template>

      <template #referrer-data="{ row }">
        {{ row.referrer ?? "--" }}
      </template>

      <template #createdAt-data="{ row }">
        {{ formatDate(row.createdAt) }}
      </template>
    </UTable>
  </AppPageContainer>
</template>

<script setup>
import { useDateFormat } from "@vueuse/core";
const { data: waitlist } = await useFetch("/api/admin/waitlist");
const columns = [
  { key: "email", label: "Email" },
  { key: "referrer", label: "Referrer" },
  { key: "createdAt", label: "Created" },
];

const formatDate = (dateString) => {
  return useDateFormat(new Date(dateString), "DD MMM YY");
};
</script>
