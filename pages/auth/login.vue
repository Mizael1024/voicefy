<template>
  <main class="flex flex-col items-center justify-center h-screen">
    <div class="w-full max-w-sm mx-auto space-y-6">
      <img src="/logo.png" alt="Microbot" class="h-8 w-auto" />
      <h1 class="font-semibold text-2xl">Login</h1>
      <p class="text-sm">Enter your email and password to login to your account</p>
      <div class="border-b-2 border-gray-200 dark:border-white/20 grid grid-cols-3 relative">
        <span
          id="mode-indicator"
          class="w-1/3 absolute h-0.5 -bottom-0.5 bg-gray-500 dark:bg-gray-200 pointer-events-none transition-all duration-300"
          :style="{ left: indicatorLeftPosition }"
        />
        <UButton
          v-for="modeOption in modeOptions"
          :key="modeOption.value"
          size="lg"
          :label="modeOption.label"
          variant="ghost"
          color="gray"
          block
          class="rounded-b-none"
          :class="{ 'text-gray-400 dark:text-gray-600': mode !== modeOption.value }"
          @click="changeMode(modeOption.value)"
        />
      </div>
      <AuthLoginMagicLinkForm v-if="mode === 'magicLink'" />
      <AuthLoginPasswordForm v-if="mode === 'password'" />
      <AuthLoginPasskeyForm v-if="mode === 'passkey'" />
      <UDivider label="OR" />
      <AuthSocialLogin />
      <p class="text-sm text-center">
        Don't have an account?
        <UButton to="/auth/register" variant="link" :padded="false" color="gray">Sign up</UButton>
      </p>
    </div>
  </main>
</template>

<script setup>
const mode = ref("magicLink");
const modeOptions = [
  { label: "Magic Link", value: "magicLink" },
  { label: "Password", value: "password" },
  { label: "Passkey", value: "passkey" },
];

function changeMode(newMode) {
  mode.value = newMode;
}

const indicatorLeftPosition = computed(() => {
  const index = modeOptions.findIndex((option) => option.value === mode.value);
  return `${index * 33.333}%`;
});
</script>
