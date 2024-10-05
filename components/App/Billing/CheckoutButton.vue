<template>
  <UButton
    :label="label"
    color="black"
    block
    size="lg"
    :disabled="isActive || loading"
    :loading="loading"
    @click="createCheckout"
  />
</template>

<script setup>
const { baseUrl } = useRuntimeConfig().public;
import { toast } from "vue-sonner";
const loading = ref(false);
const props = defineProps({
  variantId: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
  },
});
const createCheckout = async () => {
  try {
    loading.value = true;
    const data = await $fetch("/api/payment/checkout", {
      method: "POST",
      body: {
        variantId: props.variantId,
        redirectUrl: `${baseUrl}/dashboard/settings/billing`,
      },
    });
    window.location.href = data;
  } catch (error) {
    loading.value = false;
    toast.error("Error creating checkout link");
  }
};
</script>
