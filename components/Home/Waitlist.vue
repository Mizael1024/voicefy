<script setup>
import { toast } from "vue-sonner";
import { z } from "zod";
const loading = ref(false);
const schema = z.object({
  email: z.string().email("Invalid email"),
});

const state = reactive({
  email: undefined,
});

async function onSubmit(event) {
  try {
    loading.value = true;
    await $fetch("/api/waitlist", { method: "POST", body: { email: event.data.email } });
    toast.success("You have been added to the waitlist");
  } catch (error) {
    console.error(error);
    toast.error(error.data?.statusMessage ?? "An error occurred");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4 w-full sm:w-96" @submit="onSubmit">
    <UFormGroup name="email" size="lg">
      <UInput v-model="state.email" placeholder="Email" type="email" />
    </UFormGroup>
    <UButton
      :loading="loading"
      color="black"
      type="submit"
      :disabled="loading"
      size="lg"
      block
      label="Join waitlist"
    />
  </UForm>
</template>
