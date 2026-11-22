<script setup>
import { Leaf, ChefHat, PaintBucket, Wrench, Palette } from "lucide-vue-next";

const units = [
    {
        code: "ATPH",
        name: "Agribisnis Tanaman Pangan dan Hortikultura",
        icon: Leaf,
        items: ["Bibit tanaman", "Sayuran dan buah", "Tanaman hias", "Hasil pertanian", "Pupuk dan media tanam", "Jasa pertanian"],
    },
    {
        code: "APHP",
        name: "Agribisnis Pengolahan Hasil Pertanian",
        icon: ChefHat,
        items: ["Makanan olahan", "Minuman olahan", "Roti dan kue", "Makanan ringan", "Produk kemasan", "Jasa pengolahan makanan"],
    },
    {
        code: "TBKR",
        name: "Teknik Bodi Kendaraan Ringan",
        icon: PaintBucket,
        items: ["Pengecatan kendaraan", "Perbaikan bodi", "Ketok magic", "Poles kendaraan", "Modifikasi bodi", "Perbaikan kerusakan kendaraan"],
    },
    {
        code: "TKR",
        name: "Teknik Kendaraan Ringan",
        icon: Wrench,
        items: ["Servis berkala", "Ganti oli", "Tune up", "Perbaikan mesin", "Perbaikan rem", "Pemeriksaan kendaraan"],
    },
    {
        code: "DKV",
        name: "Desain Komunikasi Visual",
        icon: Palette,
        items: ["Desain logo", "Desain poster", "Desain banner", "Fotografi", "Videografi", "Editing video", "Desain kemasan", "Percetakan"],
    },
];
</script>

<template>
    <section id="unit">
        <div class="@container">
            <div class="text-center">
                <p class="text-[11px] font-bold uppercase tracking-wide text-primary-600">Unit Produksi</p>
                <h2 class="mt-2 text-2xl font-extrabold tracking-tight text-neutral-900 @2xl:text-3xl">
                    Lima Jurusan, Satu Teaching Factory
                </h2>
                <p class="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-neutral-500">
                    Produk dan jasa dikerjakan siswa dari lima kompetensi keahlian SMKN 1 Purwosari.
                </p>
            </div>

            <div class="mt-8 grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
                <RouterLink v-for="u in units" :key="u.code" :to="{ name: 'products', query: { unit: u.code } }"
                    class="group flex flex-col rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
                    <div class="flex items-center gap-3">
                        <div
                            class="flex size-10 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                            <component :is="u.icon" class="size-5" />
                        </div>
                        <span
                            class="rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-[11px] font-bold text-primary-700">
                            {{ u.code }}
                        </span>
                    </div>
                    <h3 class="mt-4 text-base font-extrabold leading-snug text-neutral-900">{{ u.name }}</h3>
                    <ul class="mt-4 flex flex-wrap gap-1.5">
                        <li v-for="i in u.items" :key="i"
                            class="rounded-full bg-neutral-100 px-2.5 py-1 text-[12px] text-neutral-600">
                            {{ i }}
                        </li>
                    </ul>
                </RouterLink>
            </div>
        </div>
    </section>
</template>