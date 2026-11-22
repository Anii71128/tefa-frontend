<script setup>
import { Check, ArrowRight } from "lucide-vue-next";
import aboutImg from "../../assets/about-tefa.jpg";

const points = [
  {
    title: "Pengalaman Kerja Riil di Lini Produksi",
    desc: "Siswa terbiasa mematuhi jadwal pesanan dan deadline selayaknya teknisi profesional.",
  },
  {
    title: "Fasilitas Praktik yang Memadai",
    desc: "Dapur produksi, oven, mixer, serta area pengemasan yang higienis.",
  },
  {
    title: "Standar Mutu Terjamin",
    desc: "Setiap hasil produksi diperiksa langsung oleh guru produktif sebelum dikirim ke pelanggan.",
  },
];
</script>

<template>
  <section id="tentang-tefa" class="@container rounded-3xl border border-neutral-200 bg-white p-5 sm:p-8 @4xl:p-10">
    <div class="grid gap-8 @3xl:grid-cols-2 @3xl:gap-10">
      <div class="relative min-h-72 overflow-hidden rounded-2xl shadow-xl @3xl:min-h-full">
        <img :src="aboutImg" alt="Siswa APHP SMKN 1 Purwosari memproduksi roti"
          class="absolute inset-0 size-full object-cover object-center" />

        <div
          class="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-xl bg-white/95 p-3 shadow-lg">
          <div class="leading-tight">
            <p class="text-[13px] font-bold text-neutral-900">Praktik Presisi & Standar Industri</p>
            <p class="mt-0.5 text-[11px] text-neutral-500">Kurikulum berbasis link and match industri</p>
          </div>
          <span class="shrink-0 rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-semibold text-neutral-700">
            SMK Bisa
          </span>
        </div>
      </div>

      <div class="flex flex-col justify-center">
        <p class="text-[11px] font-bold uppercase tracking-wide text-primary-600">
          Mengenal Teaching Factory
        </p>

        <h2 class="mt-2 text-balance text-2xl font-extrabold leading-tight tracking-tight text-neutral-900 @2xl:text-3xl">
          Apa itu Teaching Factory (TEFA)?
        </h2>

        <p class="mt-4 text-[15px] leading-relaxed text-neutral-600">
          Teaching Factory adalah model pembelajaran kejuruan berbasis produksi dan jasa nyata yang
          mengacu pada standar alur kerja industri modern. Siswa SMKN 1 Purwosari dilatih langsung
          untuk memproduksi barang bernilai komersial tinggi.
        </p>

        <ul class="mt-6 space-y-4">
          <li v-for="point in points" :key="point.title" class="flex gap-3">
            <div class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
              <Check class="size-4" />
            </div>
            <div class="leading-snug">
              <p class="text-sm font-bold text-neutral-900">{{ point.title }}</p>
              <p class="mt-0.5 text-[13px] text-neutral-500">{{ point.desc }}</p>
            </div>
          </li>
        </ul>

        <RouterLink to="/alur-kerja"
          class="mt-7 inline-flex w-fit items-center gap-2 rounded-xl border border-primary-600 bg-white px-5 py-2.5 text-sm font-semibold text-primary-700 transition-colors duration-200 hover:bg-primary-50">
          Pelajari Alur Kerja TEFA
          <ArrowRight class="size-4" />
        </RouterLink>
      </div>
    </div>
  </section>
</template>