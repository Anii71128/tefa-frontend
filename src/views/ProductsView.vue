<script setup>
import { ref, computed, onMounted } from "vue";
import { RouterLink } from "vue-router";
import api from "../services/api";

const products = ref([]);
const categories = ref([]);
const searchQuery = ref("");
const selectedCategory = ref("Semua");
const isLoading = ref(true);
const errorMessage = ref("");

const formatPrice = (price) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);
};

const fetchProducts = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const response = await api.get("/products");
    products.value = response.data;

    const categoryMap = new Map();

    response.data.forEach((product) => {
      if (product.category) {
        categoryMap.set(product.category.id, product.category);
      }
    });

    categories.value = [...categoryMap.values()];
  } catch (error) {
    console.error("Gagal mengambil produk:", error);
    errorMessage.value =
      "Produk belum dapat dimuat. Periksa koneksi ke server Laravel.";
  } finally {
    isLoading.value = false;
  }
};

const filteredProducts = computed(() => {
  return products.value.filter((product) => {
    const query = searchQuery.value.toLowerCase().trim();

    const matchesSearch =
      product.name.toLowerCase().includes(query) ||
      (product.description || "").toLowerCase().includes(query);

    const matchesCategory =
      selectedCategory.value === "Semua" ||
      product.category?.id === Number(selectedCategory.value);

    return matchesSearch && matchesCategory;
  });
});

onMounted(fetchProducts);
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-800">
    <header class="border-b border-slate-200 bg-white">
      <div
        class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4"
      >
        <RouterLink to="/" class="text-2xl font-black text-emerald-700">
          TEFA<span class="text-slate-800">.</span>
        </RouterLink>

        <nav class="flex items-center gap-4 text-sm font-medium">
          <RouterLink to="/" class="hover:text-emerald-700">
            Beranda
          </RouterLink>
          <RouterLink to="/products" class="text-emerald-700">
            Katalog
          </RouterLink>
          <RouterLink to="/login" class="hover:text-emerald-700">
            Masuk
          </RouterLink>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-5 py-10">
      <section class="mb-8 rounded-3xl bg-emerald-800 p-8 text-white md:p-12">
        <p
          class="mb-3 text-sm font-semibold uppercase tracking-widest text-emerald-200"
        >
          Teaching Factory
        </p>

        <h1 class="mb-4 text-3xl font-black md:text-5xl">
          Katalog Produk TEFA
        </h1>

        <p class="max-w-2xl leading-7 text-emerald-50">
          Temukan produk hasil karya dan pembelajaran siswa yang tersedia di
          Teaching Factory sekolah kami.
        </p>
      </section>

      <section class="mb-8 flex flex-col gap-4 md:flex-row">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Cari nama atau deskripsi produk..."
          class="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        />

        <select
          v-model="selectedCategory"
          class="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-600"
        >
          <option value="Semua">Semua kategori</option>
          <option
            v-for="category in categories"
            :key="category.id"
            :value="String(category.id)"
          >
            {{ category.name }}
          </option>
        </select>
      </section>

      <div v-if="isLoading" class="rounded-2xl bg-white px-6 py-16 text-center">
        <p class="font-semibold text-slate-700">Memuat produk...</p>
        <p class="mt-2 text-sm text-slate-500">
          Mengambil data dari server TEFA.
        </p>
      </div>

      <div
        v-else-if="errorMessage"
        class="rounded-2xl border border-red-200 bg-red-50 p-6 text-center"
      >
        <p class="font-semibold text-red-700">{{ errorMessage }}</p>
        <button
          @click="fetchProducts"
          class="mt-4 rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white hover:bg-red-700"
        >
          Coba lagi
        </button>
      </div>

      <template v-else>
        <div class="mb-5 flex items-center justify-between gap-3">
          <h2 class="text-xl font-bold">Produk tersedia</h2>
          <p class="text-sm text-slate-500">
            {{ filteredProducts.length }} produk
          </p>
        </div>

        <div
          v-if="filteredProducts.length"
          class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <article
            v-for="product in filteredProducts"
            :key="product.id"
            class="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div class="flex h-48 items-center justify-center bg-emerald-50">
              <img
                v-if="product.image"
                :src="`http://127.0.0.1:8000/storage/${product.image}`"
                :alt="product.name"
                class="h-full w-full object-cover"
                @error="(event) => (event.target.style.display = 'none')"
              />

              <span v-if="!product.image" class="text-5xl">📦</span>
            </div>

            <div class="p-5">
              <p
                class="mb-2 text-xs font-bold uppercase tracking-wide text-emerald-700"
              >
                {{ product.category?.name || "Tanpa kategori" }}
              </p>

              <h3 class="mb-2 text-xl font-bold">
                {{ product.name }}
              </h3>

              <p
                class="mb-4 line-clamp-2 min-h-10 text-sm leading-6 text-slate-500"
              >
                {{ product.description || "Belum ada deskripsi produk." }}
              </p>

              <div class="mb-4 flex items-end justify-between gap-3">
                <p class="font-extrabold text-emerald-700">
                  {{ formatPrice(product.price) }}
                </p>
                <p class="text-xs text-slate-500">Stok: {{ product.stock }}</p>
              </div>

              <RouterLink
                :to="`/products/${product.id}`"
                class="block rounded-xl bg-emerald-700 px-4 py-3 text-center font-semibold text-white transition hover:bg-emerald-800"
              >
                Lihat detail
              </RouterLink>
            </div>
          </article>
        </div>

        <div
          v-else
          class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"
        >
          <p class="text-lg font-bold">Produk tidak ditemukan</p>
          <p class="mt-2 text-sm text-slate-500">
            Coba kata kunci atau kategori yang berbeda.
          </p>
        </div>
      </template>
    </main>

    <footer
      class="mt-12 border-t border-slate-200 bg-white px-5 py-6 text-center text-sm text-slate-500"
    >
      © {{ new Date().getFullYear() }} TEFA Sekolah. Semua hak dilindungi.
    </footer>
  </div>
</template>
