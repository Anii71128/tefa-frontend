<script setup>
import { ref, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { getMyOrders, createPayment } from "../services/auth";

const orders = ref([]);
const isLoading = ref(true);
const loadingPaymentId = ref(null);
const errorMessage = ref("");
const paymentMessage = ref("");

const formatPrice = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const statusLabel = (status) => {
  const labels = {
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

  return labels[status] || status || "Belum diketahui";
};

const statusClass = (status) => {
  const styles = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-emerald-100 text-emerald-800",
    rejected: "bg-red-100 text-red-800",
    processing: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    unpaid: "bg-amber-100 text-amber-800",
    paid: "bg-emerald-100 text-emerald-800",
    failed: "bg-red-100 text-red-800",
    expired: "bg-slate-100 text-slate-700",
  };

  return styles[status] || "bg-slate-100 text-slate-700";
};

const loadOrders = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    orders.value = await getMyOrders();
  } catch (error) {
    console.error("Gagal memuat pesanan:", error);

    if (error.response?.status === 401) {
      errorMessage.value = "Sesi login berakhir. Silakan login kembali.";
    } else {
      errorMessage.value =
        error.response?.data?.message ||
        "Pesanan gagal dimuat. Pastikan backend Laravel berjalan.";
    }
  } finally {
    isLoading.value = false;
  }
};

const loadMidtransScript = () =>
  new Promise((resolve, reject) => {
    if (window.snap) {
      resolve();
      return;
    }

    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
    const isProduction = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === "true";

    if (!clientKey) {
      reject(new Error("Client Key Midtrans belum dikonfigurasi."));
      return;
    }

    const script = document.createElement("script");
    script.src = isProduction
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";

    script.setAttribute("data-client-key", clientKey);
    script.onload = () => {
      if (window.snap) resolve();
      else reject(new Error("Midtrans Snap gagal dimuat."));
    };
    script.onerror = () =>
      reject(new Error("Gagal memuat layanan pembayaran Midtrans."));

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
      throw new Error(
        result.message || "Snap Token tidak diterima dari server.",
      );
    }

    await loadMidtransScript();

    window.snap.pay(result.snap_token, {
      onSuccess: async () => {
        paymentMessage.value =
          "Pembayaran berhasil diproses. Memperbarui status pesanan...";
        await loadOrders();
      },

      onPending: async () => {
        paymentMessage.value =
          "Pembayaran belum selesai. Periksa instruksi pembayaran dari Midtrans.";
        await loadOrders();
      },

      onError: async () => {
        errorMessage.value =
          "Pembayaran mengalami kendala. Silakan coba kembali.";
        await loadOrders();
      },

      onClose: async () => {
        paymentMessage.value =
          "Jendela pembayaran ditutup. Status pembayaran belum tentu berubah.";
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
  <main class="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-10">
    <div class="mx-auto max-w-5xl">
      <div
        class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
      >
        <div>
          <p class="text-sm font-semibold text-emerald-700">
            TEFA · Area Pelanggan
          </p>
          <h1 class="mt-2 text-3xl font-black text-slate-900">Pesanan Saya</h1>
          <p class="mt-2 text-slate-500">
            Pantau persetujuan pesanan dan status pembayaranmu.
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <button
            type="button"
            @click="loadOrders"
            :disabled="isLoading"
            class="rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            {{ isLoading ? "Memuat..." : "Muat Ulang" }}
          </button>

          <RouterLink
            to="/products"
            class="rounded-xl bg-emerald-700 px-4 py-3 text-center font-semibold text-white hover:bg-emerald-800"
          >
            Lihat Katalog
          </RouterLink>
        </div>
      </div>

      <div
        v-if="errorMessage"
        role="alert"
        class="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
      >
        {{ errorMessage }}
      </div>

      <div
        v-if="paymentMessage"
        role="status"
        class="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800"
      >
        {{ paymentMessage }}
      </div>

      <div
        v-if="isLoading"
        class="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500"
      >
        Memuat daftar pesanan...
      </div>

      <div
        v-else-if="orders.length === 0 && !errorMessage"
        class="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center"
      >
        <h2 class="text-xl font-bold text-slate-900">Belum ada pesanan</h2>
        <p class="mt-2 text-slate-500">
          Pesanan yang kamu buat akan muncul di halaman ini.
        </p>
        <RouterLink
          to="/products"
          class="mt-6 inline-flex rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800"
        >
          Mulai Belanja
        </RouterLink>
      </div>

      <div v-else class="mt-8 flex flex-col gap-5">
        <article
          v-for="order in orders"
          :key="order.id"
          class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div
            class="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start"
          >
            <div>
              <p class="text-sm text-slate-500">Nomor pesanan</p>
              <h2 class="mt-1 break-all text-lg font-extrabold text-slate-900">
                {{ order.order_number }}
              </h2>
              <p class="mt-2 text-sm text-slate-500">
                {{ formatDate(order.created_at) }}
              </p>
            </div>

            <div class="flex flex-wrap gap-2">
              <span
                class="rounded-full px-3 py-1.5 text-xs font-bold"
                :class="statusClass(order.status)"
              >
                {{ statusLabel(order.status) }}
              </span>

              <span
                class="rounded-full px-3 py-1.5 text-xs font-bold"
                :class="statusClass(order.payment_status)"
              >
                {{ statusLabel(order.payment_status) }}
              </span>
            </div>
          </div>

          <div class="flex flex-col gap-4 py-5">
            <div
              v-for="item in order.order_items || []"
              :key="item.id"
              class="flex items-start justify-between gap-4"
            >
              <div class="min-w-0">
                <p class="font-semibold text-slate-800">
                  {{
                    item.product?.name || item.product?.title || "Produk TEFA"
                  }}
                </p>
                <p class="mt-1 text-sm text-slate-500">
                  {{ item.quantity }} × {{ formatPrice(item.price) }}
                </p>
              </div>

              <p class="shrink-0 font-semibold text-slate-800">
                {{ formatPrice(item.subtotal) }}
              </p>
            </div>
          </div>

          <div
            class="flex flex-col justify-between gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center"
          >
            <div>
              <p class="text-sm text-slate-500">Total pesanan</p>
              <p class="mt-1 text-xl font-black text-emerald-700">
                {{ formatPrice(order.total_amount) }}
              </p>
            </div>

            <div class="flex flex-col gap-2 sm:items-end">
              <button
                v-if="
                  order.status === 'approved' && order.payment_status !== 'paid'
                "
                type="button"
                @click="payOrder(order)"
                :disabled="loadingPaymentId !== null"
                class="rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {{
                  loadingPaymentId === order.id
                    ? "Menyiapkan Pembayaran..."
                    : "Bayar Sekarang"
                }}
              </button>

              <p
                v-else-if="order.payment_status === 'paid'"
                class="text-sm font-semibold text-emerald-700"
              >
                Pembayaran sudah lunas
              </p>

              <p
                v-else-if="order.status === 'pending'"
                class="text-sm text-amber-700"
              >
                Menunggu persetujuan guru sebelum pembayaran.
              </p>

              <p
                v-else-if="order.status === 'rejected'"
                class="text-sm text-red-700"
              >
                Pesanan ditolak. Silakan hubungi pihak TEFA jika diperlukan.
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  </main>
</template>
