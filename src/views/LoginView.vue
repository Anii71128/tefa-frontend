<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { login } from "../services/auth";

const router = useRouter();

const form = ref({
  email: "",
  password: "",
  remember: false,
});

const loading = ref(false);
const errorMessage = ref("");
const fieldErrors = ref({});

async function handleLogin() {
  errorMessage.value = "";
  fieldErrors.value = {};

  if (!form.value.email || !form.value.password) {
    errorMessage.value = "Email dan password wajib diisi.";
    return;
  }

  loading.value = true;

  try {
    const result = await login(form.value);

    // Pengguna dengan role user masuk ke katalog Vue.
    if (result.user?.role === "user") {
      await router.push("/products");
      return;
    }

    // Role internal diarahkan ke halaman backend Laravel.
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const allowedPaths = {
      admin: "/admin",
      guru: "/guru",
      siswa: "/siswa",
    };

    const destination = allowedPaths[result.user?.role];

    if (destination) {
      window.location.href = `${backendUrl}${destination}`;
      return;
    }

    errorMessage.value =
      "Login berhasil, tetapi role akun belum memiliki tujuan halaman.";
  } catch (error) {
    if (error.response?.status === 422) {
      const errors = error.response.data.errors;

      if (errors) {
        fieldErrors.value = errors;
        errorMessage.value =
          errors.email?.[0] ||
          errors.password?.[0] ||
          "Periksa kembali data login.";
      } else {
        errorMessage.value =
          error.response.data.message || "Email atau password salah.";
      }
    } else if (error.response?.status === 419) {
      errorMessage.value =
        "Sesi keamanan kedaluwarsa. Silakan coba login kembali.";
    } else {
      errorMessage.value =
        error.response?.data?.message ||
        "Tidak dapat terhubung ke server. Pastikan Laravel berjalan.";
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main
    class="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10"
  >
    <section
      class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div class="mb-8 text-center">
        <div
          class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-2xl font-bold text-emerald-700"
        >
          T
        </div>

        <h1 class="text-2xl font-bold text-slate-900">Selamat Datang</h1>

        <p class="mt-2 text-sm text-slate-500">
          Masuk ke akun TEFA untuk melanjutkan.
        </p>
      </div>

      <form class="space-y-5" @submit.prevent="handleLogin">
        <div
          v-if="errorMessage"
          role="alert"
          class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {{ errorMessage }}
        </div>

        <div>
          <label
            for="email"
            class="mb-2 block text-sm font-medium text-slate-700"
          >
            Email
          </label>

          <input
            id="email"
            v-model.trim="form.email"
            type="email"
            autocomplete="email"
            placeholder="nama@email.com"
            required
            :disabled="loading"
            class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
          />

          <p v-if="fieldErrors.email" class="mt-1 text-sm text-red-600">
            {{ fieldErrors.email[0] }}
          </p>
        </div>

        <div>
          <label
            for="password"
            class="mb-2 block text-sm font-medium text-slate-700"
          >
            Password
          </label>

          <input
            id="password"
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            placeholder="Masukkan password"
            required
            :disabled="loading"
            class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
          />

          <p v-if="fieldErrors.password" class="mt-1 text-sm text-red-600">
            {{ fieldErrors.password[0] }}
          </p>
        </div>

        <label class="flex items-center gap-2 text-sm text-slate-600">
          <input
            v-model="form.remember"
            type="checkbox"
            :disabled="loading"
            class="h-4 w-4 rounded border-slate-300 accent-emerald-600"
          />
          Ingat saya
        </label>

        <button
          type="submit"
          :disabled="loading"
          class="flex w-full items-center justify-center rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ loading ? "Sedang masuk..." : "Masuk" }}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-slate-600">
        Belum punya akun?
        <RouterLink
          to="/register"
          class="font-semibold text-emerald-700 hover:text-emerald-800"
        >
          Daftar sekarang
        </RouterLink>
      </p>

      <p class="mt-4 text-center text-sm">
        <RouterLink
          to="/products"
          class="text-slate-500 hover:text-emerald-700"
        >
          Kembali ke katalog
        </RouterLink>
      </p>
    </section>
  </main>
</template>
