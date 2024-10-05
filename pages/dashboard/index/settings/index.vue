<template>
  <AppPageContainer title="Account Settings">
    <UHorizontalNavigation :links="links" class="border-b border-gray-100 dark:border-gray-800" />
    <div class="py-4">
      <NuxtPage />
    </div>
  </AppPageContainer>
</template>

<script setup>
const links = [
  {
    label: "Profile",
    to: "/dashboard/settings",
    exact: true,
  },
  {
    label: "Billing",
    to: "/dashboard/settings/billing",
    exact: true,
  },
];
</script>
