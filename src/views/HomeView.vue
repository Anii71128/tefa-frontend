<template>
  <main class="min-h-screen bg-gray-50">
    <!-- Navbar -->
    <header class="border-b border-gray-100 bg-white">
      <nav
        class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4"
      >
        <RouterLink to="/" class="flex items-center gap-3">
          <div
            class="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-700 text-lg font-bold text-white"
          >
            T
          </div>

          <div>
            <h1 class="text-lg font-bold text-gray-900">TEFA</h1>
            <p class="text-xs text-gray-500">Teaching Factory</p>
          </div>
        </RouterLink>

        <div class="flex items-center gap-5">
          <RouterLink to="/" class="text-sm font-semibold text-emerald-700">
            Beranda
          </RouterLink>

          <RouterLink
            to="/products"
            class="text-sm font-medium text-gray-600 transition hover:text-emerald-700"
          >
            Katalog
          </RouterLink>

          <RouterLink
            to="/login"
            class="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            Masuk
          </RouterLink>
        </div>
      </nav>
    </header>

    <!-- Hero -->
    <section
      class="mx-auto flex max-w-7xl flex-col items-center gap-10 px-6 py-20 md:flex-row md:py-28"
    >
      <div class="flex-1">
        <span
          class="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800"
        >
          Teaching Factory Sekolah
        </span>

        <h2
          class="mt-6 max-w-2xl text-4xl font-bold leading-tight tracking-tight text-gray-900 md:text-6xl"
        >
          Belajar, Berkarya, dan
          <span class="text-emerald-700">Menghasilkan Karya Nyata.</span>
        </h2>

        <p class="mt-6 max-w-xl text-base leading-8 text-gray-600">
          Platform Teaching Factory sekolah untuk mengenalkan produk, mendukung
          pembelajaran berbasis industri, dan menghubungkan karya siswa dengan
          kebutuhan masyarakat.
        </p>

        <div class="mt-8 flex flex-wrap gap-4">
          <RouterLink
            to="/products"
            class="rounded-xl bg-emerald-700 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
          >
            Jelajahi Katalog
          </RouterLink>

          <RouterLink
            to="/login"
            class="rounded-xl border border-gray-300 bg-white px-6 py-3.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            Masuk ke Sistem
          </RouterLink>
        </div>

        <div class="mt-10 flex flex-wrap gap-8">
          <div>
            <p class="text-2xl font-bold text-gray-900">Kreatif</p>
            <p class="mt-1 text-sm text-gray-500">Karya siswa</p>
          </div>

          <div>
            <p class="text-2xl font-bold text-gray-900">Produktif</p>
            <p class="mt-1 text-sm text-gray-500">Pembelajaran nyata</p>
          </div>

          <div>
            <p class="text-2xl font-bold text-gray-900">Kolaboratif</p>
            <p class="mt-1 text-sm text-gray-500">Sekolah dan industri</p>
          </div>
        </div>
      </div>

      <!-- Hero Illustration -->
      <div class="w-full flex-1">
        <div
          class="relative overflow-hidden rounded-3xl bg-emerald-800 p-8 text-white shadow-xl md:p-12"
        >
          <div
            class="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-emerald-600 opacity-60"
          ></div>

          <div
            class="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-emerald-600 opacity-40"
          ></div>

          <div class="relative">
            <div
              class="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-3xl"
            >
              ✦
            </div>

            <p class="mt-10 text-sm font-medium text-emerald-100">
              LEARNING BY DOING
            </p>

            <h3 class="mt-3 text-3xl font-bold leading-snug md:text-4xl">
              Dari ruang belajar menuju dunia industri.
            </h3>

            <p class="mt-4 max-w-sm text-sm leading-7 text-emerald-100">
              Mengembangkan kompetensi melalui praktik, produksi, pengujian
              kualitas, dan pelayanan pelanggan.
            </p>

            <div class="mt-8 rounded-2xl bg-white p-5 text-gray-900">
              <p class="text-sm font-semibold text-gray-500">SISTEM TEFA</p>
              <p class="mt-2 text-lg font-bold">
                Satu platform, banyak peluang.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Informasi -->
    <section class="border-t border-gray-100 bg-white">
      <div class="mx-auto max-w-7xl px-6 py-16">
        <div class="max-w-2xl">
          <p
            class="text-sm font-semibold uppercase tracking-widest text-emerald-700"
          >
            Mengenal TEFA
          </p>

          <h2 class="mt-3 text-3xl font-bold text-gray-900">
            Pembelajaran yang terhubung dengan dunia kerja
          </h2>

          <p class="mt-4 leading-7 text-gray-600">
            Teaching Factory menggabungkan proses belajar dengan praktik
            produksi atau layanan sesuai standar dunia industri. Siswa belajar
            mengembangkan keterampilan melalui pengalaman nyata.
          </p>
        </div>

        <div class="mt-10 flex flex-col gap-5 md:flex-row">
          <article class="flex-1 rounded-2xl border border-gray-200 p-6">
            <div class="text-2xl">📚</div>
            <h3 class="mt-4 text-lg font-bold text-gray-900">
              Pembelajaran Praktis
            </h3>
            <p class="mt-2 text-sm leading-6 text-gray-600">
              Mendukung siswa dalam menerapkan kompetensi sesuai bidang keahlian
              masing-masing.
            </p>
          </article>

          <article class="flex-1 rounded-2xl border border-gray-200 p-6">
            <div class="text-2xl">🛠️</div>
            <h3 class="mt-4 text-lg font-bold text-gray-900">
              Proses Produksi
            </h3>
            <p class="mt-2 text-sm leading-6 text-gray-600">
              Menghubungkan perencanaan, pengerjaan, dan pemeriksaan kualitas
              dalam satu alur.
            </p>
          </article>

          <article class="flex-1 rounded-2xl border border-gray-200 p-6">
            <div class="text-2xl">🤝</div>
            <h3 class="mt-4 text-lg font-bold text-gray-900">Kolaborasi</h3>
            <p class="mt-2 text-sm leading-6 text-gray-600">
              Mendorong kerja sama antara siswa, guru, sekolah, dan pelanggan.
            </p>
          </article>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 px-6 py-8 text-center text-sm text-gray-400">
      <p>© {{ new Date().getFullYear() }} TEFA Management.</p>
      <p class="mt-2">Teaching Factory Sekolah</p>
    </footer>
  </main>
</template>
