<script setup>
import MainLayout from "../components/layouts/MainLayout.vue";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ChevronDown, ChevronLeft, ChevronRight, ClipboardList, Lock, Search } from "lucide-vue-next";
import CatalogProductCard from "../components/product/CatalogProductCard.vue";
import { getProducts } from "../services/products";
import { useAuthStore } from "../stores/auth";
import { useCartStore } from "../stores/cart";
import { useLoginPrompt } from "../composables/useLoginPrompt";

const PAGE_SIZE = 12;

const CATEGORY_NAMES = {
  ATPH: "ATPH - Agribisnis Tanaman Pangan dan Hortikultura",
  APHP: "APHP - Agribisnis Pengolahan Hasil Pertanian",
  TBKR: "TBKR - Teknik Bodi Kendaraan Ringan",
  TKR: "TKR - Teknik Kendaraan Ringan",
  DKV: "DKV - Desain Komunikasi Visual",
};
const categoryLabel = (name) => CATEGORY_NAMES[String(name ?? "").trim().toUpperCase()] ?? name;
const categoryName = (p) => p.category?.name ?? "Lainnya";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const cart = useCartStore();
const { requireLogin } = useLoginPrompt();

const products = ref([]);
const loading = ref(true);
const failed = ref(false);

const search = ref(typeof route.query.q === "string" ? route.query.q : "");
const category = ref("all");
const sort = ref("newest");
const page = computed(() => {
  const n = Number.parseInt(route.query.page, 10);
  return Number.isInteger(n) && n > 0 ? n : 1;
});

function setPage(n, { replace = false } = {}) {
  const query = { ...route.query, page: n > 1 ? String(n) : undefined };
  return replace ? router.replace({ query }) : router.push({ query });
}
const addedIds = ref([]);

watch(
  () => route.query.q,
  (q) => {
    search.value = typeof q === "string" ? q : "";
  },
);

const canOrder = computed(() => !auth.isLoggedIn || auth.user?.role === "user");

async function load() {
  loading.value = true;
  failed.value = false;
  try {
    products.value = await getProducts();
  } catch {
    failed.value = true;
  } finally {
    loading.value = false;
  }
}
onMounted(load);

const categories = computed(() => {
  const counts = new Map();
  for (const p of products.value) {
    const name = categoryName(p);
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts.entries()].map(([name, count]) => ({ name, count }));
});

const byNewest = (a, b) => new Date(b.created_at) - new Date(a.created_at) || b.id - a.id;
const sorters = {
  newest: byNewest,
  "price-asc": (a, b) => Number(a.price) - Number(b.price),
  "price-desc": (a, b) => Number(b.price) - Number(a.price),
  name: (a, b) => String(a.name).localeCompare(String(b.name), "id"),
};

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  const list = products.value.filter((p) => {
    if (category.value !== "all" && categoryName(p) !== category.value) return false;
    if (!q) return true;
    return [p.name, p.description, categoryName(p)].some((text) =>
      String(text ?? "").toLowerCase().includes(q),
    );
  });
  return [...list].sort(sorters[sort.value] ?? byNewest);
});

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)));
const pageItems = computed(() => filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE));
const rangeStart = computed(() => (filtered.value.length ? (page.value - 1) * PAGE_SIZE + 1 : 0));
const rangeEnd = computed(() => Math.min(page.value * PAGE_SIZE, filtered.value.length));

watch([search, category, sort], () => {
  if (page.value !== 1) setPage(1, { replace: true });
});
watch(totalPages, (n) => {
  if (!loading.value && page.value > n) setPage(n, { replace: true });
});

const pageNumbers = computed(() => {
  const total = totalPages.value;
  const current = page.value;
  const wanted = new Set([1, total, current - 1, current, current + 1]);
  const numbers = [...wanted].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const result = [];
  numbers.forEach((n, i) => {
    const gap = i > 0 ? n - numbers[i - 1] : 1;
    if (gap === 2) result.push(n - 1); // hanya satu halaman terlewat: tampilkan angkanya
    else if (gap > 2) result.push("...");
    result.push(n);
  });
  return result;
});

function goToPage(n) {
  if (n < 1 || n > totalPages.value) return;
  setPage(n);
}

function resetFilters() {
  search.value = "";
  category.value = "all";
  sort.value = "newest";
  if (route.query.q) router.replace({ name: "products" });
}

function addToDraft(product) {
  requireLogin("Untuk menambahkan produk ke draft pesanan, masuk ke akun Anda.", () => {
    if (!cart.add(product)) return;
    addedIds.value = [...addedIds.value, product.id];
    setTimeout(() => {
      addedIds.value = addedIds.value.filter((id) => id !== product.id);
    }, 1500);
  });
}

function openDraft() {
  requireLogin("Untuk melihat draft pesanan Anda, masuk ke akun terlebih dahulu.", () =>
    router.push({ name: "cart" }),
  );
}

const gridClass = "grid-cols-1 @xl:grid-cols-2 @4xl:grid-cols-3 @6xl:grid-cols-4";
const selectClass =
  "h-11 w-full appearance-none rounded-xl border border-neutral-200 bg-white pl-3.5 pr-9 text-sm text-neutral-800 outline-none transition focus:border-primary-700 focus:ring-2 focus:ring-primary-100";
</script>

<template>
  <MainLayout>
    <section class="space-y-6">
      <div class="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <p class="text-[11px] font-bold uppercase tracking-wide text-primary-600">Katalog</p>
        <h1 class="mt-2 text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl">
          Katalog Produk &amp; Layanan Vokasi
        </h1>
        <p class="mt-2 text-sm text-neutral-500">
          Pesan hasil karya riil siswa SMK dengan spesifikasi sesuai standar industri.
        </p>

        <div class="mt-5 flex flex-col gap-4 lg:flex-row">
          <label class="relative block flex-1">
            <span class="sr-only">Cari produk atau jasa</span>
            <Search class="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
            <input v-model="search" type="search" placeholder="Cari produk atau jasa..."
              class="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-primary-700 focus:ring-2 focus:ring-primary-100" />
          </label>

          <div class="relative lg:w-48">
            <select v-model="sort" aria-label="Urutkan" :class="selectClass">
              <option value="newest">Urutkan: Terbaru</option>
              <option value="price-asc">Harga terendah</option>
              <option value="price-desc">Harga tertinggi</option>
              <option value="name">Nama A-Z</option>
            </select>
            <ChevronDown
              class="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          </div>

          <button v-if="canOrder" type="button"
            class="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-50"
            @click="openDraft">
            <ClipboardList v-if="auth.isLoggedIn" class="size-4 text-primary-700" />
            <Lock v-else class="size-4 text-neutral-500" />
            Draft Pesanan
            <span v-if="auth.isLoggedIn && cart.items.length"
              class="flex size-5 items-center justify-center rounded-full bg-primary-700 text-[11px] font-bold text-white">
              {{ cart.items.length }}
            </span>
          </button>
        </div>

        <div v-if="categories.length" class="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter kategori">
          <button type="button" class="rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors"
            :class="category === 'all'
              ? 'border-primary-700 bg-primary-700 text-white'
              : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'" @click="category = 'all'">
            Semua
          </button>
          <button v-for="c in categories" :key="c.name" type="button" :title="categoryLabel(c.name)"
            class="rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors" :class="category === c.name
              ? 'border-primary-700 bg-primary-700 text-white'
              : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'" @click="category = c.name">
            {{ c.name }}
          </button>
        </div>
      </div>

      <div class="@container">
        <div v-if="loading" :class="gridClass" class="grid gap-4">
          <div v-for="n in 8" :key="n" class="h-80 animate-pulse rounded-3xl border border-neutral-200 bg-white"></div>
        </div>

        <div v-else-if="failed" class="rounded-3xl border border-neutral-200 bg-white p-8 text-center">
          <p class="text-sm text-neutral-600">Produk belum dapat dimuat. Silakan coba beberapa saat lagi.</p>
          <button type="button"
            class="mt-4 rounded-xl border border-neutral-300 px-5 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
            @click="load">
            Muat Ulang
          </button>
        </div>

        <div v-else-if="!filtered.length" class="rounded-3xl border border-neutral-200 bg-white p-8 text-center">
          <p class="text-sm font-semibold text-neutral-800">Produk tidak ditemukan</p>
          <p class="mt-1 text-sm text-neutral-500">Coba kata kunci atau kategori lain.</p>
          <button type="button"
            class="mt-4 rounded-xl border border-neutral-300 px-5 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
            @click="resetFilters">
            Atur Ulang Filter
          </button>
        </div>

        <template v-else>
          <div :class="gridClass" class="grid gap-4">
            <CatalogProductCard v-for="p in pageItems" :key="p.id" :product="p" :can-order="canOrder"
              :added="addedIds.includes(p.id)" @add="addToDraft" />
          </div>

          <div class="mt-10 flex flex-col items-center gap-3 border-t border-neutral-200 pt-6">
            <nav v-if="totalPages > 1" aria-label="Halaman katalog" class="flex items-center gap-1">
              <button type="button" :disabled="page === 1" aria-label="Halaman sebelumnya"
                class="flex size-10 items-center justify-center rounded-md text-neutral-500 outline-none transition-colors hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-neutral-500"
                @click="goToPage(page - 1)">
                <ChevronLeft class="size-5" />
              </button>

              <!-- Layar sedang dan besar: nomor halaman -->
              <div class="hidden items-center gap-1 sm:flex">
                <template v-for="(n, i) in pageNumbers" :key="`${n}-${i}`">
                  <span v-if="n === '...'"
                    class="flex size-10 items-center justify-center text-sm text-neutral-400">…</span>
                  <button v-else type="button" :aria-current="n === page ? 'page' : undefined"
                    :aria-label="`Halaman ${n}`"
                    class="relative flex h-10 min-w-10 items-center justify-center rounded-md px-1 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary-200"
                    :class="n === page ? 'text-primary-800' : 'text-neutral-500 hover:text-neutral-900'"
                    @click="goToPage(n)">
                    {{ n }}
                    <span v-if="n === page"
                      class="absolute inset-x-1.5 -bottom-0.5 h-0.5 rounded-full bg-primary-700"></span>
                  </button>
                </template>
              </div>

              <!-- HP: ringkas jadi "Halaman 1 dari 3" -->
              <span class="px-3 text-sm font-semibold text-neutral-700 sm:hidden">
                Halaman {{ page }} dari {{ totalPages }}
              </span>

              <button type="button" :disabled="page === totalPages" aria-label="Halaman berikutnya"
                class="flex size-10 items-center justify-center rounded-md text-neutral-500 outline-none transition-colors hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-neutral-500"
                @click="goToPage(page + 1)">
                <ChevronRight class="size-5" />
              </button>
            </nav>

          </div>
        </template>
      </div>
    </section>
  </MainLayout>
</template>