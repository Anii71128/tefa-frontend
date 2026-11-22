import axios from "axios";
import api, { attachAuthInterceptor } from "./api";

const csrfClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

attachAuthInterceptor(csrfClient);

export async function getCsrfCookie() {
  await csrfClient.get("/sanctum/csrf-cookie");
}

export async function getCurrentUser() {
  const response = await api.get("/user");
  return response.data;
}

export async function login(credentials) {
  await getCsrfCookie();

  const response = await csrfClient.post("/login", {
    email: credentials.email,
    password: credentials.password,
    remember: Boolean(credentials.remember),
  });
  return response.data;
}

export async function logout() {
  const response = await csrfClient.post("/logout");
  return response.data;
}

export async function createOrder(items) {
  const response = await csrfClient.post("/user/orders", { items });
  return response.data;
}

export async function getMyOrders() {
  const response = await csrfClient.get("/user/orders");
  return response.data.orders;
}

export async function createPayment(orderId) {
  const response = await csrfClient.post(`/orders/${orderId}/payment`);
  return response.data;
}

export async function updateProfile({ name, avatar, removeAvatar }) {
  const form = new FormData();
  form.append("name", name);
  if (avatar) form.append("avatar", avatar);
  if (removeAvatar) form.append("remove_avatar", "1");

  const response = await csrfClient.post("/user/profile", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function register(payload) {
  await getCsrfCookie();

  const response = await csrfClient.post("/register", {
    name: payload.name,
    email: payload.email,
    password: payload.password,
    password_confirmation: payload.password_confirmation,
  });
  return response.data;
}