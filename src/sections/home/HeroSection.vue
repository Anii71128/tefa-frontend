<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Search, Check, ArrowDown, Sprout } from "lucide-vue-next";
import { useAuthStore } from "../../stores/auth";
import { useLoginPrompt } from "../../composables/useLoginPrompt";
import heroImg from "../../assets/hero-workshop.jpeg";

const router = useRouter();
const auth = useAuthStore();
const { show } = useLoginPrompt();

const keyword = ref("");

const highlights = [
  "Standar Mutu Industri",
  "Dibimbing Guru Produktif",
  "Garansi Kepuasan Pelanggan",
];

function onOrder() {
  if (!auth.isLoggedIn) {
    return show("Untuk memesan produk, silakan masuk ke akun Anda terlebih dahulu.");
  }
  router.push("/products");
}

function onSearch() {
  const q = keyword.value.trim();
  if (!q) return;
  router.push({ name: "products", query: { q } });
}
</script>

<template>
  <section class="@container rounded-3xl border border-neutral-200 bg-white p-5 sm:p-8 @4xl:p-10">
    <div class="grid items-center gap-8 @3xl:grid-cols-[1.35fr_1fr] @3xl:gap-10">
      <div>
        <span
          class="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 py-1.5 pl-2.5 pr-4 text-xs font-semibold text-primary-700">
          <Sprout class="size-4" />
          Teaching Factory SMKN 1 Purwosari
        </span>

        <h1
          class="mt-5 text-3xl font-extrabold leading-[1.1] tracking-tight text-neutral-900 @2xl:text-4xl @5xl:text-[44px]">
          Produk Siswa Berkualitas Industri
        </h1>

        <p class="mt-5 max-w-lg text-base leading-relaxed text-neutral-600">
          Setiap produk dikerjakan langsung oleh siswa melalui Teaching Factory, di bawah
          bimbingan guru produktif dan mengikuti standar kerja dunia usaha dan dunia industri.
        </p>

        <div class="mt-6 flex flex-col gap-3 min-[420px]:flex-row">
          <button
            class="rounded-xl bg-primary-700 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-800"
            @click="onOrder">
            Pesan Sekarang
          </button>
          <RouterLink to="/products"
            class="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-neutral-800 transition-colors duration-200 hover:bg-neutral-50">
            Lihat Produk
            <ArrowDown class="size-4" />
          </RouterLink>
        </div>

        <div
          class="mt-8 flex max-w-lg items-center gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-2 pl-4 transition-colors focus-within:border-primary-400 focus-within:bg-white">
          <Search class="size-4 shrink-0 text-neutral-400" />
          <input v-model="keyword" type="text" placeholder="Cari bibit, roti, tanaman hias..."
            class="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400" @keyup.enter="onSearch" />
          <button
            class="shrink-0 rounded-xl border border-neutral-200 bg-white px-5 py-2 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-50"
            @click="onSearch">
            Cari
          </button>
        </div>

        <ul class="mt-6 flex flex-wrap gap-x-6 gap-y-2">
          <li v-for="item in highlights" :key="item" class="flex items-center gap-2 text-sm text-neutral-700">
            <Check class="size-4 text-primary-600" />
            {{ item }}
          </li>
        </ul>
      </div>

      <div class="relative overflow-hidden rounded-3xl shadow-xl">
        <img :src="heroImg" alt="Siswa SMKN 1 Purwosari bekerja di workshop"
          class="aspect-[4/3] w-full object-cover object-center" />

        <span
          class="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-neutral-900 shadow">
          <span class="size-2 rounded-full bg-success-600"></span>
          Workshop Produksi Siswa
        </span>

        <div class="absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-2xl bg-white/95 p-3 shadow-lg">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
            <Check class="size-5" />
          </div>
          <div class="leading-tight">
            <p class="text-sm font-bold text-neutral-900">Dikerjakan oleh Siswa</p>
            <p class="mt-0.5 text-xs text-neutral-500">Didampingi guru produktif di setiap tahap</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>