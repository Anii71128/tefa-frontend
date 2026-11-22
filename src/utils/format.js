export function formatRupiah(value) {
    return "Rp " + Number(value || 0).toLocaleString("id-ID");
}

export function imageUrl(path) {
    if (!path) return null;
    if (/^https?:\/\//.test(path)) return path;
    const base = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");
    return `${base}/storage/${path}`;
}