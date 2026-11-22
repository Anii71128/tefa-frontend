<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Lock, X } from "lucide-vue-next";
import { useLoginPrompt } from "../../composables/useLoginPrompt";

const router = useRouter();
const route = useRoute();
const { isOpen, message, close } = useLoginPrompt();
const loginButton = ref(null);

function goTo(name) {
    close();
    router.push({ name, query: { redirect: route.fullPath } });
}

function onKeydown(event) {
    if (event.key === "Escape") close();
}

watch(isOpen, async (open) => {
    if (open) {
        document.addEventListener("keydown", onKeydown);
        await nextTick();
        loginButton.value?.focus();
    } else {
        document.removeEventListener("keydown", onKeydown);
    }
});

watch(() => route.fullPath, () => close());

onBeforeUnmount(() => document.removeEventListener("keydown", onKeydown));
</script>

<template>
    <Teleport to="body">
        <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/50 p-4"
            @mousedown.self="close">
            <div role="dialog" aria-modal="true" aria-labelledby="login-required-title"
                class="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
                <button type="button" class="absolute right-4 top-4 text-neutral-400 hover:text-neutral-700"
                    aria-label="Tutup" @click="close">
                    <X class="size-5" />
                </button>

                <div
                    class="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                    <Lock class="size-6" />
                </div>

                <h2 id="login-required-title" class="text-lg font-bold text-neutral-900">Silakan Masuk Terlebih Dahulu
                </h2>
                <p class="mt-2 text-sm text-neutral-500">{{ message }}</p>

                <div class="mt-6 flex gap-3">
                    <button type="button"
                        class="flex-1 rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
                        @click="goTo('register')">
                        Daftar
                    </button>
                    <button ref="loginButton" type="button"
                        class="flex-1 rounded-xl bg-primary-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-800"
                        @click="goTo('login')">
                        Masuk
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>