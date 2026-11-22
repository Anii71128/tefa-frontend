<script setup>
import { ref, computed, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { CreditCard, RefreshCw } from "lucide-vue-next";
import MainLayout from "../components/layouts/MainLayout.vue";
import { getMyOrders } from "../services/auth";
import { usePayment } from "../composables/usePayment";
import { formatRupiah } from "../utils/format";
import { formatDate, statusLabel, statusClass } from "../utils/orders";

const orders = ref([]);
const isLoading = ref(true);
const loadError = ref("");

async function load() {
    isLoading.value = true;
    loadError.value = "";

    try {
        orders.value = await getMyOrders();
    } catch (error) {
        console.error("Gagal memuat pembayaran:", error);
        loadError.value =
            error.response?.data?.message || "Data pembayaran belum dapat dimuat. Silakan coba lagi.";
    } finally {
        isLoading.value = false;
    }
}

const { payingId, error: payError, info: payInfo, pay } = usePayment(load);

// Sudah disetujui guru tapi belum lunas
const awaiting = computed(() =>
    orders.value.filter((o) => o.status === "approved" && o.payment_status !== "paid"),
);
const paid = computed(() => orders.value.filter((o) => o.payment_status === "paid"));
const waitingApproval = computed(() => orders.value.filter((o) => o.status === "pending").length);
const totalDue = computed(() => awaiting.value.reduce((sum, o) => sum + Number(o.total_amount || 0), 0));

onMounted(load);
</script>

<template>
    <MainLayout>
        <section class="space-y-5">
            <div class="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 class="text-2xl font-extrabold tracking-tight text-neutral-900">Pembayaran</h1>
                    <p class="mt-1 text-sm text-neutral-500">Pantau tagihan dan riwayat pembayaran pesanan Anda.</p>
                </div>
                <button type="button" :disabled="isLoading"
                    class="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-50 disabled:opacity-50"
                    @click="load">
                    <RefreshCw class="size-4" :class="isLoading ? 'animate-spin' : ''" />
                    {{ isLoading ? "Memuat..." : "Muat ulang" }}
                </button>
            </div>

            <div v-if="loadError || payError" role="alert"
                class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {{ loadError || payError }}
            </div>
            <div v-if="payInfo" role="status"
                class="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                {{ payInfo }}
            </div>

            <div v-if="isLoading && !orders.length"
                class="h-48 animate-pulse rounded-3xl border border-neutral-200 bg-white">
            </div>

            <template v-else>
                <!-- Ringkasan -->
                <div class="grid gap-4 sm:grid-cols-3">
                    <div class="rounded-3xl border border-primary-200 bg-primary-50 p-5">
                        <p class="text-xs text-neutral-600">Perlu dibayar</p>
                        <p class="mt-1 text-xl font-extrabold text-primary-700">{{ formatRupiah(totalDue) }}</p>
                        <p class="mt-1 text-xs text-neutral-500">{{ awaiting.length }} tagihan</p>
                    </div>
                    <div class="rounded-3xl border border-neutral-200 bg-white p-5">
                        <p class="text-xs text-neutral-600">Sudah lunas</p>
                        <p class="mt-1 text-xl font-extrabold text-neutral-900">{{ paid.length }} pesanan</p>
                    </div>
                    <div class="rounded-3xl border border-neutral-200 bg-white p-5">
                        <p class="text-xs text-neutral-600">Menunggu persetujuan guru</p>
                        <p class="mt-1 text-xl font-extrabold text-neutral-900">{{ waitingApproval }} pesanan</p>
                    </div>
                </div>

                <!-- Belum ada tagihan sama sekali -->
                <div v-if="!awaiting.length && !paid.length"
                    class="rounded-3xl border border-neutral-200 bg-white p-10 text-center">
                    <div
                        class="mx-auto flex size-12 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                        <CreditCard class="size-6" />
                    </div>
                    <p class="mt-4 text-sm font-semibold text-neutral-900">Belum ada tagihan</p>
                    <p class="mx-auto mt-1 max-w-sm text-sm text-neutral-500">
                        Tagihan akan muncul di sini setelah pesanan Anda disetujui guru.
                    </p>
                    <RouterLink to="/orders"
                        class="mt-5 inline-flex rounded-xl border border-neutral-300 bg-white px-5 py-2 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-50">
                        Lihat pesanan saya
                    </RouterLink>
                </div>

                <!-- Menunggu pembayaran -->
                <div v-if="awaiting.length" class="space-y-3">
                    <h2 class="text-base font-extrabold text-neutral-900">Menunggu pembayaran</h2>
                    <ul
                        class="divide-y divide-neutral-200 overflow-hidden rounded-3xl border border-neutral-200 bg-white">
                        <li v-for="o in awaiting" :key="o.id"
                            class="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center sm:px-6">
                            <div class="min-w-0">
                                <p class="break-all text-sm font-extrabold text-neutral-900">{{ o.order_number }}</p>
                                <p class="mt-0.5 text-xs text-neutral-500">{{ formatDate(o.created_at) }}</p>
                                <span class="mt-2 inline-flex rounded-full border px-3 py-0.5 text-xs font-semibold"
                                    :class="statusClass(o.payment_status || 'unpaid')">
                                    {{ statusLabel(o.payment_status || "unpaid") }}
                                </span>
                            </div>
                            <div class="flex items-center justify-between gap-4 sm:justify-end">
                                <p class="text-lg font-extrabold text-primary-700">{{ formatRupiah(o.total_amount) }}
                                </p>
                                <button type="button" :disabled="payingId !== null"
                                    class="rounded-xl bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-60"
                                    @click="pay(o)">
                                    {{ payingId === o.id ? "Menyiapkan..." : "Bayar sekarang" }}
                                </button>
                            </div>
                        </li>
                    </ul>
                </div>

                <!-- Riwayat -->
                <div v-if="paid.length" class="space-y-3">
                    <h2 class="text-base font-extrabold text-neutral-900">Riwayat pembayaran</h2>
                    <ul
                        class="divide-y divide-neutral-200 overflow-hidden rounded-3xl border border-neutral-200 bg-white">
                        <li v-for="o in paid" :key="o.id" class="flex items-center justify-between gap-4 p-5 sm:px-6">
                            <div class="min-w-0">
                                <p class="break-all text-sm font-extrabold text-neutral-900">{{ o.order_number }}</p>
                                <p class="mt-0.5 text-xs text-neutral-500">{{ formatDate(o.created_at) }}</p>
                            </div>
                            <div class="shrink-0 text-right">
                                <p class="text-base font-extrabold text-neutral-900">{{ formatRupiah(o.total_amount) }}
                                </p>
                                <span class="mt-1 inline-flex rounded-full border px-3 py-0.5 text-xs font-semibold"
                                    :class="statusClass('paid')">
                                    Lunas
                                </span>
                            </div>
                        </li>
                    </ul>
                </div>
            </template>
        </section>
    </MainLayout>
</template>