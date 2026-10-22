import { createRouter, createWebHistory } from "vue-router";
import AuthTestView from "../views/AuthTestView.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("../views/HomeView.vue"),
  },
  {
    path: "/products",
    name: "products",
    component: () => import("../views/ProductsView.vue"),
  },
  {
    path: "/products/:id",
    name: "product-detail",
    component: () => import("../views/ProductDetailView.vue"),
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/LoginView.vue"),
  },
  {
    path: "/register",
    name: "register",
    component: () => import("../views/RegisterView.vue"),
  },
  {
    path: "/cart",
    name: "cart",
    component: () => import("../views/CartView.vue"),
  },
  {
    path: "/checkout",
    name: "checkout",
    component: () => import("../views/CheckoutView.vue"),
  },
  {
    path: "/orders",
    name: "orders",
    component: () => import("../views/OrdersView.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("../views/NotFoundView.vue"),
  },
  {
    path: "/auth-test",
    name: "auth-test",
    component: AuthTestView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
