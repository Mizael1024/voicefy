export default defineNuxtRouteMiddleware((to) => {
  if (!to.query.token) {
    return navigateTo("/auth/login");
  }
});
