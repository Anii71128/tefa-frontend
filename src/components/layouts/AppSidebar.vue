<script setup>
import { RouterLink, useRoute, useRouter } from "vue-router";
import { House, LayoutGrid, ClipboardList, CreditCard, ChevronsLeft, Lock } from "lucide-vue-next";
import { useAuthStore } from "../../stores/auth";
import { useLoginPrompt } from "../../composables/useLoginPrompt";
import logo from "../../assets/logo-tefa.png";

const collapsed = defineModel("collapsed", { default: false });
const mobileOpen = defineModel("mobileOpen", { default: false });

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const { show } = useLoginPrompt();

const menus = [
  { label: "Home", to: "/", icon: House },
  { label: "Katalog", to: "/products", icon: LayoutGrid },
  { label: "Pesanan Saya", to: "/orders", icon: ClipboardList, auth: true, msg: "Silakan masuk untuk melihat riwayat pesanan Anda.", },
  { label: "Pembayaran", to: "/checkout", icon: CreditCard, auth: true, msg: "Silakan masuk untuk melanjutkan ke proses pembayaran.", },
];

const isActive = (to) => (to === "/" ? route.path === "/" : route.path.startsWith(to));
const isLocked = (menu) => menu.auth && !auth.isLoggedIn;

function onClick(menu) {
  if (isLocked(menu)) return show(menu.msg);
  mobileOpen.value = false;
  router.push(menu.to);
}
</script>

<template>
  <div v-if="mobileOpen" class="fixed inset-0 z-40 bg-neutral-950/50 md:hidden" @click="mobileOpen = false"></div>

  <aside :class="[
    collapsed ? 'md:w-18' : 'md:w-64',
    mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
  ]"
    class="fixed inset-y-0 left-0 z-50 h-screen w-64 shrink-0 border-r border-neutral-200 bg-white transition-[width,transform] duration-300 ease-in-out md:sticky md:top-0 md:z-40">
    <button
      class="absolute -right-3 top-7 z-50 hidden size-6 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 shadow-sm transition-colors hover:text-neutral-900 md:flex"
      :title="collapsed ? 'Buka sidebar' : 'Tutup sidebar'" @click="collapsed = !collapsed">
      <ChevronsLeft class="size-3.5 transition-transform duration-300" :class="collapsed ? 'rotate-180' : ''" />
    </button>

    <div class="flex h-full flex-col overflow-hidden">
      <div class="px-4 pb-4 pt-5">
        <RouterLink to="/" class="flex h-10 items-center gap-2.5" @click="mobileOpen = false">
          <img :src="logo" alt="Logo TEFA" class="size-10 min-w-10 shrink-0 object-contain" />
          <div :class="collapsed ? 'md:opacity-0' : ''"
            class="whitespace-nowrap leading-tight transition-opacity duration-300">
            <p class="text-xl font-extrabold text-neutral-900">TEFA</p>
            <p class="text-[10px] font-medium uppercase text-neutral-500">SMKN 1 Purwosari</p>
          </div>
        </RouterLink>
      </div>

      <div class="mx-4 border-t border-neutral-200"></div>

      <nav class="flex-1 px-4 pt-5">
        <p :class="collapsed ? 'md:opacity-0' : ''"
          class="mb-3 h-4 whitespace-nowrap px-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 transition-opacity duration-300">
          Navigasi Utama
        </p>

        <ul class="space-y-1">
          <li v-for="menu in menus" :key="menu.to">
            <button :class="isActive(menu.to)
                ? 'border-primary-300 bg-primary-100 font-semibold text-primary-800 shadow-sm'
                : 'border-transparent bg-transparent text-neutral-600 hover:bg-neutral-100'
              " class="flex h-10.5 w-full items-center gap-3 rounded-xl border px-[9px] text-sm transition-colors"
              :title="collapsed ? menu.label : ''" @click="onClick(menu)">
              <component :is="menu.icon" :class="isActive(menu.to) ? 'text-primary-700' : 'text-neutral-400'"
                class="size-5 shrink-0" />
              <span :class="collapsed ? 'md:opacity-0' : ''"
                class="flex-1 whitespace-nowrap text-left transition-opacity duration-300">
                {{ menu.label }}
              </span>
              <Lock v-if="isLocked(menu)" :class="collapsed ? 'md:opacity-0' : ''"
                class="size-3.5 shrink-0 text-neutral-400 transition-opacity duration-300" />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </aside>
</template>