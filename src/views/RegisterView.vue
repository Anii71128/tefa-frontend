<script setup>
import { ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { Eye, EyeOff } from "lucide-vue-next";
import { useAuthStore } from "../stores/auth";
import logo from "../assets/logo-tefa.png";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const form = ref({ name: "", email: "", password: "", password_confirmation: "" });
const loading = ref(false);
const showPassword = ref(false);
const errorMessage = ref("");
const fieldErrors = ref({});

function getSafeRedirect() {
    const target = route.query.redirect;
    if (typeof target !== "string") return null;
    const isInternal = target.startsWith("/") && !target.startsWith("//");
    const isAuthPage = /^\/(login|register)(\/|\?|$)/.test(target);
    return isInternal && !isAuthPage ? target : null;
}

function validateLocally() {
    const errors = {};
    const name = form.value.name.trim();

    if (name.length < 3) errors.name = ["Nama minimal 3 karakter."];
    else if (name.length > 50) errors.name = ["Nama maksimal 50 karakter."];

    if (form.value.password.length < 8) errors.password = ["Password minimal 8 karakter."];
    if (form.value.password !== form.value.password_confirmation) {
        errors.password_confirmation = ["Konfirmasi password tidak sama."];
    }

    fieldErrors.value = errors;
    return Object.keys(errors).length === 0;
}

function translateError(message = "") {
    if (/already been taken/i.test(message)) return "Email ini sudah terdaftar. Gunakan email lain atau masuk.";
    if (/valid email/i.test(message)) return "Format email tidak valid.";
    if (/confirmation does not match/i.test(message)) return "Konfirmasi password tidak sama.";
    if (/at least 8/i.test(message)) return "Password minimal 8 karakter.";
    return message;
}

async function handleRegister() {
    errorMessage.value = "";
    if (!validateLocally()) return;

    loading.value = true;
    try {
        const email = form.value.email.trim().toLowerCase();
        await auth.register({
            ...form.value,
            name: form.value.name.trim(),
            email,
        });

        try {
            sessionStorage.setItem("tefa_registered_email", email);
        } catch {

        }

        await router.push({ name: "login", query: { ...route.query, registered: "1" } });
    } catch (error) {
        const status = error.response?.status;
        const data = error.response?.data;

        if (status === 422) {
            if (data?.errors) {
                fieldErrors.value = Object.fromEntries(
                    Object.entries(data.errors).map(([key, messages]) => [key, messages.map(translateError)]),
                );
            } else {
                errorMessage.value = data?.message || "Periksa kembali data pendaftaran.";
            }
        } else if (status === 419) {
            errorMessage.value = "Sesi keamanan kedaluwarsa. Muat ulang halaman lalu coba lagi.";
        } else if (status === 429) {
            errorMessage.value = "Terlalu banyak percobaan. Coba lagi beberapa saat lagi.";
        } else {
            console.error("Register gagal:", error);
            const detail = error.response
                ? `kode ${status}`
                : "tidak ada respons, cek CORS atau apakah /register di Laravel membalas JSON";
            errorMessage.value = data?.message || `Pendaftaran gagal (${detail}).`;
        }
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <main class="flex min-h-screen items-center justify-center bg-neutral-100 px-4 py-10">
        <section class="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
            <div class="mb-8 text-center">
                <img :src="logo" alt="Logo TEFA" class="mx-auto mb-4 size-14 object-contain" />
                <h1 class="text-2xl font-extrabold text-neutral-900">Buat Akun TEFA</h1>
                <p class="mt-2 text-sm text-neutral-500">Daftar untuk mulai memesan produk Teaching Factory.</p>
            </div>

            <form class="space-y-5" novalidate @submit.prevent="handleRegister">
                <div v-if="errorMessage" role="alert"
                    class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMessage }}
                </div>

                <div>
                    <label for="name" class="mb-2 block text-sm font-medium text-neutral-700">Nama lengkap</label>
                    <input id="name" v-model="form.name" type="text" autocomplete="name" maxlength="50"
                        placeholder="Masukkan nama lengkap" required :disabled="loading"
                        :aria-invalid="!!fieldErrors.name"
                        class="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-primary-700 focus:ring-2 focus:ring-primary-100 disabled:bg-neutral-100" />
                    <p v-if="fieldErrors.name" class="mt-1 text-sm text-red-600">{{ fieldErrors.name[0] }}</p>
                </div>

                <div>
                    <label for="email" class="mb-2 block text-sm font-medium text-neutral-700">Email</label>
                    <input id="email" v-model.trim="form.email" type="email" autocomplete="email"
                        placeholder="nama@email.com" required :disabled="loading" :aria-invalid="!!fieldErrors.email"
                        class="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-primary-700 focus:ring-2 focus:ring-primary-100 disabled:bg-neutral-100" />
                    <p v-if="fieldErrors.email" class="mt-1 text-sm text-red-600">{{ fieldErrors.email[0] }}</p>
                </div>

                <div>
                    <label for="password" class="mb-2 block text-sm font-medium text-neutral-700">Password</label>
                    <div class="relative">
                        <input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'"
                            autocomplete="new-password" placeholder="Minimal 8 karakter" required :disabled="loading"
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

                <div>
                    <label for="password_confirmation"
                        class="mb-2 block text-sm font-medium text-neutral-700">Konfirmasi
                        password</label>
                    <input id="password_confirmation" v-model="form.password_confirmation"
                        :type="showPassword ? 'text' : 'password'" autocomplete="new-password"
                        placeholder="Ulangi password" required :disabled="loading"
                        :aria-invalid="!!fieldErrors.password_confirmation"
                        class="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-primary-700 focus:ring-2 focus:ring-primary-100 disabled:bg-neutral-100" />
                    <p v-if="fieldErrors.password_confirmation" class="mt-1 text-sm text-red-600">
                        {{ fieldErrors.password_confirmation[0] }}
                    </p>
                </div>

                <button type="submit" :disabled="loading"
                    class="flex w-full items-center justify-center rounded-xl bg-primary-800 px-4 py-3 font-semibold text-white transition hover:bg-primary-900 disabled:cursor-not-allowed disabled:opacity-60">
                    {{ loading ? "Memproses..." : "Daftar Sekarang" }}
                </button>
            </form>

            <p class="mt-6 text-center text-sm text-neutral-600">
                Sudah punya akun?
                <RouterLink :to="{ name: 'login', query: route.query }"
                    class="font-semibold text-primary-700 hover:text-primary-800">Masuk di sini</RouterLink>
            </p>
            <p class="mt-4 text-center text-sm">
                <RouterLink to="/products" class="text-neutral-500 hover:text-primary-700">Kembali ke katalog
                </RouterLink>
            </p>
        </section>
    </main>
</template>