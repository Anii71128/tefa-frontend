<script setup>
import { computed, ref } from "vue";
import { ChevronDown, MessageCircle, Search, SearchX } from "lucide-vue-next";
import MainLayout from "../components/layouts/MainLayout.vue";

const waNumber = import.meta.env.VITE_WA_NUMBER;
const waLink = computed(() =>
    waNumber
        ? `https://wa.me/${waNumber}?text=${encodeURIComponent("Halo, saya ingin bertanya tentang produk TEFA SMKN 1 Purwosari.")}`
        : null,
);

const groups = [
    {
        title: "Memesan produk",
        items: [
            {
                q: "Apa itu Teaching Factory (TEFA)?",
                a: "Teaching Factory adalah model pembelajaran kejuruan berbasis produksi dan jasa nyata. Siswa SMKN 1 Purwosari mengerjakan produk dan layanan di bawah bimbingan guru produktif, dengan standar kerja dunia usaha dan dunia industri.",
            },
            {
                q: "Apakah saya harus punya akun untuk memesan?",
                a: "Katalog dan detail produk bisa dilihat tanpa akun. Untuk menambahkan produk ke draft pesanan, memesan, dan membayar, Anda perlu masuk. Belum punya akun? Pilih Daftar di pojok kanan atas.",
            },
            {
                q: "Bagaimana cara memesan?",
                a: "Pilih produk di katalog, lalu tekan Tambah. Buka Draft Pesanan, pilih Lanjut ke checkout, lalu tekan Lanjutkan pemesanan. Pesanan Anda akan masuk ke menu Pesanan Saya.",
            },
            {
                q: "Apa bedanya Draft pesanan dan Pesanan saya?",
                a: "Draft pesanan berisi produk yang baru Anda pilih dan belum dikirim ke TEFA. Pesanan saya berisi pesanan yang sudah dikirim dan sedang diproses, lengkap dengan statusnya.",
            },
            {
                q: "Produk yang saya inginkan stoknya habis. Bagaimana?",
                a: "Produk dengan stok habis belum bisa dipesan. Hubungi TEFA untuk menanyakan kapan tersedia kembali.",
            },
        ],
    },
    {
        title: "Persetujuan dan pembayaran",
        items: [
            {
                q: "Mengapa pesanan harus disetujui guru dulu?",
                a: "Guru produktif memeriksa kesiapan produksi dan kesesuaian pesanan sebelum pengerjaan dimulai. Pembayaran baru dibuka setelah pesanan disetujui.",
            },
            {
                q: "Bagaimana cara membayar?",
                a: "Setelah status pesanan menjadi Disetujui guru, tombol Bayar sekarang muncul di Pesanan Saya. Pembayaran diproses melalui Midtrans, dan pilihan metodenya tampil di jendela pembayaran.",
            },
            {
                q: "Status pembayaran belum berubah setelah saya membayar.",
                a: "Perubahan status bisa memerlukan beberapa menit. Buka Pesanan Saya lalu tekan Muat ulang. Jika masih belum berubah, hubungi TEFA dan sertakan nomor pesanan Anda.",
            },
            {
                q: "Pesanan saya ditolak. Apa yang harus saya lakukan?",
                a: "Hubungi TEFA untuk mengetahui alasannya. Anda bisa membuat pesanan baru setelah kebutuhannya disesuaikan.",
            },
        ],
    },
    {
        title: "Informasi lainnya",
        items: [
            {
                q: "Bagaimana saya mengetahui perkembangan pesanan?",
                a: "Pantau statusnya di Pesanan Saya. Ikon lonceng di bagian atas juga memberi tahu saat pesanan disetujui, ditolak, diproses, atau selesai, dan saat pembayaran berhasil.",
            },
            {
                q: "Kapan pertanyaan saya dibalas?",
                a: "Respons cepat tersedia pada hari dan jam kerja sekolah, yaitu Senin sampai Jumat pukul 08.00 sampai 15.30 WIB.",
            },
        ],
    },
];

const search = ref("");

const visibleGroups = computed(() => {
    const q = search.value.trim().toLowerCase();
    if (!q) return groups;

    return groups
        .map((g) => ({
            ...g,
            items: g.items.filter((i) => `${i.q} ${i.a}`.toLowerCase().includes(q)),
        }))
        .filter((g) => g.items.length);
});
</script>

<template>
    <MainLayout>
        <section class="@container grid items-start gap-5 lg:grid-cols-[minmax(0,320px)_1fr]">
            <!-- Kolom kiri -->
            <aside class="space-y-4 lg:sticky lg:top-6">
                <div class="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <p class="text-[11px] font-bold uppercase tracking-wide text-primary-600">Bantuan</p>
                    <h1 class="mt-2 text-2xl font-extrabold leading-tight tracking-tight text-neutral-900">
                        Pertanyaan yang sering diajukan
                    </h1>
                    <p class="mt-2 text-sm leading-relaxed text-neutral-500">
                        Jawaban singkat seputar pemesanan, persetujuan, dan pembayaran produk TEFA.
                    </p>

                    <label class="relative mt-5 block">
                        <span class="sr-only">Cari pertanyaan</span>
                        <Search
                            class="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                        <input v-model="search" type="search" placeholder="Cari pertanyaan..."
                            class="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-primary-700 focus:bg-white focus:ring-2 focus:ring-primary-100" />
                    </label>
                </div>

                <div class="rounded-3xl border border-primary-200 bg-primary-50 p-6">
                    <p class="text-sm font-extrabold text-neutral-900">Belum menemukan jawabannya?</p>
                    <p class="mt-1 text-sm leading-relaxed text-neutral-600">
                        Tim TEFA siap membantu pada Senin - Jumat, 08.00 - 15.30 WIB.
                    </p>
                    <a v-if="waLink" :href="waLink" target="_blank" rel="noopener noreferrer"
                        class="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-800">
                        <MessageCircle class="size-4" />
                        Tanya via WhatsApp
                    </a>
                </div>
            </aside>

            <!-- Kolom kanan -->
            <div class="space-y-6">
                <div v-for="group in visibleGroups" :key="group.title">
                    <h2 class="mb-3 px-1 text-sm font-extrabold text-neutral-900">{{ group.title }}</h2>

                    <div
                        class="divide-y divide-neutral-200 overflow-hidden rounded-3xl border border-neutral-200 bg-white">
                        <details v-for="item in group.items" :key="item.q" name="faq" class="group">
                            <summary
                                class="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-semibold text-neutral-900 outline-none transition-colors hover:bg-neutral-50 focus-visible:bg-neutral-50 group-open:text-primary-800 sm:px-6 [&::-webkit-details-marker]:hidden">
                                {{ item.q }}
                                <ChevronDown
                                    class="size-4 shrink-0 text-neutral-400 transition-transform duration-200 group-open:rotate-180 group-open:text-primary-700" />
                            </summary>
                            <p class="max-w-prose px-5 pb-5 text-sm leading-relaxed text-neutral-600 sm:px-6">
                                {{ item.a }}
                            </p>
                        </details>
                    </div>
                </div>

                <!-- Tidak ada hasil -->
                <div v-if="!visibleGroups.length"
                    class="rounded-3xl border border-neutral-200 bg-white p-10 text-center">
                    <SearchX class="mx-auto size-8 text-neutral-300" />
                    <p class="mt-3 text-sm font-semibold text-neutral-900">Pertanyaan tidak ditemukan</p>
                    <p class="mt-1 text-sm text-neutral-500">Coba kata kunci lain, atau hubungi tim TEFA.</p>
                    <button type="button"
                        class="mt-4 rounded-xl border border-neutral-300 px-5 py-2 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-50"
                        @click="search = ''">
                        Hapus pencarian
                    </button>
                </div>
            </div>
        </section>
    </MainLayout>
</template>