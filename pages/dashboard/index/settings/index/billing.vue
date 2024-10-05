<template>
  <div>
    <p class="text-gray-500 text-sm">View and manage your billing information</p>
    <div class="mt-4 space-y-8">
      <AppBillingActiveSubscription
        v-if="data.activeSubscription"
        :subscription="data.activeSubscription"
      />
      <AppBillingFreeTrial v-else />
      <AppBillingPlanSelector
        :plans="data.plans"
        :active-variant-id="data.activeSubscription?.variantId"
      />
    </div>
  </div>
</template>

<script setup>
const { data } = await useFetch("/api/payment/subscription");
</script>
