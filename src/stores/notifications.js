import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { getMyOrders } from "../services/auth";
import { useAuthStore } from "./auth";

const SNAPSHOT_PREFIX = "tefa_notif_snapshot_";
const ITEMS_PREFIX = "tefa_notif_items_";
const MAX_ITEMS = 30;

function read(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function write(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // penyimpanan browser diblokir: abaikan
    }
}

// Kunci = nilai status dari backend. Sesuaikan kalau nilai di panel admin berbeda.
const ORDER_EVENTS = {
    approved: { type: "success", title: "Pesanan disetujui", text: (n) => `Pesanan ${n} telah disetujui guru. Silakan lanjutkan pembayaran.` },
    rejected: { type: "danger", title: "Pesanan ditolak", text: (n) => `Pesanan ${n} ditolak. Hubungi pihak TEFA jika diperlukan.` },
    processing: { type: "info", title: "Pesanan sedang diproses", text: (n) => `Siswa mulai mengerjakan pesanan ${n}.` },
    completed: { type: "success", title: "Pesanan selesai", text: (n) => `Pesanan ${n} telah selesai dikerjakan.` },
};

const PAYMENT_EVENTS = {
    paid: { type: "success", title: "Pembayaran berhasil", text: (n) => `Pembayaran pesanan ${n} telah kami terima.` },
    failed: { type: "danger", title: "Pembayaran gagal", text: (n) => `Pembayaran pesanan ${n} gagal. Silakan coba lagi.` },
    expired: { type: "warning", title: "Pembayaran kedaluwarsa", text: (n) => `Batas waktu pembayaran pesanan ${n} telah habis.` },
};

function build(order, kind, event, num) {
    return {
        id: `${order.id}-${kind}-${Date.now()}`,
        orderId: order.id,
        type: event.type,
        title: event.title,
        text: event.text(num),
        createdAt: order.updated_at ?? new Date().toISOString(),
        read: false,
    };
}

export const useNotificationStore = defineStore("notifications", () => {
    const auth = useAuthStore();
    const items = ref([]);
    const loading = ref(false);

    const userId = computed(() => auth.user?.id ?? null);
    const unreadCount = computed(() => items.value.filter((n) => !n.read).length);

    function load() {
        items.value = userId.value ? read(ITEMS_PREFIX + userId.value, []) : [];
    }
    watch(userId, load, { immediate: true });

    function persist() {
        if (userId.value) write(ITEMS_PREFIX + userId.value, items.value);
    }

    async function refresh() {
        if (!userId.value || loading.value) return;
        loading.value = true;
        const uid = userId.value;

        try {
            const orders = await getMyOrders();
            if (uid !== userId.value) return; // akun berganti saat menunggu

            const snapKey = SNAPSHOT_PREFIX + uid;
            const previous = read(snapKey, null); // null = belum pernah dicek di browser ini
            const next = {};
            const fresh = [];

            for (const o of orders) {
                const state = { status: o.status ?? null, payment: o.payment_status ?? null };
                next[o.id] = state;

                // Pengecekan pertama hanya merekam kondisi awal (tanpa banjir notifikasi).
                // Pesanan yang baru muncul dianggap berawal dari "pending".
                const before = previous?.[o.id] ?? (previous ? { status: "pending", payment: null } : null);
                if (!before) continue;

                const num = o.order_number ?? `#${o.id}`;

                if (before.status !== state.status && ORDER_EVENTS[state.status]) {
                    fresh.push(build(o, `order-${state.status}`, ORDER_EVENTS[state.status], num));
                }
                if (before.payment !== state.payment && PAYMENT_EVENTS[state.payment]) {
                    fresh.push(build(o, `payment-${state.payment}`, PAYMENT_EVENTS[state.payment], num));
                }
            }

            write(snapKey, next);
            if (fresh.length) {
                items.value = [...fresh, ...items.value].slice(0, MAX_ITEMS);
                persist();
            }
        } catch {
            // gagal memuat: dicoba lagi pada putaran berikutnya
        } finally {
            loading.value = false;
        }
    }

    function markRead(id) {
        const n = items.value.find((i) => i.id === id);
        if (n) {
            n.read = true;
            persist();
        }
    }

    function markAllRead() {
        items.value.forEach((n) => (n.read = true));
        persist();
    }

    return { items, loading, unreadCount, refresh, markRead, markAllRead };
});