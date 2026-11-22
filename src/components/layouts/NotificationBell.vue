<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { Bell } from "lucide-vue-next";

const notifications = ref([]);

const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length);

const open = ref(false);
const root = ref(null);

function onDocumentClick(event) {
    if (root.value && !root.value.contains(event.target)) open.value = false;
}
function onKeydown(event) {
    if (event.key === "Escape") open.value = false;
}

onMounted(() => {
    document.addEventListener("click", onDocumentClick);
    document.addEventListener("keydown", onKeydown);
});
onBeforeUnmount(() => {
    document.removeEventListener("click", onDocumentClick);
    document.removeEventListener("keydown", onKeydown);
});
</script>

<template>
    <div ref="root" class="relative flex items-center">
        <button type="button"
            class="relative flex size-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800"
            aria-label="Notifikasi" aria-haspopup="menu" :aria-expanded="open" @click="open = !open">
            <Bell class="size-5" />
            <span v-if="unreadCount > 0" class="absolute right-2 top-2 size-2 rounded-full bg-success-600"></span>
        </button>

        <div v-if="open"
            class="fixed inset-x-4 top-[4.25rem] z-50 rounded-2xl border border-neutral-200 bg-white shadow-lg sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 sm:w-80">
            <div class="border-b border-neutral-200 px-4 py-3">
                <p class="text-sm font-semibold text-neutral-900">Notifikasi</p>
            </div>

            <ul v-if="notifications.length" class="max-h-80 divide-y divide-neutral-100 overflow-y-auto">
                <li v-for="item in notifications" :key="item.id" class="px-4 py-3"
                    :class="item.read ? '' : 'bg-primary-50'">
                    <p class="text-sm font-semibold text-neutral-900">{{ item.title }}</p>
                    <p class="mt-0.5 text-xs text-neutral-500">{{ item.body }}</p>
                    <p class="mt-1 text-[11px] text-neutral-400">{{ item.time }}</p>
                </li>
            </ul>

            <div v-else class="flex flex-col items-center gap-2 px-4 py-8 text-center">
                <span class="flex size-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                    <Bell class="size-5" />
                </span>
                <p class="text-sm font-medium text-neutral-700">Belum ada notifikasi</p>
                <p class="text-xs text-neutral-500">Kabar tentang pesanan dan pembayaranmu akan muncul di sini.</p>
            </div>
        </div>
    </div>
</template>