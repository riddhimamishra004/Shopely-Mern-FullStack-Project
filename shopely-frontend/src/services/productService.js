import api from "./api";

// filters can include: category, search, minPrice, maxPrice, sort, page, limit
export async function getProducts(filters = {}) {
  const { data } = await api.get("/products", { params: filters });
  return data;
}

export async function getProductById(id) {
  const { data } = await api.get(`/products/${id}`);
  return data;
}

export async function getCategories() {
  const { data } = await api.get("/products/categories");
  return data;
}

export async function createProduct(productData) {
  const { data } = await api.post("/products", productData);
  return data;
}

export async function updateProduct(id, productData) {
  const { data } = await api.put(`/products/${id}`, productData);
  return data;
}

export async function deleteProduct(id) {
  const { data } = await api.delete(`/products/${id}`);
  return data;
}