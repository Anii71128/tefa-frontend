<script setup>
import { useRouter } from "vue-router";
import { ArrowLeft, Check, ClipboardList, Factory, ChefHat, ShieldCheck, Share2, Rocket, } from "lucide-vue-next";
import MainLayout from "../components/layouts/MainLayout.vue";
import { useAuthStore } from "../stores/auth";
import { useLoginPrompt } from "../composables/useLoginPrompt";
import photo from "../assets/about-tefa.jpg";

const router = useRouter();
const auth = useAuthStore();
const { show } = useLoginPrompt();

const stages = [
    {
        icon: ClipboardList,
        title: "Perencanaan dan Penyamaan Persepsi",
        items: [
            {
                title: "Sosialisasi & Koordinasi",
                desc: "Sekolah mensosialisasikan program kepada seluruh warga sekolah dan menyamakan persepsi TeFa bersama manajemen, guru, hingga sekolah jejaring.",
            },
            {
                title: "Analisis Potensi & Mitra DUDI",
                desc: "Menentukan produk barang atau jasa unggulan bersama Mitra Dunia Usaha/Dunia Industri (DUDI).",
            },
            {
                title: "Penyusunan Perangkat",
                desc: "Menyiapkan modul ajar, jobsheet, Standar Operasional Prosedur (SOP), dan jadwal blok pembelajaran.",
            },
        ],
    },
    {
        icon: Factory,
        title: "Penataan Bengkel dan Sumber Daya",
        items: [
            {
                title: "Kondisioning Standar Industri",
                desc: "Menata laboratorium atau bengkel praktik agar suasana, tata letak, dan disiplin kerjanya menyerupai lantai produksi industri.",
            },
            {
                title: "Kesiapan Alat dan Bahan",
                desc: "Memastikan alat, mesin, dan bahan baku mencukupi untuk proyek atau pesanan yang akan dikerjakan.",
            },
        ],
    },
    {
        icon: ChefHat,
        title: "Pembelajaran dan Produksi Berbasis Pesanan",
        items: [
            {
                title: "Penerimaan & Analisis Order",
                desc: "Siswa menerima order dari konsumen, sekolah, atau mitra industri, lalu menganalisis spesifikasi kebutuhannya.",
            },
            {
                title: "Briefing & K3",
                desc: "Guru atau instruktur memberi pengarahan tentang SOP kerja serta Keselamatan dan Kesehatan Kerja (K3).",
            },
            {
                title: "Eksekusi Produksi atau Jasa",
                desc: "Siswa mengerjakan produk atau layanan secara langsung (learning by doing) dengan guru sebagai konsultan dan asesor.",
            },
        ],
    },
    {
        icon: ShieldCheck,
        title: "Pengendalian Mutu dan Penyerahan",
        items: [
            {
                title: "Evaluasi & Pengujian",
                desc: "Tim kendali mutu memeriksa kualitas, kelayakan, dan kesesuaian produk dengan standar.",
            },
            {
                title: "Serah Terima",
                desc: "Hasil produk atau jasa diserahkan kepada pemesan atau pelanggan.",
            },
            {
                title: "Layanan Purna Jual",
                desc: "Umpan balik pelanggan dievaluasi dan perbaikan dilakukan bila diperlukan.",
            },
        ],
    },
    {
        icon: Share2,
        title: "Pengimbasan dan Evaluasi Berkelanjutan",
        items: [
            {
                title: "Program Pengimbasan",
                desc: "Sebagai sekolah pengimbas TeFa, SMKN 1 Purwosari membagikan praktik baik manajemen dan sistem pembelajaran kepada SMK jejaring.",
            },
            {
                title: "Refleksi & Pelaporan",
                desc: "Mengevaluasi capaian kompetensi siswa serta akuntabilitas pengelolaan program.",
            },
        ],
    },
];

function onOrder() {
    if (!auth.isLoggedIn) {
        return show("Untuk memesan produk, silakan masuk ke akun Anda terlebih dahulu.");
    }
    router.push("/products");
}
</script>

<template>
    <MainLayout>
        <section class="@container rounded-3xl border border-neutral-200 bg-white p-5 sm:p-8 @4xl:p-10">
            <RouterLink to="/"
                class="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 transition-colors hover:text-primary-700">
                <ArrowLeft class="size-4" />
                Kembali ke Beranda
            </RouterLink>

            <div class="mt-6 grid items-center gap-8 @3xl:grid-cols-[1.35fr_1fr] @3xl:gap-10">
                <div>
                    <span
                        class="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-primary-700">
                        <span class="size-1.5 rounded-full bg-primary-600"></span>
                        Alur Kerja TEFA
                    </span>

                    <h1
                        class="mt-5 text-balance text-3xl font-extrabold leading-[1.1] tracking-tight text-neutral-900 @2xl:text-4xl">
                        Alur Kerja Teaching Factory SMKN 1 Purwosari
                    </h1>

                    <p class="mt-5 max-w-lg text-base leading-relaxed text-neutral-600">
                        Dari perencanaan hingga pengimbasan, setiap tahap dirancang agar siswa belajar
                        langsung melalui produksi nyata dengan standar kerja dunia usaha dan dunia industri.
                    </p>

                    <ul class="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                        <li class="flex items-center gap-2 text-sm text-neutral-700">
                            <Check class="size-4 text-primary-600" /> 5 Tahap Terstruktur
                        </li>
                        <li class="flex items-center gap-2 text-sm text-neutral-700">
                            <Check class="size-4 text-primary-600" /> Berbasis Pesanan Nyata
                        </li>
                        <li class="flex items-center gap-2 text-sm text-neutral-700">
                            <Check class="size-4 text-primary-600" /> Melibatkan Mitra DUDI
                        </li>
                    </ul>
                </div>

                <div class="relative overflow-hidden rounded-2xl shadow-xl">
                    <img :src="photo" alt="Siswa SMKN 1 Purwosari berpraktik produksi"
                        class="aspect-[4/3] w-full object-cover object-center" />
                    <div
                        class="absolute inset-x-3 bottom-3 flex items-center gap-3 rounded-xl bg-white/95 p-2.5 shadow-lg">
                        <div
                            class="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                            <Check class="size-5" />
                        </div>
                        <div class="leading-tight">
                            <p class="text-[13px] font-bold text-neutral-900">Learning by Doing</p>
                            <p class="text-[11px] text-neutral-500">Dibimbing guru sebagai konsultan dan asesor</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section id="alur-kerja" class="@container">
            <div class="text-center">
                <p class="text-[11px] font-bold uppercase tracking-wide text-primary-600">Tahapan Kerja</p>
                <h2 class="mt-2 text-2xl font-extrabold tracking-tight text-neutral-900 @2xl:text-3xl">
                    Lima Tahap Teaching Factory
                </h2>
                <p class="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-neutral-500">
                    Setiap tahap saling berkesinambungan, dari persiapan hingga evaluasi berkelanjutan.
                </p>
            </div>

            <div class="mt-8 grid gap-5 @3xl:grid-cols-2 @6xl:grid-cols-3">
                <article v-for="(stage, i) in stages" :key="stage.title"
                    class="flex flex-col rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <div class="flex items-center justify-between">
                        <span
                            class="rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-[11px] font-semibold text-primary-700">
                            Tahap {{ i + 1 }}
                        </span>
                    </div>

                    <div
                        class="mt-4 flex size-10 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                        <component :is="stage.icon" class="size-5" />
                    </div>

                    <h3 class="mt-4 text-lg font-extrabold leading-snug text-neutral-900">{{ stage.title }}</h3>

                    <ul class="mt-4 space-y-3 border-t border-neutral-200 pt-4">
                        <li v-for="item in stage.items" :key="item.title" class="flex gap-2.5">
                            <Check class="mt-0.5 size-4 shrink-0 text-primary-600" />
                            <div class="leading-snug">
                                <p class="text-sm font-bold text-neutral-900">{{ item.title }}</p>
                                <p class="mt-0.5 text-[13px] text-neutral-500">{{ item.desc }}</p>
                            </div>
                        </li>
                    </ul>
                </article>
            </div>
        </section>

        <section class="@container rounded-3xl border border-primary-200 bg-primary-50 p-6 text-center sm:p-10">
            <span
                class="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-primary-700">
                <Rocket class="size-3.5" />
                Dukung Talenta Vokasi
            </span>

            <h2
                class="mx-auto mt-5 max-w-2xl text-balance text-2xl font-extrabold leading-tight tracking-tight text-neutral-900 @2xl:text-4xl">
                Mulai Pesan Produk Hasil Karya Siswa
            </h2>
            <p class="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-neutral-600">
                Bantu kembangkan potensi nyata siswa kejuruan dengan memercayakan kebutuhan Anda
                kepada Teaching Factory kami.
            </p>

            <div class="mt-6 flex flex-col justify-center gap-3 min-[420px]:flex-row">
                <button
                    class="rounded-xl bg-primary-700 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-800"
                    @click="onOrder">
                    Pesan Sekarang
                </button>
                <RouterLink to="/products"
                    class="rounded-xl border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-neutral-800 transition-colors duration-200 hover:bg-neutral-50">
                    Lihat Katalog
                </RouterLink>
            </div>
        </section>
    </MainLayout>
</template>