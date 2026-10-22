<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import api from "../services/api";

const route = useRoute();
const router = useRouter();

const product = ref(null);
const quantity = ref(1);
const isLoading = ref(true);
const errorMessage = ref("");
const orderMessage = ref("");

const formatPrice = (price) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);
};

const subtotal = computed(() => {
  return (Number(product.value?.price) || 0) * quantity.value;
});

const fetchProduct = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  product.value = null;
  quantity.value = 1;

  try {
    const response = await api.get(`/products/${route.params.id}`);
    product.value = response.data;
  } catch (error) {
    console.error("Gagal mengambil detail produk:", error);

    errorMessage.value =
      error.response?.status === 404
        ? "Produk tidak ditemukan atau sudah tidak tersedia."
        : "Detail produk gagal dimuat. Periksa koneksi ke server Laravel.";
  } finally {
    isLoading.value = false;
  }
};

const increaseQuantity = () => {
  if (product.value && quantity.value < Math.min(product.value.stock, 100)) {
    quantity.value++;
  }
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const goToCheckout = () => {
  if (!product.value || product.value.stock < 1) return;

  orderMessage.value = "";

  // Data pesanan akan dihubungkan ke proses checkout berikutnya.
  router.push({
    path: "/checkout",
    query: {
      product_id: product.value.id,
      quantity: quantity.value,
    },
  });
};

onMounted(fetchProduct);

watch(() => route.params.id, fetchProduct);
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

    <main class="mx-auto max-w-7xl px-5 py-8 md:py-12">
      <RouterLink
        to="/products"
        class="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900"
      >
        <span aria-hidden="true">←</span>
        Kembali ke katalog
      </RouterLink>

      <div
        v-if="isLoading"
        class="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center"
      >
        <p class="font-semibold">Memuat detail produk...</p>
        <p class="mt-2 text-sm text-slate-500">
          Mengambil data dari server TEFA.
        </p>
      </div>

      <div
        v-else-if="errorMessage"
        class="rounded-2xl border border-red-200 bg-red-50 px-6 py-16 text-center"
      >
        <p class="font-semibold text-red-700">{{ errorMessage }}</p>

        <button
          @click="fetchProduct"
          class="mt-5 rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800"
        >
          Coba lagi
        </button>
      </div>

      <section
        v-else-if="product"
        class="flex flex-col gap-8 lg:flex-row lg:items-start"
      >
        <div class="min-w-0 flex-1">
          <div
            class="overflow-hidden rounded-3xl border border-slate-200 bg-white"
          >
            <div
              class="flex min-h-72 items-center justify-center bg-emerald-50 md:min-h-96"
            >
              <img
                v-if="product.image"
                :src="`http://127.0.0.1:8000/storage/${product.image}`"
                :alt="product.name"
                class="h-72 w-full object-contain md:h-96"
                @error="(event) => (event.target.style.display = 'none')"
              />

              <span v-if="!product.image" class="text-7xl">📦</span>
            </div>
          </div>

          <div
            class="mt-6 rounded-2xl border border-slate-200 bg-white p-6 md:p-8"
          >
            <p
              class="mb-3 text-sm font-bold uppercase tracking-wider text-emerald-700"
            >
              Tentang produk
            </p>

            <h2 class="mb-4 text-xl font-bold">Deskripsi</h2>

            <p class="whitespace-pre-line leading-7 text-slate-600">
              {{
                product.description || "Belum ada deskripsi untuk produk ini."
              }}
            </p>
          </div>
        </div>

        <aside
          class="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6 lg:w-[400px]"
        >
          <p class="mb-3 text-sm font-semibold text-emerald-700">
            {{ product.category?.name || "Tanpa kategori" }}
          </p>

          <h1 class="text-2xl font-black leading-tight md:text-3xl">
            {{ product.name }}
          </h1>

          <p class="mt-5 text-3xl font-black text-emerald-700">
            {{ formatPrice(product.price) }}
          </p>

          <div class="my-6 border-t border-slate-100"></div>

          <div class="flex items-center justify-between gap-3">
            <span class="text-sm font-medium text-slate-600">
              Stok tersedia
            </span>

            <span
              :class="
                product.stock > 0
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-red-50 text-red-700'
              "
              class="rounded-full px-3 py-1 text-sm font-bold"
            >
              {{ product.stock }} unit
            </span>
          </div>

          <div class="mt-6">
            <label class="mb-3 block text-sm font-semibold">
              Jumlah pembelian
            </label>

            <div class="flex items-center gap-3">
              <button
                type="button"
                @click="decreaseQuantity"
                :disabled="quantity <= 1"
                class="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-xl font-bold hover:bg-slate-50 disabled:opacity-40"
                aria-label="Kurangi jumlah"
              >
                −
              </button>

              <input
                v-model.number="quantity"
                type="number"
                min="1"
                :max="Math.min(product.stock, 100)"
                :disabled="product.stock < 1"
                class="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 text-center font-bold outline-none focus:border-emerald-600"
              />

              <button
                type="button"
                @click="increaseQuantity"
                :disabled="quantity >= Math.min(product.stock, 100)"
                class="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-xl font-bold hover:bg-slate-50 disabled:opacity-40"
                aria-label="Tambah jumlah"
              >
                +
              </button>
            </div>

            <p
              v-if="quantity < 1 || quantity > Math.min(product.stock, 100)"
              class="mt-2 text-sm text-red-600"
            >
              Jumlah harus sesuai stok yang tersedia.
            </p>
          </div>

          <div class="mt-6 rounded-2xl bg-slate-50 p-4">
            <div
              class="flex items-center justify-between gap-3 text-sm text-slate-500"
            >
              <span>Harga satuan</span>
              <span>{{ formatPrice(product.price) }}</span>
            </div>

            <div class="mt-3 flex items-center justify-between gap-3">
              <span class="font-semibold">Subtotal</span>
              <span class="text-xl font-black text-emerald-700">
                {{ formatPrice(subtotal) }}
              </span>
            </div>
          </div>

          <button
            type="button"
            @click="goToCheckout"
            :disabled="
              product.stock < 1 ||
              quantity < 1 ||
              quantity > Math.min(product.stock, 100)
            "
            class="mt-6 w-full rounded-xl bg-emerald-700 px-5 py-4 font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {{ product.stock > 0 ? "Lanjutkan Pemesanan" : "Stok Habis" }}
          </button>

          <p class="mt-4 text-center text-xs leading-5 text-slate-500">
            Pesanan akan diproses sesuai alur persetujuan dan pembayaran TEFA.
          </p>
        </aside>
      </section>
    </main>

    <footer
      class="mt-12 border-t border-slate-200 bg-white px-5 py-6 text-center text-sm text-slate-500"
    >
      © {{ new Date().getFullYear() }} TEFA Sekolah. Semua hak dilindungi.
    </footer>
  </div>
</template>
