import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { useAuthStore } from "./auth";

const STORAGE_PREFIX = "tefa_draft_";

export const useCartStore = defineStore("cart", () => {
    const auth = useAuthStore();
    const items = ref([]);

    const storageKey = computed(() => (auth.user ? `${STORAGE_PREFIX}${auth.user.id}` : null));

    function load() {
        items.value = [];
        if (!storageKey.value) return;
        try {
            const parsed = JSON.parse(localStorage.getItem(storageKey.value) || "[]");
            items.value = Array.isArray(parsed) ? parsed : [];
        } catch {
            items.value = [];
        }
    }

    watch(storageKey, load, { immediate: true });

    watch(
        items,
        () => {
            if (!storageKey.value) return;
            try {
                localStorage.setItem(storageKey.value, JSON.stringify(items.value));
            } catch {

            }
        },
        { deep: true },
    );

    const total = computed(() => items.value.reduce((sum, i) => sum + i.price * i.qty, 0));

    function add(product, qty = 1) {
        const stock = Number(product.stock);
        if (!(stock > 0)) return false;

        const existing = items.value.find((i) => i.id === product.id);
        if (existing) {
            existing.stock = stock;
            existing.qty = Math.min(stock, existing.qty + qty);
        } else {
            items.value.push({
                id: product.id,
                name: product.name,
                price: Number(product.price),
                image: product.image ?? null,
                stock,
                qty: Math.min(stock, qty),
            });
        }
        return true;
    }

    function setQty(id, qty) {
        const item = items.value.find((i) => i.id === id);
        if (!item) return;
        item.qty = Math.max(1, Math.min(item.stock, Math.floor(qty) || 1));
    }

    function remove(id) {
        items.value = items.value.filter((i) => i.id !== id);
    }

    function clear() {
        items.value = [];
    }

    return { items, total, add, setQty, remove, clear };
});