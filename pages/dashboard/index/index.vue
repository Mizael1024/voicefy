<template>
  <AppPageContainer pretitle="overview" :title="`${greeting}, ${user.name}`">
    <DemoDashboardHome />
  </AppPageContainer>
</template>

<script setup>
const { user } = useUserSession();

const greeting = computed(() => {
  const time = new Date();
  const hours = time.getHours();
  if (hours < 12) {
    return "Good morning";
  } else if (hours < 18) {
    return "Good afternoon";
  } else {
    return "Good evening";
  }
});
</script>
