import { ref } from "vue";
import { useAuthStore } from "../stores/auth";

const isOpen = ref(false);
const message = ref("");

export function useLoginPrompt() {
    const auth = useAuthStore();

    function show(msg = "Silakan masuk terlebih dahulu untuk melanjutkan.") {
        message.value = msg;
        isOpen.value = true;
    }

    function close() {
        isOpen.value = false;
    }

    function requireLogin(msg, action) {
        if (!auth.isLoggedIn) {
            show(msg);
            return false;
        }
        action?.();
        return true;
    }

    return { isOpen, message, show, close, requireLogin };
}