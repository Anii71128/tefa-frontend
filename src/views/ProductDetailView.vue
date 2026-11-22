<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { ArrowLeft, Package, Minus, Plus } from "lucide-vue-next";
import MainLayout from "../components/layouts/MainLayout.vue";
import api from "../services/api";
import { useAuthStore } from "../stores/auth";
import { useLoginPrompt } from "../composables/useLoginPrompt";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const { show } = useLoginPrompt();

const STORAGE_URL = `${import.meta.env.VITE_BACKEND_URL ?? ""}/storage`;
const MAX_PER_ORDER = 100;

const product = ref(null);
const quantity = ref(1);
const isLoading = ref(true);
const errorMessage = ref("");
const imageFailed = ref(false);

const stock = computed(() => Number(product.value?.stock) || 0);
const maxQty = computed(() => Math.min(stock.value, MAX_PER_ORDER));
const inStock = computed(() => stock.value > 0);
const subtotal = computed(() => (Number(product.value?.price) || 0) * quantity.value);

const imageUrl = computed(() => {
  const img = product.value?.image;
  if (!img || imageFailed.value) return null;
  return /^https?:\/\//.test(img) ? img : `${STORAGE_URL}/${img}`;
});

const formatPrice = (price) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);

async function fetchProduct() {
  isLoading.value = true;
  errorMessage.value = "";
  product.value = null;
  quantity.value = 1;
  imageFailed.value = false;

  try {
    const response = await api.get(`/products/${route.params.id}`);
    product.value = response.data?.data ?? response.data;
  } catch (error) {
    console.error("Gagal mengambil detail produk:", error);
    errorMessage.value =
      error.response?.status === 404
        ? "Produk tidak ditemukan atau sudah tidak tersedia."
        : "Detail produk belum dapat dimuat. Silakan coba lagi.";
  } finally {
    isLoading.value = false;
  }
}

function clampQuantity() {
  const n = Math.floor(Number(quantity.value)) || 1;
  quantity.value = Math.min(Math.max(n, 1), maxQty.value || 1);
}

function changeQuantity(step) {
  quantity.value = Number(quantity.value) + step;
  clampQuantity();
}

function onOrder() {
  if (!inStock.value) return;

  if (!auth.isLoggedIn) {
    return show("Untuk memesan produk, silakan masuk ke akun Anda terlebih dahulu.");
  }

  clampQuantity();
  router.push({
    name: "checkout",
    query: { product_id: product.value.id, quantity: quantity.value },
  });
}

onMounted(fetchProduct);
watch(() => route.params.id, fetchProduct);
</script>

<template>
  <MainLayout>
    <div class="space-y-5">
      <RouterLink to="/products"
        class="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 transition-colors hover:text-primary-800">
        <ArrowLeft class="size-4" />
        Kembali ke katalog
      </RouterLink>

      <div v-if="isLoading" class="grid gap-5 @container lg:grid-cols-[1.4fr_1fr]">
        <div class="h-96 animate-pulse rounded-3xl border border-neutral-200 bg-white"></div>
        <div class="h-96 animate-pulse rounded-3xl border border-neutral-200 bg-white"></div>
      </div>

      <div v-else-if="errorMessage" role="alert"
        class="rounded-3xl border border-neutral-200 bg-white p-10 text-center">
        <p class="text-sm text-neutral-600">{{ errorMessage }}</p>
        <button
          class="mt-4 rounded-xl border border-neutral-300 px-5 py-2 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-50"
          @click="fetchProduct">
          Muat ulang
        </button>
      </div>

      <section v-else-if="product" class="grid items-start gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div class="space-y-5">
          <div class="overflow-hidden rounded-3xl border border-neutral-200 bg-white">
            <div class="flex aspect-[4/3] items-center justify-center bg-primary-50">
              <img v-if="imageUrl" :src="imageUrl" :alt="product.name" class="size-full object-cover"
                @error="imageFailed = true" />
              <Package v-else class="size-16 text-primary-300" aria-hidden="true" />
            </div>
          </div>

          <div class="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
            <h2 class="text-lg font-extrabold tracking-tight text-neutral-900">Deskripsi produk</h2>
            <p class="mt-3 whitespace-pre-line text-sm leading-relaxed text-neutral-600">
              {{ product.description || "Belum ada deskripsi untuk produk ini." }}
            </p>
          </div>
        </div>

        <aside class="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 lg:sticky lg:top-6">
          <span
            class="inline-flex rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
            {{ product.category?.name || "Tanpa kategori" }}
          </span>

          <h1 class="mt-4 text-2xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-3xl">
            {{ product.name }}
          </h1>

          <p class="mt-4 text-2xl font-extrabold text-primary-700">{{ formatPrice(product.price) }}</p>

          <div class="mt-6 flex items-center justify-between border-t border-neutral-100 pt-6">
            <span class="text-sm text-neutral-600">Ketersediaan</span>
            <span class="rounded-full px-3 py-1 text-xs font-semibold"
              :class="inStock ? 'bg-primary-50 text-primary-700' : 'bg-red-50 text-red-600'">
              {{ inStock ? `${stock} unit tersedia` : "Stok habis" }}
            </span>
          </div>

          <div class="mt-6">
            <label for="qty" class="mb-2 block text-sm font-semibold text-neutral-800">Jumlah</label>
            <div class="flex items-center gap-2">
              <button type="button" aria-label="Kurangi jumlah" :disabled="!inStock || quantity <= 1"
                class="flex size-11 items-center justify-center rounded-xl border border-neutral-300 text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
                @click="changeQuantity(-1)">
                <Minus class="size-4" />
              </button>

              <input id="qty" v-model.number="quantity" type="number" min="1" :max="maxQty" :disabled="!inStock"
                class="h-11 min-w-0 flex-1 rounded-xl border border-neutral-300 text-center text-sm font-semibold outline-none transition focus:border-primary-700 focus:ring-2 focus:ring-primary-100 disabled:bg-neutral-100"
                @change="clampQuantity" />

              <button type="button" aria-label="Tambah jumlah" :disabled="!inStock || quantity >= maxQty"
                class="flex size-11 items-center justify-center rounded-xl border border-neutral-300 text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
                @click="changeQuantity(1)">
                <Plus class="size-4" />
              </button>
            </div>
          </div>

          <div class="mt-6 rounded-2xl bg-neutral-50 p-4">
            <div class="flex items-center justify-between text-sm text-neutral-500">
              <span>Harga satuan</span>
              <span>{{ formatPrice(product.price) }}</span>
            </div>
            <div class="mt-3 flex items-center justify-between">
              <span class="text-sm font-semibold text-neutral-800">Subtotal</span>
              <span class="text-lg font-extrabold text-primary-700">{{ formatPrice(subtotal) }}</span>
            </div>
          </div>

          <button type="button" :disabled="!inStock"
            class="mt-6 w-full rounded-xl bg-primary-700 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
            @click="onOrder">
            {{ inStock ? "Pesan sekarang" : "Stok habis" }}
          </button>

          <p v-if="!auth.isLoggedIn && inStock" class="mt-3 text-center text-xs text-neutral-500">
            Masuk ke akun Anda untuk melanjutkan pemesanan.
          </p>
          <p v-else class="mt-3 text-center text-xs text-neutral-500">
            Pesanan diproses sesuai alur persetujuan dan pembayaran TEFA.
          </p>
        </aside>
      </section>
    </div>
  </MainLayout>
</template>