<template>
  <div
    class="flex-col items-stretch relative w-full border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-white/10 lg:w-64 flex-shrink-0 hidden lg:flex"
  >
    <div class="flex h-12 px-6">
      <NuxtLink to="/dashboard" class="flex items-center gap-2 font-semibold">
        <img src="/logo.png" class="h-6 w-auto" />
        <span class="">microbot</span>
      </NuxtLink>
    </div>
    <div class="flex flex-col w-full flex-1 relative overflow-hidden">
      <div class="flex-grow flex flex-col min-h-0 gap-y-2 py-2">
        <div class="flex-1 px-4 flex flex-col gap-y-2 overflow-y-auto">
          <UVerticalNavigation :links="links" :ui="navigationUiClasses" />
        </div>
      </div>
      <div class="p-2">
        <AuthState v-slot="{ loggedIn }">
          <AppUserDropdown v-if="loggedIn" />
        </AuthState>
      </div>
    </div>
  </div>

  <ClientOnly>
    <USlideover v-if="smallerThanLg" v-model="mobileSidebar" side="left" class="lg:hidden">
      <div
        class="flex-col flex h-screen items-stretch relative w-full border-gray-200 dark:border-white/10"
      >
        <div class="flex h-12 px-4 items-center justify-between">
          <NuxtLink to="/dashboard" class="flex items-center gap-2 font-semibold">
            <img src="/logo.png" class="h-6 w-auto" />
            <span class="">microbot</span>
          </NuxtLink>
          <UButton
            icon="i-ph-x"
            square
            color="gray"
            variant="soft"
            size="xs"
            @click="mobileSidebar = false"
          />
        </div>
        <div class="flex flex-col w-full flex-1 relative overflow-hidden">
          <div class="flex-grow flex flex-col min-h-0 gap-y-2 py-2">
            <div class="flex-1 px-2 flex flex-col gap-y-2 overflow-y-auto">
              <UVerticalNavigation :links="links" :ui="navigationUiClasses" />
            </div>
          </div>
          <div class="p-2">
            <AuthState v-slot="{ loggedIn }">
              <AppUserDropdown v-if="loggedIn" />
            </AuthState>
          </div>
        </div>
      </div>
    </USlideover>
  </ClientOnly>
</template>

<script setup>
import { useBreakpoints, breakpointsTailwind } from "@vueuse/core";
const breakpoints = useBreakpoints(breakpointsTailwind);
const smallerThanLg = breakpoints.smaller("lg");
const mobileSidebar = useState("mobileSidebar", () => false);

const links = [
  {
    label: "Home",
    to: "/dashboard",
    icon: "i-ph-house-line-duotone",
    exact: true,
    click: () => (mobileSidebar.value = false),
  },
  {
    label: "Posts",
    to: "/dashboard/posts",
    icon: "i-ph-note-duotone",
    badge: "Demo",
    exact: true,
    click: () => (mobileSidebar.value = false),
  },
  {
    label: "Image Gallery",
    to: "/dashboard/image-gallery",
    icon: "i-ph-images-duotone",
    badge: "Demo",
    exact: true,
    click: () => (mobileSidebar.value = false),
  },
  {
    label: "Settings",
    to: "/dashboard/settings",
    icon: "i-ph-gear-duotone",
    click: () => (mobileSidebar.value = false),
  },
];

const navigationUiClasses = {
  padding: "px-2 py-2.5",
  rounded: "rounded-lg",
  base: "gap-3",
};
</script>
