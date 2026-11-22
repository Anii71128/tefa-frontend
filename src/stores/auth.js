import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  updateProfile as updateProfileRequest,
} from "../services/auth";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const ready = ref(false);

  const isLoggedIn = computed(() => !!user.value);

  async function fetchUser() {
    try {
      const data = await getCurrentUser();
      user.value = data.user ?? data;
    } catch {
      user.value = null;
    } finally {
      ready.value = true;
    }
  }

  async function clearStaleSession() {
    try {
      await getCurrentUser();
      await logoutRequest();
    } catch {
      
    }
    user.value = null;
  }

  async function login(credentials) {
    await clearStaleSession();
    await loginRequest(credentials);
    await fetchUser();
  }

  async function register(payload) {
    await clearStaleSession();
    await registerRequest(payload);
  }

  async function logout() {
    try {
      await logoutRequest();
    } finally {
      user.value = null;
    }
  }

  async function updateProfile(payload) {
    const data = await updateProfileRequest(payload);
    user.value = { ...user.value, ...data.user };
    return data;
  }

  function clearUser() {
    user.value = null;
  }

  return { user, ready, isLoggedIn, fetchUser, login, register, logout, updateProfile, clearUser };
});