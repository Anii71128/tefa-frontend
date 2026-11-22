<script setup>
import { computed, ref } from "vue";
import { ImageOff } from "lucide-vue-next";
import { formatRupiah, imageUrl } from "../../utils/format";

const props = defineProps({
  product: { type: Object, required: true },
});

const broken = ref(false);
const image = computed(() => (broken.value ? null : imageUrl(props.product.image)));
const soldOut = computed(() => Number(props.product.stock) <= 0);
</script>

<template>
  <article
    class="flex h-full flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
    <div class="relative aspect-[16/11] shrink-0 overflow-hidden bg-neutral-100">
      <img v-if="image" :src="image" :alt="product.name" loading="lazy" class="absolute inset-0 size-full object-cover"
        @error="broken = true" />
      <div v-else class="flex size-full flex-col items-center justify-center gap-1.5 text-neutral-400">
        <ImageOff class="size-7" />
        <span class="text-[11px]">Foto belum tersedia</span>
      </div>
    </div>

    <div class="flex flex-1 flex-col p-4">
      <div class="flex items-center justify-between gap-2">
        <span
          class="truncate rounded-full border border-primary-200 bg-primary-50 px-2.5 py-0.5 text-[11px] font-semibold text-primary-700">
          {{ product.category?.name ?? "Produk" }}
        </span>
        <span :class="soldOut ? 'text-error-600' : 'text-neutral-500'" class="shrink-0 text-[11px] font-medium">
          {{ soldOut ? "Stok habis" : `Stok ${product.stock}` }}
        </span>
      </div>

      <h3 class="mt-2.5 line-clamp-1 text-base font-extrabold leading-snug text-neutral-900">
        {{ product.name }}
      </h3>
      <p class="mt-1 line-clamp-2 min-h-9 text-[12px] leading-relaxed text-neutral-500">
        {{ product.description }}
      </p>

      <div class="mt-auto flex items-end justify-between gap-2 border-t border-neutral-200 pt-3">
        <div class="min-w-0">
          <p class="text-[10px] text-neutral-500">Harga</p>
          <p class="truncate text-base font-extrabold text-neutral-900">
            {{ formatRupiah(product.price) }}
          </p>
        </div>
        <RouterLink :to="{ name: 'product-detail', params: { id: product.id } }"
          class="shrink-0 rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-[13px] font-semibold text-neutral-800 transition-colors duration-200 hover:bg-neutral-50">
          Lihat detail
        </RouterLink>
      </div>
    </div>
  </article>
</template>