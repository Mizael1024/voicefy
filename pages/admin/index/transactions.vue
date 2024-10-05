<template>
  <AppPageContainer title="Transactions" description="All transactions">
    <div class="rounded-lg border border-gray-200 dark:border-white/10">
      <UTable :rows="data" :columns="columns">
        <template #amount-data="{ row }">
          {{ formatCurrency(row.amount, row.currency) }}
        </template>

        <template #status-data="{ row }">
          <UBadge :color="getStatusColor(row.status)" variant="subtle">
            {{ row.status }}
          </UBadge>
        </template>

        <template #date-data="{ row }">
          {{ formatDate(row.date) }}
        </template>

        <template #customer-data="{ row }">
          <div>{{ row.customer }}</div>
        </template>

        <template #actions-data="{ row }">
          <UDropdown :items="getActionItems(row)">
            <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
          </UDropdown>
        </template>
      </UTable>
    </div>
  </AppPageContainer>
</template>

<script setup>
import { useDateFormat } from "@vueuse/core";

const { data } = await useFetch("/api/admin/billing/transactions");

const columns = [
  { key: "amount", label: "Amount" },
  { key: "status", label: "Status" },
  { key: "date", label: "Date" },
  { key: "customer", label: "Customer" },
  { key: "description", label: "Description" },
  { key: "actions", label: "" },
];

const formatCurrency = (amount, currency) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

const formatDate = (dateString) => {
  return useDateFormat(new Date(dateString), "DD MMM YYYY, HH:mm");
};

const getStatusColor = (status) => {
  const colors = {
    paid: "green",
    succeeded: "green",
    pending: "yellow",
    failed: "red",
  };
  return colors[status.toLowerCase()] || "gray";
};

function isValidURL(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

const getActionItems = (row) => [
  [
    {
      label: "View Invoice",
      icon: "i-ph-receipt-duotone",
      click: async () => {
        if (isValidURL(row.invoice)) {
          window.open(row.invoice, "_blank");
        } else {
          const invoice = await $fetch("/api/admin/billing/get-invoice", {
            query: { id: row.invoice },
          });
          if (invoice.hosted_invoice_url) {
            window.open(invoice.hosted_invoice_url, "_blank");
          }
        }
      },
    },
  ],
];
</script>
