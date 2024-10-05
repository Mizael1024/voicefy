<template>
  <div class="fixed inset-0 flex overflow-hidden">
    <AdminSidebar />
    <div class="flex flex-1 w-full min-w-0">
      <div class="flex-col items-stretch relative w-full flex-1 flex">
        <NuxtPage />
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["auth", "admin"],
});
</script>
