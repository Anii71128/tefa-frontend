<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { Minus, Plus } from "lucide-vue-next";

const props = defineProps({
    file: { type: File, required: true },
});
const emit = defineEmits(["ready", "error"]);

const VIEW = 240; 
const OUTPUT = 512; 
const MAX_ZOOM = 3;

const url = ref(null);
const imgEl = ref(null);
const natural = ref({ w: 0, h: 0 });
const zoom = ref(1);
const pos = ref({ x: 0, y: 0 }); 
const loadError = ref(false);

const loaded = computed(() => natural.value.w > 0);
const baseScale = computed(() =>
    loaded.value ? Math.max(VIEW / natural.value.w, VIEW / natural.value.h) : 1,
);
const scale = computed(() => baseScale.value * zoom.value);

const imageStyle = computed(() => ({
    width: `${natural.value.w * scale.value}px`,
    height: `${natural.value.h * scale.value}px`,
    transform: `translate(${pos.value.x}px, ${pos.value.y}px)`,
    visibility: loaded.value ? "visible" : "hidden",
}));

function clamp(x, y, s = scale.value) {
    const dw = natural.value.w * s;
    const dh = natural.value.h * s;
    return {
        x: Math.min(0, Math.max(VIEW - dw, x)),
        y: Math.min(0, Math.max(VIEW - dh, y)),
    };
}

function center() {
    const s = scale.value;
    pos.value = clamp((VIEW - natural.value.w * s) / 2, (VIEW - natural.value.h * s) / 2);
}

watch(
    () => props.file,
    (file) => {
        if (url.value) URL.revokeObjectURL(url.value);
        url.value = file ? URL.createObjectURL(file) : null;
        natural.value = { w: 0, h: 0 };
        zoom.value = 1;
        loadError.value = false;
    },
    { immediate: true },
);

onBeforeUnmount(() => {
    if (url.value) URL.revokeObjectURL(url.value);
});

function onLoad(event) {
    natural.value = { w: event.target.naturalWidth, h: event.target.naturalHeight };
    center();
    emit("ready");
}

function onError() {
    loadError.value = true;
    emit("error");
}

watch(zoom, (z, oldZ) => {
    if (!loaded.value) return;
    const oldScale = baseScale.value * oldZ;
    const newScale = baseScale.value * z;
    const cx = (VIEW / 2 - pos.value.x) / oldScale;
    const cy = (VIEW / 2 - pos.value.y) / oldScale;
    pos.value = clamp(VIEW / 2 - cx * newScale, VIEW / 2 - cy * newScale, newScale);
});

function zoomBy(delta) {
    zoom.value = Math.min(MAX_ZOOM, Math.max(1, +(zoom.value + delta).toFixed(2)));
}

function onWheel(event) {
    zoomBy(-event.deltaY * 0.002);
}

let drag = null;

function onPointerDown(event) {
    if (!loaded.value) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag = {
        id: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        x: pos.value.x,
        y: pos.value.y,
    };
}

function onPointerMove(event) {
    if (!drag || event.pointerId !== drag.id) return;
    pos.value = clamp(
        drag.x + (event.clientX - drag.startX),
        drag.y + (event.clientY - drag.startY),
    );
}

function onPointerUp(event) {
    if (drag && event.pointerId === drag.id) drag = null;
}

function onKeydown(event) {
    const step = 12;
    const moves = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
    };
    const move = moves[event.key];
    if (!move || !loaded.value) return;
    event.preventDefault();
    pos.value = clamp(pos.value.x + move[0], pos.value.y + move[1]);
}

function crop() {
    return new Promise((resolve, reject) => {
        if (!loaded.value || !imgEl.value) {
            reject(new Error("Foto belum siap."));
            return;
        }

        const s = scale.value;
        const canvas = document.createElement("canvas");
        canvas.width = OUTPUT;
        canvas.height = OUTPUT;

        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, OUTPUT, OUTPUT);
        ctx.drawImage(imgEl.value, -pos.value.x / s, -pos.value.y / s, VIEW / s, VIEW / s, 0, 0, OUTPUT, OUTPUT);

        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(new Error("Gagal memproses foto."));
                    return;
                }
                const base = props.file.name.replace(/\.[^.]+$/, "") || "avatar";
                resolve(new File([blob], `${base}.jpg`, { type: "image/jpeg" }));
            },
            "image/jpeg",
            0.9,
        );
    });
}

defineExpose({ crop });
</script>

<template>
    <div class="flex flex-col items-center gap-3">
        <div class="relative cursor-grab touch-none overflow-hidden rounded-full bg-neutral-100 ring-4 ring-primary-100 active:cursor-grabbing"
            :style="{ width: `${VIEW}px`, height: `${VIEW}px` }" tabindex="0" role="group"
            aria-label="Area atur foto. Geser foto atau gunakan tombol panah untuk memilih bagian yang tampil."
            @pointerdown="onPointerDown" @pointermove="onPointerMove" @pointerup="onPointerUp"
            @pointercancel="onPointerUp" @wheel.prevent="onWheel" @keydown="onKeydown">
            <img v-if="url" ref="imgEl" :src="url" alt="" draggable="false"
                class="pointer-events-none absolute left-0 top-0 max-w-none select-none" :style="imageStyle"
                @load="onLoad" @error="onError" />
            <p v-if="!loaded && !loadError"
                class="absolute inset-0 flex items-center justify-center text-xs text-neutral-500">
                Memuat foto...
            </p>
        </div>

        <div class="flex w-full max-w-60 items-center gap-2">
            <button type="button" class="text-neutral-500 transition-colors hover:text-neutral-800"
                aria-label="Perkecil" @click="zoomBy(-0.2)">
                <Minus class="size-4" />
            </button>
            <input v-model.number="zoom" type="range" min="1" :max="MAX_ZOOM" step="0.01" aria-label="Zoom"
                class="w-full accent-primary-700" />
            <button type="button" class="text-neutral-500 transition-colors hover:text-neutral-800"
                aria-label="Perbesar" @click="zoomBy(0.2)">
                <Plus class="size-4" />
            </button>
        </div>

        <p v-if="loadError" class="text-sm text-red-600">Foto tidak bisa dibaca. Coba foto lain (JPG atau PNG).</p>
        <p v-else class="text-xs text-neutral-500">Geser foto untuk memilih bagian yang tampil.</p>
    </div>
</template>