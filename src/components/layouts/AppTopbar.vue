<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { Search, CircleHelp, Menu } from "lucide-vue-next";
import UserMenu from "./UserMenu.vue";
import NotificationBell from "./NotificationBell.vue";
import { useAuthStore } from "../../stores/auth";

defineEmits(["open-menu"]);

const auth = useAuthStore();
const router = useRouter();

const keyword = ref("");
const searchInput = ref(null);
const shortcutLabel = ref("Ctrl K");

function onSearch() {
    const q = keyword.value.trim();
    if (!q) return;
    router.push({ name: "products", query: { q } });
}

function onKeydown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInput.value?.focus();
    }
}

onMounted(() => {
    const isApple = /Mac|iPhone|iPad/i.test(navigator.userAgent);
    shortcutLabel.value = isApple ? "⌘K" : "Ctrl K";
    window.addEventListener("keydown", onKeydown);
});

onUnmounted(() => window.removeEventListener("keydown", onKeydown));
</script>

<template>
    <header
        class="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 md:px-8">
        <button class="shrink-0 text-neutral-600 md:hidden" aria-label="Buka menu" @click="$emit('open-menu')">
            <Menu class="size-6" />
        </button>

        <div
            class="flex h-9 w-full max-w-md items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3">
            <Search class="size-4 shrink-0 text-neutral-400" />
            <input ref="searchInput" v-model="keyword" type="text" placeholder="Cari produk atau layanan..."
                class="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
                @keyup.enter="onSearch" />
            <kbd
                class="hidden shrink-0 whitespace-nowrap rounded bg-white ps-1.5 py-0.5 font-sans text-[10px] font-medium text-neutral-500 sm:inline-block">
                {{ shortcutLabel }}
            </kbd>
        </div>

        <div class="flex items-center gap-2 sm:gap-3">
            <template v-if="auth.isLoggedIn">
                <NotificationBell />
                <button type="button"
                    class="flex size-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800"
                    aria-label="Bantuan">
                    <CircleHelp class="size-5" />
                </button>

                <UserMenu />
            </template>

            <template v-else>
                <button type="button"
                    class="flex size-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800"
                    aria-label="Bantuan">
                    <CircleHelp class="size-5" />
                </button>
                <RouterLink to="/login"
                    class="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50">
                    Masuk</RouterLink>
                <RouterLink to="/register"
                    class="rounded-xl bg-primary-700 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800">
                    Daftar</RouterLink>
            </template>
        </div>
    </header>
</template>