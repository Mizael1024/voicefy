<template>
  <UContainer class="py-8">
    <div class="flex items-center gap-4 justify-between p-2">
      <div class="ml-2 font-semibold">Supersaas</div>
      <span class="flex-1" />
      <UButton color="black" :to="loggedIn ? '/dashboard' : '/auth/login'">
        {{ loggedIn ? "Dashboard" : "Login" }}
      </UButton>
      <UButton color="black" to="/auth/register">Register</UButton>
    </div>
    <section class="py-32 space-y-6 text-center flex flex-col items-center max-w-4xl mx-auto">
      <h1 class="font-bold text-4xl sm:text-7xl">Your Super Catchy Title</h1>
      <p class="text-xl text-gray-500">Get started with your new startup</p>
      <HomeWaitlist />
    </section>
  </UContainer>
</template>

<script setup>
const { loggedIn } = useUserSession();
</script>
