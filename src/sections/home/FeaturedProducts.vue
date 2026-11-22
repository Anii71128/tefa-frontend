<script setup>
import { ref, onMounted } from "vue";
import { ArrowRight } from "lucide-vue-next";
import ProductCard from "../../components/product/ProductCard.vue";
import { getProducts } from "../../services/products";

const products = ref([]);
const loading = ref(true);
const failed = ref(false);

const gridClass = "grid-cols-1 @xl:grid-cols-2 @4xl:grid-cols-3 @6xl:grid-cols-4";
const fourthCardClass = "hidden @6xl:flex";
const fourthSkeletonClass = "hidden @6xl:block";

async function load() {
  loading.value = true;
  failed.value = false;
  try {
    products.value = pickFeatured(await getProducts());
  } catch {
    failed.value = true;
  } finally {
    loading.value = false;
  }
}

function pickFeatured(list) {
  const pool = [
    ...list.filter((p) => Number(p.stock) > 0),
    ...list.filter((p) => !(Number(p.stock) > 0)),
  ];
  const picked = [];
  const seen = new Set();

  for (const p of pool) {
    const key = p.category?.name ?? "-";
    if (!seen.has(key)) {
      seen.add(key);
      picked.push(p);
    }
    if (picked.length === 4) return picked;
  }
  for (const p of pool) {
    if (picked.length === 4) break;
    if (!picked.includes(p)) picked.push(p);
  }
  return picked;
}

onMounted(load);
</script>

<template>
  <section id="produk">
    <div class="@container">
      <div class="text-center">
        <p class="text-[11px] font-bold uppercase tracking-wide text-primary-600">
          Katalog Unggulan
        </p>
        <h2 class="mt-2 text-2xl font-extrabold tracking-tight text-neutral-900 @2xl:text-3xl">
          Produk Unggulan Siswa
        </h2>
        <p class="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-neutral-500">
          Hasil karya siswa binaan Teaching Factory SMKN 1 Purwosari yang telah lolos pemeriksaan
          mutu dan siap dipesan.
        </p>
      </div>

      <div v-if="loading" :class="gridClass" class="mt-8 grid gap-4">
        <div v-for="n in 4" :key="n" :class="n === 4 ? fourthSkeletonClass : ''"
          class="h-72 animate-pulse rounded-3xl border border-neutral-200 bg-white"></div>
      </div>

      <div v-else-if="failed" class="mt-8 rounded-3xl border border-neutral-200 bg-white p-8 text-center">
        <p class="text-sm text-neutral-600">
          Produk belum dapat dimuat. Silakan coba beberapa saat lagi.
        </p>
        <button
          class="mt-4 rounded-xl border border-neutral-300 px-5 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
          @click="load">
          Muat Ulang
        </button>
      </div>

      <div v-else-if="!products.length" class="mt-8 rounded-3xl border border-neutral-200 bg-white p-8 text-center">
        <p class="text-sm text-neutral-600">
          Produk akan segera tersedia. Terima kasih atas kesabaran Anda.
        </p>
      </div>

      <div v-else :class="gridClass" class="mt-8 grid gap-4">
        <ProductCard v-for="(p, i) in products" :key="p.id" :product="p" :class="i === 3 ? fourthCardClass : ''" />
      </div>

      <div v-if="!loading && !failed && products.length" class="mt-8 text-center">
        <RouterLink to="/products"
          class="inline-flex items-center gap-2 rounded-xl border border-primary-600 bg-white px-5 py-2.5 text-sm font-semibold text-primary-700 transition-colors duration-200 hover:bg-primary-50">
          Lihat Semua Produk
          <ArrowRight class="size-4" />
        </RouterLink>
      </div>
    </div>
  </section>
</template>