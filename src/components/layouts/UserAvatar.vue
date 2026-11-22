<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
    name: { type: String, default: "" },
    src: { type: String, default: null },
    size: { type: String, default: "size-9 text-sm" },
});

const failed = ref(false);
watch(() => props.src, () => {
    failed.value = false;
});

const initial = computed(() => (props.name?.trim()?.[0] ?? "?").toUpperCase());
const showImage = computed(() => !!props.src && !failed.value);
</script>

<template>
    <span
        class="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-700 font-bold text-white"
        :class="size">
        <img v-if="showImage" :src="src" :alt="name" class="size-full object-cover" @error="failed = true" />
        <template v-else>{{ initial }}</template>
    </span>
</template>