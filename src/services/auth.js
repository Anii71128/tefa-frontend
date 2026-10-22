import axios from "axios";
import api from "./api";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const csrfClient = axios.create({
  baseURL: backendUrl,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: "application/json",
  },
});

// Mengambil cookie CSRF dari Laravel Sanctum.
export async function getCsrfCookie() {
  await csrfClient.get("/sanctum/csrf-cookie");
}

// Mengambil data pengguna yang sedang login.
export async function getCurrentUser() {
  const response = await api.get("/user");
  return response.data;
}

// Login melalui endpoint Laravel Breeze.
export async function login(credentials) {
  await getCsrfCookie();

  const response = await csrfClient.post("/login", {
    email: credentials.email,
    password: credentials.password,
    remember: Boolean(credentials.remember),
  });

  return response.data;
}

// Logout dari sesi Laravel.
export async function logout() {
  const response = await csrfClient.post("/logout");
  return response.data;
}

export async function createOrder(items) {
  // Pastikan cookie CSRF tersedia sebelum mengirim pesanan.
  await getCsrfCookie();

  const response = await csrfClient.post(
    "/user/orders",
    { items },
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
}

export async function getMyOrders() {
  const response = await csrfClient.get("/user/orders");
  return response.data.orders;
}

export async function createPayment(orderId) {
  await getCsrfCookie();

  const response = await csrfClient.post(
    `/orders/${orderId}/payment`,
    {},
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
}
