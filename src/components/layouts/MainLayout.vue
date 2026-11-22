<script setup>
import AppSidebar from "../layouts/AppSidebar.vue";
import AppTopbar from "../layouts/AppTopbar.vue";
import LoginRequiredModal from "../ui/LoginRequiredModal.vue";
import { useSidebar } from "../../composables/useSidebar.js";

const { collapsed, mobileOpen } = useSidebar();
</script>

<template>
    <div class="flex min-h-screen bg-neutral-100 font-sans">
        <AppSidebar v-model:collapsed="collapsed" v-model:mobileOpen="mobileOpen" />

        <div class="flex min-w-0 flex-1 flex-col">
            <AppTopbar @open-menu="mobileOpen = true" />
            <main class="flex-1 px-4 py-6 sm:px-6 md:px-8">
                <div class="w-full space-y-8 2xl:mx-auto 2xl:max-w-[1600px]">
                    <slot />
                </div>
            </main>
        </div>

        <LoginRequiredModal />
    </div>
</template>