<template>
  <UDropdown
    mode="hover"
    :items="items"
    :ui="{ width: 'w-full', item: { disabled: 'cursor-text select-text' } }"
    :popper="{ strategy: 'absolute', placement: 'top' }"
    class="w-full"
  >
    <button
      class="flex items-center gap-x-2 w-full text-left hover:bg-gray-100 dark:hover:bg-white/10 p-1 rounded-lg"
    >
      <UAvatar
        :src="user.avatarUrl"
        size="sm"
        :alt="user.name"
        :ui="{
          rounded: 'rounded-md',
          size: {
            sm: 'w-9 h-9',
          },
        }"
        class="ring-1 ring-gray-200 dark:ring-white/20"
      />
      <div class="min-w-0">
        <p class="block truncate text-sm font-medium text-gray-950 dark:text-white">
          {{ user.name }}
        </p>
        <p class="block truncate text-xs font-normal text-gray-500 dark:text-gray-400">
          {{ user.email }}
        </p>
      </div>
      <span class="flex-1" />
      <Icon name="i-ph-dots-three-outline-vertical-fill" class="text-gray-500 flex-shrink-0" />
    </button>
  </UDropdown>
</template>

<script setup>
const { user, clear } = useUserSession();
const colorMode = useColorMode();
const isAdmin = computed(() => user.value?.role === "ADMIN");
const isDark = computed({
  get() {
    return colorMode.value === "dark";
  },
  set(value) {
    colorMode.preference = value ? "dark" : "light";
  },
});

const items = computed(() => {
  let links = [
    [
      {
        label: "Settings",
        icon: "i-ph-gear-duotone",
        to: "/dashboard/settings",
        exact: true,
      },
      {
        label: "Billing",
        icon: "i-ph-receipt-duotone",
        to: "/dashboard/settings/billing",
        exact: true,
      },
      {
        label: `${isDark.value ? "Light" : "Dark"} Mode`,
        icon: isDark.value ? "i-ph-sun-dim-duotone" : "i-ph-moon-duotone",
        click: () => (isDark.value = !isDark.value),
      },
    ],
  ];

  if (isAdmin.value) {
    links.push([
      {
        label: "Admin",
        icon: "i-ph-identification-badge-duotone",
        click: () => navigateTo("/admin"),
      },
    ]);
  }

  links.push([
    {
      label: "Sign out",
      icon: "i-ph-sign-out",
      click: () => signOut(),
    },
  ]);

  return links;
});

async function signOut() {
  await clear();
  return navigateTo("/");
}
</script>
