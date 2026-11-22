import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  withCredentials: true,
  withXSRFToken: true,
});

export function attachAuthInterceptor(instance) {
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error.response?.status;
      const url = error.config?.url ?? "";

      if (status === 401 && !url.endsWith("/user")) {
        const { useAuthStore } = await import("../stores/auth");
        const { default: router } = await import("../router");

        useAuthStore().clearUser();
        if (router.currentRoute.value.meta.requiresAuth) {
          router.push({
            name: "login",
            query: { redirect: router.currentRoute.value.fullPath },
          });
        }
      }
      return Promise.reject(error);
    },
  );
}

attachAuthInterceptor(api);

export default api;