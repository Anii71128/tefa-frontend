import api from "./api";

const toList = (body) => (Array.isArray(body) ? body : (body?.data ?? body?.products ?? []));

export async function getProducts(params = {}) {
    const res = await api.get("/products", { params });
    return toList(res.data).filter((p) => p.status === "active");
}

export async function getProduct(id) {
    const res = await api.get(`/products/${id}`);
    return res.data?.data ?? res.data;
}

export async function getCategories() {
    const res = await api.get("/categories");
    return toList(res.data).filter((c) => c.status === "active");
}