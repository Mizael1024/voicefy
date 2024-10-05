<template>
  <NuxtLoadingIndicator />
  <Toaster position="top-center" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { Toaster } from "vue-sonner";
const appConfig = useAppConfig();
useSeoMeta({
  title: appConfig.seo.title,
  description: appConfig.seo.description,
});
</script>
