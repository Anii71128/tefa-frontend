const BACKEND_PATHS = { admin: "/admin", guru: "/guru", siswa: "/siswa" };

export function redirectToBackend(role) {
    const path = BACKEND_PATHS[role];
    if (!path) return false;
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}${path}`;
    return true;
}