export const formatDate = (value) => {
    if (!value) return "-";
    return new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
};

const LABELS = {
    pending: "Menunggu persetujuan guru",
    approved: "Disetujui guru",
    rejected: "Ditolak",
    processing: "Sedang diproses",
    completed: "Selesai",
    unpaid: "Belum dibayar",
    paid: "Lunas",
    failed: "Gagal",
    expired: "Kedaluwarsa",
};

const STYLES = {
    pending: "bg-amber-50 text-amber-800 border-amber-200",
    approved: "bg-primary-50 text-primary-700 border-primary-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
    processing: "bg-blue-50 text-blue-700 border-blue-200",
    completed: "bg-primary-50 text-primary-700 border-primary-200",
    unpaid: "bg-amber-50 text-amber-800 border-amber-200",
    paid: "bg-primary-50 text-primary-700 border-primary-200",
    failed: "bg-red-50 text-red-700 border-red-200",
    expired: "bg-neutral-100 text-neutral-600 border-neutral-200",
};

export const statusLabel = (status) => LABELS[status] || status || "Belum diketahui";
export const statusClass = (status) =>
    STYLES[status] || "bg-neutral-100 text-neutral-600 border-neutral-200";