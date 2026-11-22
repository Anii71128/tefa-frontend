<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { ClipboardList, ImageOff, Minus, Plus, Trash2 } from "lucide-vue-next";
import MainLayout from "../components/layouts/MainLayout.vue";
import { useCartStore } from "../stores/cart";
import { formatRupiah, imageUrl } from "../utils/format";

const cart = useCartStore();

const totalQty = computed(() => cart.items.reduce((sum, i) => sum + i.qty, 0));

function onQtyChange(item, event) {
    cart.setQty(item.id, Number(event.target.value));
    event.target.value = item.qty;
}
</script>

<template>
    <MainLayout>
        <section class="space-y-5">
            <div class="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 class="text-2xl font-extrabold tracking-tight text-neutral-900">Draft pesanan</h1>
                    <p class="mt-1 text-sm text-neutral-500">Periksa produk dan jumlahnya sebelum checkout.</p>
                </div>
                <button v-if="cart.items.length" type="button"
                    class="text-sm font-semibold text-neutral-500 transition-colors hover:text-red-600"
                    @click="cart.clear()">
                    Kosongkan draft
                </button>
            </div>

            <div v-if="!cart.items.length" class="rounded-3xl border border-neutral-200 bg-white p-10 text-center">
                <div
                    class="mx-auto flex size-12 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                    <ClipboardList class="size-6" />
                </div>
                <p class="mt-4 text-sm font-semibold text-neutral-900">Draft pesanan masih kosong</p>
                <p class="mx-auto mt-1 max-w-sm text-sm text-neutral-500">
                    Pilih produk dari katalog, lalu tekan tombol Tambah.
                </p>
                <RouterLink to="/products"
                    class="mt-5 inline-flex rounded-xl bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-800">
                    Lihat katalog
                </RouterLink>
            </div>

            <div v-else class="grid items-start gap-5 lg:grid-cols-[1fr_340px]">
                <ul class="divide-y divide-neutral-200 overflow-hidden rounded-3xl border border-neutral-200 bg-white">
                    <li v-for="item in cart.items" :key="item.id" class="flex gap-4 p-4 sm:p-5">
                        <RouterLink :to="{ name: 'product-detail', params: { id: item.id } }"
                            class="relative block size-20 shrink-0 overflow-hidden rounded-2xl bg-neutral-100 sm:size-24"
                            :aria-label="`Lihat detail ${item.name}`">
                            <img v-if="imageUrl(item.image)" :src="imageUrl(item.image)" :alt="item.name" loading="lazy"
                                class="absolute inset-0 size-full object-cover" />
                            <div v-else class="flex size-full items-center justify-center text-neutral-400">
                                <ImageOff class="size-6" />
                            </div>
                        </RouterLink>

                        <div class="flex min-w-0 flex-1 flex-col">
                            <div class="flex items-start justify-between gap-3">
                                <div class="min-w-0">
                                    <RouterLink :to="{ name: 'product-detail', params: { id: item.id } }"
                                        class="line-clamp-2 text-sm font-extrabold leading-snug text-neutral-900 hover:text-primary-700">
                                        {{ item.name }}
                                    </RouterLink>
                                    <p class="mt-0.5 text-xs text-neutral-500">{{ formatRupiah(item.price) }} / unit</p>
                                </div>
                                <button type="button" :aria-label="`Hapus ${item.name}`"
                                    class="shrink-0 rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                    @click="cart.remove(item.id)">
                                    <Trash2 class="size-4" />
                                </button>
                            </div>

                            <div class="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                                <div class="flex items-center gap-1.5">
                                    <button type="button" aria-label="Kurangi jumlah" :disabled="item.qty <= 1"
                                        class="flex size-9 items-center justify-center rounded-lg border border-neutral-300 text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
                                        @click="cart.setQty(item.id, item.qty - 1)">
                                        <Minus class="size-4" />
                                    </button>
                                    <input type="number" min="1" :max="item.stock" :value="item.qty"
                                        :aria-label="`Jumlah ${item.name}`"
                                        class="h-9 w-14 rounded-lg border border-neutral-300 text-center text-sm font-semibold outline-none transition focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
                                        @change="onQtyChange(item, $event)" />
                                    <button type="button" aria-label="Tambah jumlah" :disabled="item.qty >= item.stock"
                                        class="flex size-9 items-center justify-center rounded-lg border border-neutral-300 text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
                                        @click="cart.setQty(item.id, item.qty + 1)">
                                        <Plus class="size-4" />
                                    </button>
                                    <span class="ml-1 text-xs text-neutral-500">Stok {{ item.stock }}</span>
                                </div>

                                <p class="text-base font-extrabold text-neutral-900">{{ formatRupiah(item.price *
                                    item.qty) }}</p>
                            </div>
                        </div>
                    </li>
                </ul>

                <aside class="rounded-3xl border border-neutral-200 bg-white p-6 lg:sticky lg:top-6">
                    <h2 class="text-base font-extrabold text-neutral-900">Ringkasan</h2>

                    <div class="mt-5 flex items-center justify-between text-sm text-neutral-500">
                        <span>Jumlah produk</span>
                        <span>{{ cart.items.length }} jenis, {{ totalQty }} unit</span>
                    </div>

                    <div class="mt-4 flex items-center justify-between border-t border-neutral-200 pt-4">
                        <span class="text-sm font-semibold text-neutral-800">Total</span>
                        <span class="text-xl font-extrabold text-primary-700">{{ formatRupiah(cart.total) }}</span>
                    </div>

                    <RouterLink :to="{ name: 'checkout', query: { source: 'cart' } }"
                        class="mt-6 flex w-full justify-center rounded-xl bg-primary-700 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-800">
                        Lanjut ke checkout
                    </RouterLink>
                    <RouterLink to="/products"
                        class="mt-3 flex w-full justify-center rounded-xl border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-50">
                        Tambah produk lain
                    </RouterLink>
                </aside>
            </div>
        </section>
    </MainLayout>
</template>