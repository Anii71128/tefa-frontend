<script setup>
import { Star } from "lucide-vue-next";

const gridClass = "grid-cols-1 @xl:grid-cols-2 @4xl:grid-cols-3 @6xl:grid-cols-4";
const fourthClass = "hidden @6xl:block";

const items = [
    {
        quote: "Roti dan kuenya enak, kemasannya rapi, dan pesanan tiba sesuai jadwal. Cocok untuk acara kantor kami.",
        name: "Bpk. Contoh Satu",
        role: "Pelanggan Instansi",
    },
    {
        quote: "Pemesanan mudah dan hasilnya higienis. Rasanya tidak kalah dengan toko roti pada umumnya.",
        name: "Ibu Contoh Dua",
        role: "Pemilik Usaha Kecil",
    },
    {
        quote: "Senang bisa mendukung siswa sambil mendapat produk berkualitas. Prosesnya pun transparan.",
        name: "Contoh Tiga",
        role: "Pelanggan Perorangan",
    },
    {
        quote: "Pesanan untuk acara sekolah kami dikerjakan rapi dan tepat waktu. Siswanya juga ramah.",
        name: "Ibu Contoh Empat",
        role: "Panitia Kegiatan",
    },
];

const initials = (name) =>
    name
        .replace(/^(Bpk\.|Ibu)\s*/, "")
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
</script>

<template>
    <section class="@container">
        <div class="text-center">
            <p class="text-[11px] font-bold uppercase tracking-wide text-primary-600">
                Kepercayaan Pelanggan
            </p>
            <h2 class="mt-2 text-2xl font-extrabold tracking-tight text-neutral-900 @2xl:text-3xl">
                Apa Kata Pengguna Produk TEFA?
            </h2>
            <p class="mx-auto mt-3 max-w-xl text-sm text-neutral-500">
                Komitmen kualitas nyata yang dirasakan oleh para pelanggan kami.
            </p>
        </div>

        <div :class="gridClass" class="mt-8 grid gap-5">
            <figure v-for="(t, i) in items" :key="t.name" :class="i === 3 ? fourthClass : ''"
                class="flex flex-col rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div class="flex gap-0.5 text-warning-500">
                    <Star v-for="n in 5" :key="n" class="size-4 fill-current" />
                </div>
                <blockquote class="mt-4 flex-1 text-[13px] italic leading-relaxed text-neutral-600">
                    "{{ t.quote }}"
                </blockquote>
                <figcaption class="mt-5 flex items-center gap-3 border-t border-neutral-200 pt-4">
                    <div
                        class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                        {{ initials(t.name) }}
                    </div>
                    <div class="leading-tight">
                        <p class="text-sm font-bold text-neutral-900">{{ t.name }}</p>
                        <p class="text-[11px] text-neutral-500">{{ t.role }}</p>
                    </div>
                </figcaption>
            </figure>
        </div>
    </section>
</template>