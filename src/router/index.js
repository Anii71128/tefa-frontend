import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { redirectToBackend } from "../utils/roles";

const routes = [
  { path: "/", name: "home", component: () => import("../views/HomeView.vue") },
  { path: "/products", name: "products", component: () => import("../views/ProductsView.vue") },
  { path: "/products/:id", name: "product-detail", component: () => import("../views/ProductDetailView.vue") },
  { path: "/alur-kerja", name: "alur-tefa", component: () => import("../views/AlurTefaView.vue") },

  { path: "/login", name: "login", component: () => import("../views/LoginView.vue"), meta: { guestOnly: true } },
  { path: "/register", name: "register", component: () => import("../views/RegisterView.vue"), meta: { guestOnly: true } },

  { path: "/cart", name: "cart", component: () => import("../views/CartView.vue"), meta: { requiresAuth: true, roles: ["user"] } },
  { path: "/checkout", name: "checkout", component: () => import("../views/CheckoutView.vue"), meta: { requiresAuth: true, roles: ["user"] } },
  { path: "/orders", name: "orders", component: () => import("../views/OrdersView.vue"), meta: { requiresAuth: true, roles: ["user"] } },
  { path: "/payments", name: "payments", component: () => import("../views/PaymentsView.vue"), meta: { requiresAuth: true, roles: ["user"] } },
  { path: "/:pathMatch(.*)*", name: "not-found", component: () => import("../views/NotFoundView.vue") },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach(async (to, from) => {
  const auth = useAuthStore();

  if (!auth.ready) {
  try {
    await auth.fetchUser();
  } catch {
    
  }
}

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: "login", query: { redirect: to.fullPath } };
  }

  if (to.meta.roles && auth.isLoggedIn && !to.meta.roles.includes(auth.user.role)) {
    return redirectToBackend(auth.user.role) ? false : { name: "home" };
  }

  if (to.meta.guestOnly && auth.isLoggedIn) {
    return redirectToBackend(auth.user.role) ? false : { name: "home" };
  }

  const isAuthPage = to.name === "login" || to.name === "register";
  const cameFromAuthPage = from.name === "login" || from.name === "register";
  if (isAuthPage && !to.query.redirect && from.name && !cameFromAuthPage) {
    return { name: to.name, query: { ...to.query, redirect: from.fullPath } };
  }
});

export default router;