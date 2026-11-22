<script setup>
import { useRouter } from "vue-router";
import { Rocket, MessageCircle } from "lucide-vue-next";
import { useAuthStore } from "../../stores/auth";
import { useLoginPrompt } from "../../composables/useLoginPrompt";

const router = useRouter();
const auth = useAuthStore();
const { show } = useLoginPrompt();

const waNumber = import.meta.env.VITE_WA_NUMBER;
const waText = encodeURIComponent("Halo, saya ingin memesan produk TEFA SMKN 1 Purwosari.");

function onOrder() {
    if (!auth.isLoggedIn) {
        return show("Untuk memesan produk, silakan masuk ke akun Anda terlebih dahulu.");
    }
    router.push("/products");
}
</script>

<template>
    <section class="@container rounded-3xl border border-primary-200 bg-primary-50 p-6 text-center sm:p-10">
        <span
            class="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-primary-700">
            <Rocket class="size-3.5" />
            Dukung Talenta Vokasi Indonesia
        </span>

        <h2
            class="mx-auto mt-5 max-w-2xl text-balance text-2xl font-extrabold leading-tight tracking-tight text-neutral-900 @2xl:text-4xl">
            Mulai Pesan Produk Hasil Karya Siswa Sekarang
        </h2>
        <p class="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-neutral-600">
            Bantu kembangkan potensi nyata siswa kejuruan dengan memercayakan kebutuhan Anda kepada
            Teaching Factory SMKN 1 Purwosari.
        </p>

        <div class="mt-6 flex flex-col justify-center gap-3 min-[420px]:flex-row">
            <button
                class="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-700 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-800"
                @click="onOrder">
                Pesan Sekarang
            </button>
            <a :href="`https://wa.me/${waNumber}?text=${waText}`" target="_blank" rel="noopener noreferrer"
                class="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-neutral-800 transition-colors duration-200 hover:bg-neutral-50">
                <MessageCircle class="size-4" />
                Konsultasi via WhatsApp
            </a>
        </div>

        <p class="mt-5 text-xs text-neutral-500">
            Respon cepat pada hari dan jam kerja sekolah (Senin - Jumat, 08.00 - 15.30 WIB).
        </p>
    </section>
</template>