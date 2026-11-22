import { ref } from "vue";
import { createPayment } from "../services/auth";

let snapLoading = null;

function loadSnap() {
    if (window.snap) return Promise.resolve();
    if (snapLoading) return snapLoading;

    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
    const isProduction = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === "true";

    if (!clientKey) {
        return Promise.reject(new Error("Client Key Midtrans belum dikonfigurasi."));
    }

    snapLoading = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = isProduction
            ? "https://app.midtrans.com/snap/snap.js"
            : "https://app.sandbox.midtrans.com/snap/snap.js";
        script.setAttribute("data-client-key", clientKey);
        script.onload = () =>
            window.snap ? resolve() : reject(new Error("Midtrans Snap gagal dimuat."));
        script.onerror = () =>
            reject(new Error("Gagal memuat layanan pembayaran Midtrans."));
        document.head.appendChild(script);
    }).catch((error) => {
        snapLoading = null; // izinkan coba lagi
        throw error;
    });

    return snapLoading;
}

/**
 * @param {Function} onDone dipanggil setelah popup pembayaran selesai/ditutup (untuk memuat ulang data)
 */
export function usePayment(onDone) {
    const payingId = ref(null);
    const error = ref("");
    const info = ref("");

    async function pay(order) {
        if (payingId.value !== null) return;

        payingId.value = order.id;
        error.value = "";
        info.value = "";

        try {
            const result = await createPayment(order.id);

            if (!result.snap_token) {
                throw new Error(result.message || "Snap Token tidak diterima dari server.");
            }

            await loadSnap();

            window.snap.pay(result.snap_token, {
                onSuccess: async () => {
                    info.value = "Pembayaran berhasil diproses. Memperbarui status pesanan...";
                    await onDone?.();
                },
                onPending: async () => {
                    info.value = "Pembayaran belum selesai. Periksa instruksi pembayaran dari Midtrans.";
                    await onDone?.();
                },
                onError: async () => {
                    error.value = "Pembayaran mengalami kendala. Silakan coba kembali.";
                    await onDone?.();
                },
                onClose: async () => {
                    info.value = "Jendela pembayaran ditutup. Status pembayaran belum tentu berubah.";
                    await onDone?.();
                },
            });
        } catch (e) {
            console.error("Gagal memulai pembayaran:", e);
            error.value =
                e.response?.data?.message ||
                e.message ||
                "Pembayaran gagal dimulai. Silakan coba kembali.";
        } finally {
            payingId.value = null;
        }
    }

    return { payingId, error, info, pay };
}