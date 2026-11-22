<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ChevronDown, LayoutDashboard, LogOut, User } from "lucide-vue-next";
import { useAuthStore } from "../../stores/auth";
import { redirectToBackend } from "../../utils/roles";
import UserAvatar from "./UserAvatar.vue";
import EditProfileModal from "./EditProfileModal.vue";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const showStatusDot = false;

const open = ref(false);
const editOpen = ref(false);
const loggingOut = ref(false);
const root = ref(null);

const roleLabels = { user: "Pembeli", siswa: "Siswa", guru: "Guru", admin: "Admin" };
const role = computed(() => auth.user?.role);
const roleLabel = computed(() => roleLabels[role.value] ?? role.value ?? "");
const isBuyer = computed(() => role.value === "user");

function openEdit() {
    open.value = false;
    editOpen.value = true;
}

function goToPanel() {
    open.value = false;
    redirectToBackend(role.value);
}

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

watch(() => route.fullPath, () => {
    open.value = false;
});

async function handleLogout() {
    loggingOut.value = true;
    try {
        await auth.logout();
    } catch {

    } finally {
        loggingOut.value = false;
        open.value = false;
        router.push({ name: "home" });
    }
}
</script>

<template>
    <div ref="root" class="relative flex items-center">
        <button type="button" aria-haspopup="menu" :aria-expanded="open"
            class="flex items-center gap-2.5 rounded-full border border-transparent py-1 pl-1 pr-2 outline-none transition-colors hover:border-neutral-200 hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-primary-200 sm:pr-3"
            :class="open ? 'border-neutral-200 bg-neutral-50' : ''" @click="open = !open">
            <span class="relative">
                <UserAvatar :name="auth.user?.name" :src="auth.user?.avatar_url" size="size-9 text-sm" />
                <span v-if="showStatusDot"
                    class="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white bg-success-600"></span>
            </span>

            <span class="hidden text-left leading-tight sm:block">
                <span class="block max-w-36 truncate text-sm font-semibold text-neutral-900">{{ auth.user?.name
                    }}</span>
                <span class="block text-xs text-neutral-500">{{ roleLabel }}</span>
            </span>

            <ChevronDown class="hidden size-4 text-neutral-500 transition-transform duration-200 sm:block"
                :class="open ? 'rotate-180' : ''" />
        </button>

        <Transition enter-active-class="transition duration-150 ease-out"
            enter-from-class="-translate-y-1 scale-95 opacity-0" enter-to-class="translate-y-0 scale-100 opacity-100"
            leave-active-class="transition duration-100 ease-in" leave-from-class="opacity-100"
            leave-to-class="-translate-y-1 opacity-0">
            <div v-if="open" role="menu"
                class="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right rounded-2xl border border-neutral-200 bg-white p-2 shadow-lg">
                <div class="flex items-center gap-3 px-3 py-2.5">
                    <UserAvatar :name="auth.user?.name" :src="auth.user?.avatar_url" size="size-10 text-base" />
                    <div class="min-w-0">
                        <p class="truncate text-sm font-semibold text-neutral-900">{{ auth.user?.name }}</p>
                        <p class="truncate text-xs text-neutral-500">{{ auth.user?.email }}</p>
                        <span
                            class="mt-1 inline-block rounded-full border border-primary-200 bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-700">
                            {{ roleLabel }}
                        </span>
                    </div>
                </div>

                <div class="my-1 border-t border-neutral-200"></div>

                <button type="button" role="menuitem"
                    class="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
                    @click="openEdit">
                    <User class="size-4 text-neutral-400" />
                    Edit Profil
                </button>

                <button v-if="!isBuyer" type="button" role="menuitem"
                    class="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
                    @click="goToPanel">
                    <LayoutDashboard class="size-4 text-neutral-400" />
                    Buka Panel {{ roleLabel }}
                </button>

                <div class="my-1 border-t border-neutral-200"></div>

                <button type="button" role="menuitem" :disabled="loggingOut"
                    class="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                    @click="handleLogout">
                    <LogOut class="size-4" />
                    {{ loggingOut ? "Keluar..." : "Keluar" }}
                </button>
            </div>
        </Transition>

        <EditProfileModal v-model="editOpen" />
    </div>
</template>