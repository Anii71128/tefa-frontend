<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import api from "../services/api";
import { createOrder } from "../services/auth";

const route = useRoute();
const router = useRouter();

const product = ref(null);
const quantity = ref(1);
const isLoading = ref(true);
const isSubmitting = ref(false);
const errorMessage = ref("");
const orderResult = ref(null);

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

const fetchCheckoutProduct = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  product.value = null;

  const id = Number(route.query.product_id);
  const requestedQuantity = Number(route.query.quantity);

  if (!Number.isInteger(id) || id < 1) {
    errorMessage.value =
      "Produk tidak valid. Silakan pilih produk dari katalog.";
    isLoading.value = false;
    return;
  }

  if (
    !Number.isInteger(requestedQuantity) ||
    requestedQuantity < 1 ||
    requestedQuantity > 100
  ) {
    errorMessage.value = "Jumlah produk harus antara 1 sampai 100.";
    isLoading.value = false;
    return;
  }

  try {
    const response = await api.get(`/products/${id}`);
    product.value = response.data;

    if (Number(product.value.stock) < requestedQuantity) {
      errorMessage.value =
        "Stok produk tidak mencukupi. Silakan pilih jumlah yang tersedia.";
      product.value = null;
      return;
    }

    quantity.value = requestedQuantity;
  } catch (error) {
    console.error("Gagal memuat checkout:", error);

    errorMessage.value =
      error.response?.status === 404
        ? "Produk tidak ditemukan atau sudah tidak tersedia."
        : "Data checkout gagal dimuat. Pastikan server Laravel berjalan.";
  } finally {
    isLoading.value = false;
  }
};

const submitOrder = async () => {
  if (!product.value || isSubmitting.value || orderResult.value) {
    return;
  }

  errorMessage.value = "";
  isSubmitting.value = true;

  try {
    const result = await createOrder([
      {
        product_id: product.value.id,
        quantity: quantity.value,
      },
    ]);

    if (!result.order?.id) {
      throw new Error("Respons pesanan dari server tidak valid.");
    }

    orderResult.value = result.order;
  } catch (error) {
    console.error("Gagal membuat pesanan:", error);

    const status = error.response?.status;

    if (status === 401 || status === 419) {
      errorMessage.value =
        status === 401
          ? "Sesi login tidak ditemukan. Silakan login kembali."
          : "Sesi keamanan berakhir. Muat ulang halaman, lalu coba kembali.";

      if (status === 401) {
        router.push({
          path: "/login",
          query: { redirect: route.fullPath },
        });
      }
    } else if (status === 422) {
      const errors = error.response.data.errors;

      errorMessage.value =
        errors?.items?.[0] ||
        Object.values(errors || {}).flat()[0] ||
        error.response.data.message ||
        "Produk tidak valid atau stok tidak mencukupi.";
    } else {
      errorMessage.value =
        error.response?.data?.message ||
        error.message ||
        "Pesanan gagal dibuat. Silakan coba kembali.";
    }
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(fetchCheckoutProduct);

watch(
  () => [route.query.product_id, route.query.quantity],
  fetchCheckoutProduct,
);
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

        <RouterLink
          to="/products"
          class="text-sm font-semibold text-emerald-700 hover:text-emerald-900"
        >
          Kembali ke katalog
        </RouterLink>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-5 py-10 md:py-14">
      <div class="mb-8">
        <p class="text-sm font-bold uppercase tracking-widest text-emerald-700">
          Teaching Factory
        </p>
        <h1 class="mt-2 text-3xl font-black md:text-4xl">Checkout Pesanan</h1>
        <p class="mt-3 text-slate-500">
          Periksa produk dan jumlah sebelum melanjutkan pemesanan.
        </p>
      </div>

      <div
        v-if="isLoading"
        class="rounded-2xl border border-slate-200 bg-white p-12 text-center"
      >
        Memuat ringkasan pesanan...
      </div>

      <div
        v-else-if="errorMessage"
        class="rounded-2xl border border-red-200 bg-red-50 p-6"
      >
        <p class="font-semibold text-red-700">{{ errorMessage }}</p>
        <RouterLink
          to="/products"
          class="mt-4 inline-flex rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800"
        >
          Kembali ke katalog
        </RouterLink>
      </div>

      <div v-else-if="product" class="flex flex-col gap-6 lg:flex-row">
        <section
          class="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-6 md:p-8"
        >
          <h2 class="text-xl font-bold">Ringkasan Produk</h2>

          <div class="mt-6 flex flex-col gap-5 sm:flex-row">
            <div
              class="flex h-36 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-emerald-50 sm:w-36"
            >
              <img
                v-if="product.image"
                :src="`http://127.0.0.1:8000/storage/${product.image}`"
                :alt="product.name"
                class="h-full w-full object-cover"
                @error="(event) => (event.target.style.display = 'none')"
              />
              <span v-if="!product.image" class="text-5xl">📦</span>
            </div>

            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-emerald-700">
                {{ product.category?.name || "Tanpa kategori" }}
              </p>
              <h3 class="mt-2 text-xl font-bold">{{ product.name }}</h3>
              <p class="mt-2 text-sm leading-6 text-slate-500">
                {{ product.description || "Tidak ada deskripsi produk." }}
              </p>
              <p class="mt-3 font-bold text-emerald-700">
                {{ formatPrice(product.price) }}
              </p>
              <p class="mt-1 text-sm text-slate-500">
                Jumlah: {{ quantity }} unit
              </p>
            </div>
          </div>

          <div class="mt-8 rounded-xl bg-slate-50 p-4">
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
        </section>

        <aside
          class="h-fit w-full rounded-2xl border border-slate-200 bg-white p-6 lg:w-80"
        >
          <h2 class="text-xl font-bold">Total Pembayaran</h2>

          <div
            class="mt-6 flex items-center justify-between gap-3 text-sm text-slate-500"
          >
            <span>Subtotal produk</span>
            <span>{{ formatPrice(subtotal) }}</span>
          </div>

          <div class="mt-4 border-t border-slate-200 pt-4">
            <div class="flex items-center justify-between gap-3">
              <span class="font-semibold">Total</span>
              <span class="text-xl font-black text-emerald-700">
                {{ formatPrice(subtotal) }}
              </span>
            </div>
          </div>

          <div
            v-if="errorMessage"
            role="alert"
            class="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
          >
            {{ errorMessage }}
          </div>

          <div
            v-if="orderResult"
            class="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4"
          >
            <p class="font-bold text-emerald-800">Pesanan berhasil dibuat!</p>

            <p class="mt-2 text-sm text-emerald-700">Nomor pesanan:</p>

            <p class="mt-1 break-all font-bold text-emerald-900">
              {{ orderResult.order_number }}
            </p>

            <p class="mt-3 text-sm text-emerald-700">
              Status:
              <span class="font-semibold">
                {{ orderResult.status }}
              </span>
            </p>

            <p class="mt-2 text-sm leading-6 text-emerald-700">
              Pesanan menunggu persetujuan guru sebelum pembayaran dapat
              dilakukan.
            </p>
          </div>

          <div
            v-else
            class="mt-6 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-800"
          >
            Pesanan akan menunggu persetujuan guru sebelum pembayaran dapat
            dilakukan.
          </div>

          <button
            v-if="!orderResult"
            type="button"
            :disabled="isSubmitting || isLoading || !product"
            @click="submitOrder"
            class="mt-6 w-full rounded-xl bg-emerald-700 px-5 py-4 font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ isSubmitting ? "Memproses Pesanan..." : "Lanjutkan Pemesanan" }}
          </button>

          <RouterLink
            to="/orders"
            class="mt-6 flex w-full justify-center rounded-xl bg-emerald-700 px-5 py-4 text-center font-bold text-white transition hover:bg-emerald-800"
          >
            Lihat Pesanan Saya
          </RouterLink>

          <p v-if="!orderResult" class="mt-3 text-xs leading-5 text-slate-500">
            Pesanan akan disimpan ke database dan menunggu persetujuan guru.
          </p>
        </aside>
      </div>
    </main>
  </div>
</template>
