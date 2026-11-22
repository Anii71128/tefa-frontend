<script setup>
const stats = [
    { value: "20+", title: "Varian Produk Dibuat", desc: "Diproduksi siswa dengan standar mutu yang terjaga dan siap dipesan." },
    { value: "100+", title: "Pesanan Selesai Tepat Waktu", desc: "Dipercaya pelanggan dari instansi, sekolah, dan perorangan." },
    { value: "50+", title: "Siswa Terlibat Per Semester", desc: "Berlatih langsung di lini produksi nyata bersama guru produktif." },
];
</script>

<template>
    <section class="@container">
        <div class="grid gap-5 @2xl:grid-cols-3">
            <div v-for="s in stats" :key="s.title"
                class="rounded-3xl border border-primary-200 bg-primary-50 p-6 text-center">
                <p class="text-4xl font-extrabold tracking-tight text-neutral-900">{{ s.value }}</p>
                <p class="mt-2 text-sm font-bold text-neutral-900">{{ s.title }}</p>
                <p class="mt-1.5 text-[13px] leading-relaxed text-neutral-500">{{ s.desc }}</p>
            </div>
        </div>
    </section>
</template>