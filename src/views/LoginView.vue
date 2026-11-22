<script setup>
import { computed, nextTick, onMounted, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { Eye, EyeOff } from "lucide-vue-next";
import { useAuthStore } from "../stores/auth";
import { redirectToBackend } from "../utils/roles";
import logo from "../assets/logo-tefa.png";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const REMEMBER_KEY = "tefa_remember_email";
const REGISTERED_KEY = "tefa_registered_email";

function readStorage(storage, key) {
  try {
    return storage.getItem(key) || "";
  } catch {
    return "";
  }
}

function writeStorage(storage, key, value) {
  try {
    if (value) storage.setItem(key, value);
    else storage.removeItem(key);
  } catch {

  }
}

const fromRegister = !!route.query.registered;
const registeredEmail = fromRegister ? readStorage(sessionStorage, REGISTERED_KEY) : "";
const savedEmail = fromRegister ? "" : readStorage(localStorage, REMEMBER_KEY);

const form = ref({
  email: registeredEmail || savedEmail,
  password: "",
  remember: !!savedEmail,
});
const loading = ref(false);
const showPassword = ref(false);
const errorMessage = ref("");
const fieldErrors = ref({});
const passwordInput = ref(null);

function saveEmailPreference() {
  writeStorage(localStorage, REMEMBER_KEY, form.value.remember ? form.value.email : "");
  writeStorage(sessionStorage, REGISTERED_KEY, "");
}

function getSafeRedirect() {
  const target = route.query.redirect;
  if (typeof target !== "string") return null;
  const isInternal = target.startsWith("/") && !target.startsWith("//");
  const isAuthPage = /^\/(login|register)(\/|\?|$)/.test(target);
  return isInternal && !isAuthPage ? target : null;
}

const registerLink = computed(() => ({
  name: "register",
  query: route.query.redirect ? { redirect: route.query.redirect } : {},
}));

onMounted(() => {
  if (form.value.email) passwordInput.value?.focus();
});

async function handleLogin() {
  errorMessage.value = "";
  fieldErrors.value = {};
  loading.value = true;
  let refocusPassword = false;

  try {
    await auth.login(form.value);
    saveEmailPreference();

    if (!auth.user) {
      errorMessage.value = "Login berhasil, tetapi data akun gagal dimuat. Coba muat ulang halaman.";
      return;
    }

    const role = auth.user.role;

    if (role === "user") {
      await router.push(getSafeRedirect() ?? "/");
      return;
    }

    if (redirectToBackend(role)) return;

    errorMessage.value = "Login berhasil, tetapi role akun belum memiliki tujuan halaman.";
  } catch (error) {
    const status = error.response?.status;
    const data = error.response?.data;

    if (status === 422) {
      const emailError = data?.errors?.email?.[0] ?? "";

      if (/too many|terlalu banyak/i.test(emailError)) {
        const seconds = emailError.match(/(\d+)\s*(second|detik)/i)?.[1];
        errorMessage.value = seconds
          ? `Terlalu banyak percobaan. Coba lagi dalam ${seconds} detik.`
          : "Terlalu banyak percobaan. Coba lagi beberapa saat lagi.";
      } else if (/credentials|match our records|tidak cocok/i.test(emailError)) {
        errorMessage.value = "Email atau password salah. Periksa kembali lalu coba lagi.";
        refocusPassword = true;
      } else if (data?.errors) {
        fieldErrors.value = data.errors;
      } else {
        errorMessage.value = data?.message || "Email atau password salah.";
      }
    } else if (status === 419) {
      errorMessage.value = "Sesi keamanan kedaluwarsa. Silakan coba login kembali.";
    } else if (status === 429) {
      errorMessage.value = "Terlalu banyak percobaan. Coba lagi beberapa saat lagi.";
    } else {
      console.error("Login gagal:", error);
      const detail = error.response
        ? `kode ${status}`
        : "tidak ada respons, cek CORS atau alamat server di .env";
      errorMessage.value = data?.message || `Tidak dapat terhubung ke server (${detail}).`;
    }
  } finally {
    loading.value = false;
  }

  if (refocusPassword) {
    await nextTick();
    passwordInput.value?.focus();
    passwordInput.value?.select();
  }
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-neutral-100 px-4 py-10">
    <section class="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
      <div class="mb-8 text-center">
        <img :src="logo" alt="Logo TEFA" class="mx-auto mb-4 size-14 object-contain" />
        <h1 class="text-2xl font-extrabold text-neutral-900">Selamat Datang</h1>
        <p class="mt-2 text-sm text-neutral-500">Masuk ke akun TEFA SMKN 1 Purwosari untuk melanjutkan.</p>
      </div>

      <form class="space-y-5" novalidate @submit.prevent="handleLogin">
        <div v-if="route.query.registered && !errorMessage" role="status"
          class="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Akun berhasil dibuat. Silakan masuk.
        </div>
        <div v-if="errorMessage" role="alert"
          class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMessage }}</div>

        <div>
          <label for="email" class="mb-2 block text-sm font-medium text-neutral-700">Email</label>
          <input id="email" v-model.trim="form.email" type="email" autocomplete="email" placeholder="nama@email.com"
            required :disabled="loading" :aria-invalid="!!fieldErrors.email"
            class="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-primary-700 focus:ring-2 focus:ring-primary-100 disabled:bg-neutral-100" />
          <p v-if="fieldErrors.email" class="mt-1 text-sm text-red-600">{{ fieldErrors.email[0] }}</p>
        </div>

        <div>
          <label for="password" class="mb-2 block text-sm font-medium text-neutral-700">Password</label>
          <div class="relative">
            <input id="password" ref="passwordInput" v-model="form.password" :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password" placeholder="Masukkan password" required :disabled="loading"
              :aria-invalid="!!fieldErrors.password"
              class="w-full rounded-xl border border-neutral-300 py-3 pl-4 pr-11 text-sm outline-none transition focus:border-primary-700 focus:ring-2 focus:ring-primary-100 disabled:bg-neutral-100" />
            <button type="button"
              class="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-neutral-700"
              :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
              @click="showPassword = !showPassword">
              <EyeOff v-if="showPassword" class="size-5" />
              <Eye v-else class="size-5" />
            </button>
          </div>
          <p v-if="fieldErrors.password" class="mt-1 text-sm text-red-600">{{ fieldErrors.password[0] }}</p>
        </div>

        <label class="flex items-center gap-2 text-sm text-neutral-600">
          <input v-model="form.remember" type="checkbox" :disabled="loading"
            class="size-4 rounded border-neutral-300 accent-primary-700" />
          Ingat saya
        </label>

        <button type="submit" :disabled="loading"
          class="flex w-full items-center justify-center rounded-xl bg-primary-800 px-4 py-3 font-semibold text-white transition hover:bg-primary-900 disabled:cursor-not-allowed disabled:opacity-60">
          {{ loading ? "Sedang masuk..." : "Masuk" }}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-neutral-600">
        Belum punya akun?
        <RouterLink :to="registerLink" class="font-semibold text-primary-700 hover:text-primary-800">Daftar sekarang
        </RouterLink>
      </p>
      <p class="mt-4 text-center text-sm">
        <RouterLink to="/products" class="text-neutral-500 hover:text-primary-700">Kembali ke katalog</RouterLink>
      </p>
    </section>
  </main>
</template>