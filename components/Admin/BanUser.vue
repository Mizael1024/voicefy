<template>
  <div class="p-6">
    <p class="text-lg font-semibold">Ban User</p>
    <UForm :schema="schema" :state="state" class="space-y-4 mt-6" @submit="onSubmit">
      <UFormGroup label="Ban Reason" name="bannedReason" size="lg">
        <UTextarea v-model="state.bannedReason" :rows="4" />
      </UFormGroup>
      <UButton block color="red" type="submit" size="lg" :loading="loading" :disabled="loading">
        Ban User
      </UButton>
    </UForm>
  </div>
</template>

<script setup>
import { z } from "zod";
import { toast } from "vue-sonner";

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close"]);

const loading = ref(false);
const schema = z.object({
  bannedReason: z.string().min(1, "Ban reason is required"),
});

const state = reactive({
  bannedReason: "",
});

async function onSubmit(event) {
  try {
    loading.value = true;
    await $fetch(`/api/admin/users/${props.user.id}/ban`, {
      method: "POST",
      body: {
        userId: props.user.id,
        status: true,
        bannedReason: event.data.bannedReason,
      },
    });
    toast.success("User banned successfully");
    emit("close");
  } catch (error) {
    toast.error(error.data ? error.data.statusMessage : "An unknown error occurred");
  } finally {
    loading.value = false;
  }
}
</script>
