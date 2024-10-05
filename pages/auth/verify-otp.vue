<template>
  <main class="min-h-screen flex items-center justify-center flex-col">
    <div class="w-full text-center">
      <div
        class="bg-gray-100 dark:bg-white/10 h-12 w-12 flex items-center justify-center rounded-lg ring-1 ring-gray-300 dark:ring-white/20 mx-auto"
      >
        <Icon name="i-ph-envelope-duotone" class="h-6 w-6 text-gray-600 dark:text-gray-300" />
      </div>
      <h1 class="font-semibold text-2xl mt-4">Check your email</h1>
      <p class="text-gray-500 text-sm mt-1">
        We've sent a 6 digit code to
        <span class="font-semibold">{{ $route.query.email }}</span>
      </p>
      <div class="mt-4 flex flex-col max-w-max gap-4 mx-auto">
        <div class="flex gap-2 items-center">
          <PinInputRoot
            v-model="code"
            placeholder="○"
            class="flex gap-2 mx-auto"
            @complete="submit"
          >
            <PinInputInput
              v-for="(id, index) in 6"
              :key="id"
              :index="index"
              class="w-12 h-12 rounded-md border border-gray-300 dark:border-white/20 text-center shadow-sm focus:border-gray-400 dark:focus:border-gray-600 focus:ring focus:ring-gray-500 dark:focus:ring-gray-700 focus:ring-opacity-20 focus:outline-none"
            />
          </PinInputRoot>
        </div>
        <div class="flex">
          <UButton
            size="lg"
            color="black"
            label="Verify code"
            block
            :loading="loading"
            :disabled="loading"
            @click="submit"
          />
        </div>
      </div>
      <p class="text-xs mt-4 text-gray-500">
        Didn't receive the code?
        <UButton
          :disabled="otpDisabled"
          @click="resendOtp"
          variant="ghost"
          color="gray"
          class="px-0.5 -mx-0.5"
          size="xs"
        >
          Click to resend
        </UButton>
        <span v-if="otpDisabled" class="ml-1">({{ timer }}s)</span>
      </p>
      <UButton
        to="/auth/login"
        class="mt-8"
        label="← Back to login"
        icon="i-lucide-arrow-left"
        variant="link"
        color="gray"
      />
    </div>
  </main>
</template>

<script setup>
definePageMeta({
  middleware: "otp",
});
const { fetch: refreshSession } = useUserSession();
import { PinInputInput, PinInputRoot } from "radix-vue";
import { toast } from "vue-sonner";
import { useRouter } from "vue-router";

const route = useRouter().currentRoute.value;
const { email, type } = route.query;
const code = ref([]);
const loading = ref(false);
const otpDisabled = ref(false);
const timer = ref(0);
let timerInterval = null;

async function submit() {
  try {
    loading.value = true;
    if (code.value.length !== 6) return;
    await $fetch("/api/auth/verify-otp", {
      method: "POST",
      body: { email, type, code: code.value.join("") },
    });
    toast.success("OTP has been verified");
    await refreshSession();
    return navigateTo("/dashboard");
  } catch (error) {
    toast.error(`Error: ${error.data.statusMessage}`);
    loading.value = false;
  }
}

async function resendOtp() {
  try {
    await $fetch("/api/auth/resend-otp", { method: "POST", body: { email, type } });
    toast("Resent OTP sent to your email");
    startTimer(60);
  } catch (error) {
    console.log(error);
    loading.value = false;
    toast.error(error?.data?.statusMessage ?? "An error occurred");
  }
}

function startTimer(duration) {
  otpDisabled.value = true;
  timer.value = duration;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (timer.value > 0) {
      timer.value--;
    } else {
      otpDisabled.value = false;
      clearInterval(timerInterval);
    }
  }, 1000);
}
</script>
