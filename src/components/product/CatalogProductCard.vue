<script setup>
import { computed, ref } from "vue";
import { Check, ImageOff, Plus } from "lucide-vue-next";
import { formatRupiah, imageUrl } from "../../utils/format";

const props = defineProps({
    product: { type: Object, required: true },
    canOrder: { type: Boolean, default: true },
    added: { type: Boolean, default: false },
});
defineEmits(["add"]);

const broken = ref(false);
const image = computed(() => (broken.value ? null : imageUrl(props.product.image)));
const soldOut = computed(() => Number(props.product.stock) <= 0);
const detailLink = computed(() => ({ name: "product-detail", params: { id: props.product.id } }));
</script>

<template>
    <article
        class="flex h-full flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
        <RouterLink :to="detailLink" class="relative block aspect-[16/11] shrink-0 overflow-hidden bg-neutral-100"
            :aria-label="`Lihat detail ${product.name}`">
            <img v-if="image" :src="image" :alt="product.name" loading="lazy"
                class="absolute inset-0 size-full object-cover" @error="broken = true" />
            <div v-else class="flex size-full flex-col items-center justify-center gap-1.5 text-neutral-400">
                <ImageOff class="size-7" />
                <span class="text-[11px]">Foto belum tersedia</span>
            </div>
            <span
                class="absolute left-3 top-3 rounded-lg bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-neutral-800 shadow-sm">
                {{ product.category?.name ?? "Produk" }}
            </span>
        </RouterLink>

        <div class="flex flex-1 flex-col p-4">
            <h3 class="line-clamp-2 min-h-11 text-base font-extrabold leading-snug text-neutral-900">
                {{ product.name }}
            </h3>
            <p class="mt-1 line-clamp-2 h-10 text-[12px] leading-relaxed text-neutral-500">
                {{ product.description }}
            </p>
            <p class="mt-2 text-lg font-extrabold text-neutral-900">{{ formatRupiah(product.price) }}</p>
            <p class="mt-0.5 text-xs font-medium" :class="soldOut ? 'text-error-600' : 'text-primary-700'">
                {{ soldOut ? "Stok habis" : `Stok ${product.stock}` }}
            </p>

            <div class="mt-auto flex gap-2 pt-4">
                <RouterLink :to="detailLink"
                    class="flex h-10 flex-1 items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 text-[13px] font-semibold text-neutral-800 transition-colors hover:bg-neutral-50">
                    Detail
                </RouterLink>
                <button v-if="canOrder" type="button" :disabled="soldOut"
                    class="flex h-10 flex-1 items-center justify-center gap-1 rounded-xl bg-primary-700 px-3 text-[13px] font-semibold text-white transition-colors hover:bg-primary-800 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500"
                    @click="$emit('add', product)">
                    <Check v-if="added" class="size-4" />
                    <Plus v-else class="size-4" />
                    {{ added ? "Ditambah" : "Tambah" }}
                </button>
            </div>
        </div>
    </article>
</template>