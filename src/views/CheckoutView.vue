<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { ImageOff } from "lucide-vue-next";
import MainLayout from "../components/layouts/MainLayout.vue";
import api from "../services/api";
import { createOrder } from "../services/auth";
import { useCartStore } from "../stores/cart";
import { formatRupiah, imageUrl } from "../utils/format";

const route = useRoute();
const router = useRouter();
const cart = useCartStore();

const fromCart = computed(() => route.query.source === "cart");

const lines = ref([]);
const isLoading = ref(true);
const isSubmitting = ref(false);
const loadError = ref("");
const submitError = ref("");
const orderResult = ref(null);

const total = computed(() => lines.value.reduce((sum, l) => sum + l.price * l.qty, 0));

async function load() {
  isLoading.value = true;
  loadError.value = "";
  submitError.value = "";
  lines.value = [];

  try {
    if (fromCart.value) {
      if (!cart.items.length) {
        loadError.value = "Draft pesanan masih kosong. Tambahkan produk dari katalog.";
        return;
      }
      lines.value = cart.items.map((i) => ({ ...i }));
      return;
    }

    const id = Number(route.query.product_id);
    const qty = Number(route.query.quantity);

    if (!Number.isInteger(id) || id < 1) {
      loadError.value = "Produk tidak valid. Silakan pilih produk dari katalog.";
      return;
    }
    if (!Number.isInteger(qty) || qty < 1 || qty > 100) {
      loadError.value = "Jumlah produk harus antara 1 sampai 100.";
      return;
    }

    const response = await api.get(`/products/${id}`);
    const p = response.data?.data ?? response.data;

    if (Number(p.stock) < qty) {
      loadError.value = "Stok produk tidak mencukupi. Silakan pilih jumlah yang tersedia.";
      return;
    }

    lines.value = [
      {
        id: p.id,
        name: p.name,
        price: Number(p.price) || 0,
        image: p.image ?? null,
        stock: Number(p.stock),
        qty,
      },
    ];
  } catch (error) {
    console.error("Gagal memuat checkout:", error);
    loadError.value =
      error.response?.status === 404
        ? "Produk tidak ditemukan atau sudah tidak tersedia."
        : "Data checkout belum dapat dimuat. Silakan coba lagi.";
  } finally {
    isLoading.value = false;
  }
}

async function submitOrder() {
  if (!lines.value.length || isSubmitting.value || orderResult.value) return;

  submitError.value = "";
  isSubmitting.value = true;

  try {
    const result = await createOrder(
      lines.value.map((l) => ({ product_id: l.id, quantity: l.qty })),
    );

    if (!result.order?.id) {
      throw new Error("Respons pesanan dari server tidak valid.");
    }

    orderResult.value = result.order;
    if (fromCart.value) cart.clear();
  } catch (error) {
    console.error("Gagal membuat pesanan:", error);
    const status = error.response?.status;

    if (status === 401) {
      router.push({ path: "/login", query: { redirect: route.fullPath } });
    } else if (status === 419) {
      submitError.value = "Sesi keamanan berakhir. Muat ulang halaman, lalu coba kembali.";
    } else if (status === 422) {
      const errors = error.response.data?.errors;
      submitError.value =
        errors?.items?.[0] ||
        Object.values(errors || {}).flat()[0] ||
        error.response.data?.message ||
        "Produk tidak valid atau stok tidak mencukupi.";
    } else {
      submitError.value =
        error.response?.data?.message || error.message || "Pesanan gagal dibuat. Silakan coba kembali.";
    }
  } finally {
    isSubmitting.value = false;
  }
}

onMounted(load);
watch(() => [route.query.source, route.query.product_id, route.query.quantity], load);
</script>

<template>
  <MainLayout>
    <section class="space-y-5">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight text-neutral-900">Checkout pesanan</h1>
        <p class="mt-1 text-sm text-neutral-500">Periksa produk dan jumlah sebelum melanjutkan pemesanan.</p>
      </div>

      <div v-if="isLoading" class="h-64 animate-pulse rounded-3xl border border-neutral-200 bg-white"></div>

      <div v-else-if="loadError" role="alert" class="rounded-3xl border border-neutral-200 bg-white p-10 text-center">
        <p class="text-sm text-neutral-600">{{ loadError }}</p>
        <RouterLink to="/products"
          class="mt-4 inline-flex rounded-xl bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-800">
          Lihat katalog
        </RouterLink>
      </div>

      <div v-else-if="lines.length" class="grid items-start gap-5 lg:grid-cols-[1fr_340px]">
        <div class="overflow-hidden rounded-3xl border border-neutral-200 bg-white">
          <h2 class="border-b border-neutral-200 px-5 py-4 text-base font-extrabold text-neutral-900 sm:px-6">
            Ringkasan produk
          </h2>
          <ul class="divide-y divide-neutral-200">
            <li v-for="l in lines" :key="l.id" class="flex gap-4 p-4 sm:px-6 sm:py-5">
              <div class="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-neutral-100 sm:size-24">
                <img v-if="imageUrl(l.image)" :src="imageUrl(l.image)" :alt="l.name"
                  class="absolute inset-0 size-full object-cover" />
                <div v-else class="flex size-full items-center justify-center text-neutral-400">
                  <ImageOff class="size-6" />
                </div>
              </div>
              <div class="flex min-w-0 flex-1 flex-col">
                <p class="line-clamp-2 text-sm font-extrabold leading-snug text-neutral-900">{{ l.name }}</p>
                <p class="mt-0.5 text-xs text-neutral-500">
                  {{ formatRupiah(l.price) }} x {{ l.qty }} unit
                </p>
                <p class="mt-auto pt-2 text-base font-extrabold text-neutral-900">
                  {{ formatRupiah(l.price * l.qty) }}
                </p>
              </div>
            </li>
          </ul>
        </div>

        <aside class="rounded-3xl border border-neutral-200 bg-white p-6 lg:sticky lg:top-6">
          <h2 class="text-base font-extrabold text-neutral-900">Total pembayaran</h2>

          <div class="mt-5 flex items-center justify-between text-sm text-neutral-500">
            <span>Subtotal produk</span>
            <span>{{ formatRupiah(total) }}</span>
          </div>
          <div class="mt-4 flex items-center justify-between border-t border-neutral-200 pt-4">
            <span class="text-sm font-semibold text-neutral-800">Total</span>
            <span class="text-xl font-extrabold text-primary-700">{{ formatRupiah(total) }}</span>
          </div>

          <div v-if="submitError" role="alert"
            class="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {{ submitError }}
          </div>

          <div v-if="orderResult" class="mt-5 rounded-xl border border-primary-200 bg-primary-50 p-4">
            <p class="text-sm font-bold text-primary-800">Pesanan berhasil dibuat</p>
            <p class="mt-3 text-xs text-primary-700">Nomor pesanan</p>
            <p class="mt-0.5 break-all text-sm font-extrabold text-primary-900">{{ orderResult.order_number }}</p>
            <p class="mt-3 text-xs text-primary-700">
              Status: <span class="font-semibold">{{ orderResult.status }}</span>
            </p>
            <p class="mt-2 text-xs leading-relaxed text-primary-700">
              Pesanan menunggu persetujuan guru sebelum pembayaran dapat dilakukan.
            </p>
          </div>
          <div v-else class="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
            Pesanan akan menunggu persetujuan guru sebelum pembayaran dapat dilakukan.
          </div>

          <button v-if="!orderResult" type="button" :disabled="isSubmitting" @click="submitOrder"
            class="mt-6 w-full rounded-xl bg-primary-700 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-60">
            {{ isSubmitting ? "Memproses pesanan..." : "Lanjutkan pemesanan" }}
          </button>

          <template v-else>
            <RouterLink to="/orders"
              class="mt-6 flex w-full justify-center rounded-xl bg-primary-700 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-800">
              Lihat pesanan saya
            </RouterLink>
            <RouterLink to="/products"
              class="mt-3 flex w-full justify-center rounded-xl border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-50">
              Kembali ke katalog
            </RouterLink>
          </template>
        </aside>
      </div>
    </section>
  </MainLayout>
</template>