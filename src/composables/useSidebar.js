import { ref, watch } from "vue";

const KEY = "tefa-sidebar-collapsed";

const collapsed = ref(false);
const mobileOpen = ref(false);

try {
    collapsed.value = localStorage.getItem(KEY) === "1";
} catch {

}

watch(collapsed, (v) => {
    try {
        localStorage.setItem(KEY, v ? "1" : "0");
    } catch {

    }
});

export function useSidebar() {
    return { collapsed, mobileOpen };
}