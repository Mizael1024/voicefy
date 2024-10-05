<template>
  <AppPageContainer title="Users" :description="`${usersData.totalCount} users have signed up`">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-2 flex-shrink-0">
        <UInput
          v-model="search"
          icon="i-heroicons-magnifying-glass-20-solid"
          color="white"
          :trailing="false"
          class="w-full"
          placeholder="Email or name"
        />
        <USelect v-model="selectedFilter" :options="filters" class="flex-shrink-0" />
        <div
          class="flex-shrink-0 flex items-center gap-2 bg-gray-100 dark:bg-white/10 p-2 rounded-lg"
        >
          <UToggle size="md" v-model="maskEmails" />
          <span class="text-xs font-medium">Mask Emails</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <UButton @click="addUserModal = true" label="Add User" color="white" />
        <UButton
          @click="downloadCSV"
          :loading="isExporting"
          label="Export all users"
          color="white"
        />
      </div>
    </div>
    <AdminUserTable
      :rows="users"
      :loading="status === 'pending'"
      :getActionItems="getActionItems"
      :totalRows="totalUsers"
      :page="page"
      :pageSize="pageSize"
      :maskEmails="maskEmails"
      @update:page="page = $event"
      @update:pageSize="pageSize = $event"
    />
    <div class="mt-4 flex items-center justify-between">
      <USelect v-model="pageSize" :options="[10, 20, 50, 100]" label="Rows per page" />
      <UPagination v-model="page" :total="totalUsers" :per-page="pageSize" />
    </div>
    <UModal v-model="addUserModal">
      <AdminAddUser @close="refreshAndCloseAddUserModal" />
    </UModal>
    <UModal v-model="banUserModal">
      <AdminBanUser v-if="selectedUser" :user="selectedUser" @close="refreshAndCloseBanUserModal" />
    </UModal>
    <UModal v-model="unbanUserModal">
      <AdminUnbanUser
        v-if="selectedUser"
        :user="selectedUser"
        @close="refreshAndCloseUnbanUserModal"
      />
    </UModal>
  </AppPageContainer>
</template>

<script setup>
import { toast } from "vue-sonner";
import { refDebounced, useWebWorkerFn } from "@vueuse/core";

const isExporting = ref(false);
const maskEmails = ref(true);
const addUserModal = ref(false);
const search = ref("");
const selectedFilter = ref("all");
const page = ref(1);
const pageSize = ref(10);
const totalUsers = ref(0);
const deletingUserId = ref(null);
const debouncedSearch = refDebounced(search, 350);

const banUserModal = ref(false);
const unbanUserModal = ref(false);
const selectedUser = ref(null);

const filters = [
  { label: "All Users", value: "all" },
  { label: "Verified Users", value: "verified" },
  { label: "Unverified Users", value: "unverified" },
  { label: "Google Users", value: "google" },
  { label: "GitHub Users", value: "github" },
];

const { workerFn: convertToCSV } = useWebWorkerFn((users) => {
  function replacer(key, value) {
    if (Array.isArray(value)) {
      return value.join("|");
    }
    return value === null ? "" : value;
  }
  const keys = Object.keys(users[0]);
  const csvRows = users.map((row) =>
    keys.map((key) => JSON.stringify(row[key], replacer)).join(","),
  );
  csvRows.unshift(keys.join(","));
  return csvRows.join("\n");
});

const downloadCSV = async () => {
  isExporting.value = true;
  try {
    const response = await $fetch("/api/admin/users/download");
    const csv = await convertToCSV(response);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
    toast.error("Failed to download CSV");
  } finally {
    isExporting.value = false;
  }
};

function replacer(key, value) {
  return value === null ? "" : value;
}

const {
  data: usersData,
  status,
  error,
  refresh,
} = await useFetch("/api/admin/users", {
  query: computed(() => ({
    page: page.value,
    pageSize: pageSize.value,
    search: debouncedSearch.value,
    filter:
      selectedFilter.value === "All Users"
        ? "all"
        : selectedFilter.value.toLowerCase().replace(" users", ""),
  })),
  watch: [debouncedSearch, selectedFilter, page, pageSize],
});

const users = computed(() => usersData.value?.users || []);
watchEffect(() => {
  if (usersData.value) {
    totalUsers.value = usersData.value.totalCount;
  }
});

watchEffect(() => {
  if (error.value) {
    console.error(error.value);
    toast.error("Failed to fetch users");
  }
});

const getActionItems = (row) => [
  [
    {
      label: "Send Password Reset Email",
      icon: "i-ph-lock-key-open-duotone",
      click: () => sendPasswordResetEmail(row.id),
    },
    {
      label: "Send Login magic link",
      icon: "i-ph-envelope-duotone",
      click: () => sendLoginLink(row.id),
    },
  ],
  [
    {
      label: `${row.banned ? "Unban" : "Ban"} User`,
      icon: "i-ph-user-circle-minus-duotone",
      click: () => openBanUnbanModal(row),
    },
    {
      label: "Delete User",
      icon: "i-ph-trash-duotone",
      loading: deletingUserId.value === row.id,
      click: () => deleteUser(row.id),
    },
  ],
];

const deleteUser = async (userId) => {
  console.log(`Deleting user with ID: ${userId}`);
  try {
    deletingUserId.value = userId;
    await $fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    toast.success("User deleted successfully");
    refresh();
  } catch (error) {
    console.error(error);
    toast.error("Failed to delete user");
  } finally {
    deletingUserId.value = null;
  }
};

const openBanUnbanModal = (user) => {
  selectedUser.value = user;
  if (user.banned) {
    unbanUserModal.value = true;
  } else {
    banUserModal.value = true;
  }
};

const refreshAndCloseBanUserModal = () => {
  refresh();
  banUserModal.value = false;
  selectedUser.value = null;
};

const refreshAndCloseUnbanUserModal = () => {
  refresh();
  unbanUserModal.value = false;
  selectedUser.value = null;
};

watch([banUserModal, unbanUserModal], ([newBanModal, newUnbanModal]) => {
  if (!newBanModal && !newUnbanModal) {
    selectedUser.value = null;
  }
});

const sendPasswordResetEmail = async (userId) => {
  try {
    await $fetch(`/api/admin/users/${userId}/send-password-reset-email`);
    toast.success("Password reset email sent successfully");
  } catch (error) {
    console.error(error);
    toast.error("Failed to send password reset email");
  }
};

const sendLoginLink = async (userId) => {
  try {
    await $fetch(`/api/admin/users/${userId}/send-login-link`, {
      method: "POST",
    });
    toast.success("Login link sent successfully");
  } catch (error) {
    console.error(error);
    toast.error("Failed to send login link");
  }
};

const refreshAndCloseAddUserModal = () => {
  refresh();
  addUserModal.value = false;
};
</script>
