<script setup>
import { ref, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { ClipboardList, RefreshCw } from "lucide-vue-next";
import MainLayout from "../components/layouts/MainLayout.vue";
import { getMyOrders, createPayment } from "../services/auth";
import { formatRupiah } from "../utils/format";

const orders = ref([]);
const isLoading = ref(true);
const loadingPaymentId = ref(null);
const errorMessage = ref("");
const paymentMessage = ref("");

const formatDate = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const LABELS = {
  pending: "Menunggu persetujuan guru",
  approved: "Disetujui guru",
  rejected: "Ditolak",
  processing: "Sedang diproses",
  completed: "Selesai",
  unpaid: "Belum dibayar",
  paid: "Lunas",
  failed: "Gagal",
  expired: "Kedaluwarsa",
};

const STYLES = {
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  approved: "bg-primary-50 text-primary-700 border-primary-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-primary-50 text-primary-700 border-primary-200",
  unpaid: "bg-amber-50 text-amber-800 border-amber-200",
  paid: "bg-primary-50 text-primary-700 border-primary-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  expired: "bg-neutral-100 text-neutral-600 border-neutral-200",
};

const statusLabel = (s) => LABELS[s] || s || "Belum diketahui";
const statusClass = (s) => STYLES[s] || "bg-neutral-100 text-neutral-600 border-neutral-200";

const loadOrders = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    orders.value = await getMyOrders();
  } catch (error) {
    console.error("Gagal memuat pesanan:", error);
    errorMessage.value =
      error.response?.status === 401
        ? "Sesi login berakhir. Silakan login kembali."
        : error.response?.data?.message || "Pesanan belum dapat dimuat. Silakan coba lagi.";
  } finally {
    isLoading.value = false;
  }
};

const loadMidtransScript = () =>
  new Promise((resolve, reject) => {
    if (window.snap) return resolve();

    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
    const isProduction = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === "true";

    if (!clientKey) return reject(new Error("Client Key Midtrans belum dikonfigurasi."));

    const script = document.createElement("script");
    script.src = isProduction
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", clientKey);
    script.onload = () =>
      window.snap ? resolve() : reject(new Error("Midtrans Snap gagal dimuat."));
    script.onerror = () => reject(new Error("Gagal memuat layanan pembayaran Midtrans."));
    document.head.appendChild(script);
  });

const payOrder = async (order) => {
  if (loadingPaymentId.value !== null) return;

  loadingPaymentId.value = order.id;
  errorMessage.value = "";
  paymentMessage.value = "";

  try {
    const result = await createPayment(order.id);

    if (!result.snap_token) {
      throw new Error(result.message || "Snap Token tidak diterima dari server.");
    }

    await loadMidtransScript();

    window.snap.pay(result.snap_token, {
      onSuccess: async () => {
        paymentMessage.value = "Pembayaran berhasil diproses. Memperbarui status pesanan...";
        await loadOrders();
      },
      onPending: async () => {
        paymentMessage.value = "Pembayaran belum selesai. Periksa instruksi pembayaran dari Midtrans.";
        await loadOrders();
      },
      onError: async () => {
        errorMessage.value = "Pembayaran mengalami kendala. Silakan coba kembali.";
        await loadOrders();
      },
      onClose: async () => {
        paymentMessage.value = "Jendela pembayaran ditutup. Status pembayaran belum tentu berubah.";
        await loadOrders();
      },
    });
  } catch (error) {
    console.error("Gagal memulai pembayaran:", error);
    errorMessage.value =
      error.response?.data?.message ||
      error.message ||
      "Pembayaran gagal dimulai. Silakan coba kembali.";
  } finally {
    loadingPaymentId.value = null;
  }
};

onMounted(loadOrders);
</script>

<template>
  <MainLayout>
    <section class="space-y-5">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 class="text-2xl font-extrabold tracking-tight text-neutral-900">Pesanan saya</h1>
          <p class="mt-1 text-sm text-neutral-500">Pantau persetujuan pesanan dan status pembayaran Anda.</p>
        </div>
        <button type="button" :disabled="isLoading"
          class="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-50 disabled:opacity-50"
          @click="loadOrders">
          <RefreshCw class="size-4" :class="isLoading ? 'animate-spin' : ''" />
          {{ isLoading ? "Memuat..." : "Muat ulang" }}
        </button>
      </div>

      <div v-if="errorMessage" role="alert"
        class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ errorMessage }}
      </div>
      <div v-if="paymentMessage" role="status"
        class="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        {{ paymentMessage }}
      </div>

      <!-- Loading -->
      <div v-if="isLoading && !orders.length" class="space-y-4">
        <div v-for="n in 2" :key="n" class="h-48 animate-pulse rounded-3xl border border-neutral-200 bg-white"></div>
      </div>

      <!-- Kosong -->
      <div v-else-if="!orders.length && !errorMessage"
        class="rounded-3xl border border-neutral-200 bg-white p-10 text-center">
        <div class="mx-auto flex size-12 items-center justify-center rounded-full bg-primary-50 text-primary-700">
          <ClipboardList class="size-6" />
        </div>
        <p class="mt-4 text-sm font-semibold text-neutral-900">Belum ada pesanan</p>
        <p class="mx-auto mt-1 max-w-sm text-sm text-neutral-500">
          Pesanan yang Anda buat akan muncul di halaman ini.
        </p>
        <RouterLink to="/products"
          class="mt-5 inline-flex rounded-xl bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-800">
          Lihat katalog
        </RouterLink>
      </div>

      <!-- Daftar -->
      <div v-else class="space-y-4">
        <article v-for="order in orders" :key="order.id"
          class="overflow-hidden rounded-3xl border border-neutral-200 bg-white">
          <header
            class="flex flex-col justify-between gap-3 border-b border-neutral-200 px-5 py-4 sm:flex-row sm:items-start sm:px-6">
            <div class="min-w-0">
              <p class="text-xs text-neutral-500">Nomor pesanan</p>
              <h2 class="mt-0.5 break-all text-base font-extrabold text-neutral-900">{{ order.order_number }}</h2>
              <p class="mt-1 text-xs text-neutral-500">{{ formatDate(order.created_at) }}</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <span class="rounded-full border px-3 py-1 text-xs font-semibold" :class="statusClass(order.status)">
                {{ statusLabel(order.status) }}
              </span>
              <span class="rounded-full border px-3 py-1 text-xs font-semibold"
                :class="statusClass(order.payment_status)">
                {{ statusLabel(order.payment_status) }}
              </span>
            </div>
          </header>

          <ul class="divide-y divide-neutral-100 px-5 sm:px-6">
            <li v-for="item in order.order_items || []" :key="item.id"
              class="flex items-start justify-between gap-4 py-3">
              <div class="min-w-0">
                <p class="text-sm font-semibold text-neutral-900">
                  {{ item.product?.name || item.product?.title || "Produk TEFA" }}
                </p>
                <p class="mt-0.5 text-xs text-neutral-500">{{ item.quantity }} x {{ formatRupiah(item.price) }}</p>
              </div>
              <p class="shrink-0 text-sm font-semibold text-neutral-900">{{ formatRupiah(item.subtotal) }}</p>
            </li>
          </ul>

          <footer
            class="flex flex-col justify-between gap-3 border-t border-neutral-200 bg-neutral-50 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
            <div>
              <p class="text-xs text-neutral-500">Total pesanan</p>
              <p class="text-lg font-extrabold text-primary-700">{{ formatRupiah(order.total_amount) }}</p>
            </div>

            <div class="sm:text-right">
              <button v-if="order.status === 'approved' && order.payment_status !== 'paid'" type="button"
                :disabled="loadingPaymentId !== null"
                class="rounded-xl bg-primary-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-60"
                @click="payOrder(order)">
                {{ loadingPaymentId === order.id ? "Menyiapkan pembayaran..." : "Bayar sekarang" }}
              </button>
              <p v-else-if="order.payment_status === 'paid'" class="text-sm font-semibold text-primary-700">
                Pembayaran sudah lunas
              </p>
              <p v-else-if="order.status === 'pending'" class="text-sm text-amber-700">
                Menunggu persetujuan guru sebelum pembayaran.
              </p>
              <p v-else-if="order.status === 'rejected'" class="text-sm text-red-700">
                Pesanan ditolak. Hubungi pihak TEFA jika diperlukan.
              </p>
            </div>
          </footer>
        </article>
      </div>
    </section>
  </MainLayout>
</template>