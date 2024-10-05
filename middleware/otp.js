export default defineNuxtRouteMiddleware((to) => {
  if (!to.query.email || !to.query.type) {
    return navigateTo("/auth/login");
  }
});
