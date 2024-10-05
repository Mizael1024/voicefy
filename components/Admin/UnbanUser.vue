<template>
  <div class="p-6 space-y-2">
    <p class="text-lg font-semibold">Unban User</p>
    <p>Are you sure you want to unban this user?</p>
    <p class="text-sm text-gray-500">Reason</p>
    <div
      class="bg-gray-100 dark:bg-white/10 p-4 rounded-lg border border-gray-200 dark:border-white/10 text-sm"
    >
      {{ user.bannedReason }}
    </div>
    <div class="!mt-6 flex justify-end space-x-2">
      <UButton color="gray" @click="$emit('close')">Cancel</UButton>
      <UButton color="green" :loading="loading" :disabled="loading" @click="unbanUser">
        Confirm Unban
      </UButton>
    </div>
  </div>
</template>

<script setup>
import { toast } from "vue-sonner";

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close"]);

const loading = ref(false);

async function unbanUser() {
  try {
    loading.value = true;
    await $fetch(`/api/admin/users/${props.user.id}/ban`, {
      method: "POST",
      body: {
        userId: props.user.id,
        status: false,
      },
    });
    toast.success("User unbanned successfully");
    emit("close");
  } catch (error) {
    toast.error(error.data ? error.data.statusMessage : "An unknown error occurred");
  } finally {
    loading.value = false;
  }
}
</script>
