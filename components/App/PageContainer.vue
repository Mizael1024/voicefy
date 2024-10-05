<template>
  <div class="grow p-4 lg:p-10 overflow-y-auto">
    <div class="flex items-center justify-between gap-2">
      <div class="max-w-[calc(100%-3rem)] min-w-0">
        <h1 class="text-base font-semibold sm:text-xl truncate">{{ title }}</h1>
        <p class="mt-1 text-sm text-gray-500 truncate">{{ description }}</p>
      </div>
      <div class="flex items-center gap-2">
        <UButton
          icon="i-ph-list"
          square
          color="white"
          variant="ghost"
          class="sm:hidden"
          @click="mobileSidebar = !mobileSidebar"
        />
      </div>
    </div>
    <div class="mt-4 sm:mt-8">
      <slot />
    </div>
  </div>
</template>

<script setup>
const mobileSidebar = useState("mobileSidebar");
defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
    default: "",
  },
});
</script>
