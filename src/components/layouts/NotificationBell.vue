<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Bell, BellOff, CheckCheck } from "lucide-vue-next";
import { useNotificationStore } from "../../stores/notifications";

const router = useRouter();
const notif = useNotificationStore();

const open = ref(false);
const root = ref(null);
let timer = null;

const dot = {
  success: "bg-primary-600",
  danger: "bg-red-500",
  warning: "bg-amber-500",
  info: "bg-blue-500",
};

function timeAgo(iso) {
  const minutes = Math.floor(Math.max(0, Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(iso));
}

function toggle() {
  open.value = !open.value;
  if (open.value) notif.refresh();
}

function openItem(n) {
  notif.markRead(n.id);
  open.value = false;
  router.push({ name: "orders" });
}

const onPointerDown = (e) => {
  if (open.value && !root.value?.contains(e.target)) open.value = false;
};
const onKey = (e) => {
  if (e.key === "Escape") open.value = false;
};
const onVisible = () => {
  if (document.visibilityState === "visible") notif.refresh();
};

onMounted(() => {
  notif.refresh();
  timer = setInterval(onVisible, 60000);
  document.addEventListener("pointerdown", onPointerDown);
  document.addEventListener("keydown", onKey);
  document.addEventListener("visibilitychange", onVisible);
});

onBeforeUnmount(() => {
  clearInterval(timer);
  document.removeEventListener("pointerdown", onPointerDown);
  document.removeEventListener("keydown", onKey);
  document.removeEventListener("visibilitychange", onVisible);
});
</script>

<template>
  <div ref="root" class="relative">
    <button type="button" aria-haspopup="true" :aria-expanded="open"
      :aria-label="notif.unreadCount ? `Notifikasi, ${notif.unreadCount} belum dibaca` : 'Notifikasi'"
      class="relative flex size-10 items-center justify-center rounded-full text-neutral-500 outline-none transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-primary-200"
      @click="toggle">
      <Bell class="size-5" />
      <span v-if="notif.unreadCount"
        class="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
        {{ notif.unreadCount > 9 ? "9+" : notif.unreadCount }}
      </span>
    </button>

    <div v-if="open"
      class="fixed inset-x-3 top-16 z-50 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96">
      <header class="flex items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3">
        <h2 class="text-sm font-extrabold text-neutral-900">Notifikasi</h2>
        <button v-if="notif.unreadCount" type="button"
          class="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 transition-colors hover:text-primary-800"
          @click="notif.markAllRead()">
          <CheckCheck class="size-4" />
          Tandai semua dibaca
        </button>
      </header>

      <ul v-if="notif.items.length" class="max-h-96 divide-y divide-neutral-100 overflow-y-auto">
        <li v-for="n in notif.items" :key="n.id">
          <button type="button"
            class="flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-50"
            :class="n.read ? '' : 'bg-primary-50/60'" @click="openItem(n)">
            <span class="mt-1.5 size-2 shrink-0 rounded-full" :class="n.read ? 'bg-neutral-300' : dot[n.type]"></span>
            <span class="min-w-0 flex-1">
              <span class="block text-sm font-semibold text-neutral-900">{{ n.title }}</span>
              <span class="mt-0.5 block text-[13px] leading-snug text-neutral-600">{{ n.text }}</span>
              <span class="mt-1 block text-xs text-neutral-400">{{ timeAgo(n.createdAt) }}</span>
            </span>
          </button>
        </li>
      </ul>

      <div v-else class="px-6 py-10 text-center">
        <BellOff class="mx-auto size-8 text-neutral-300" />
        <p class="mt-3 text-sm font-semibold text-neutral-800">Belum ada notifikasi</p>
        <p class="mt-1 text-xs text-neutral-500">
          Kabar persetujuan dan pembayaran pesanan Anda akan muncul di sini.
        </p>
      </div>
    </div>
  </div>
</template>