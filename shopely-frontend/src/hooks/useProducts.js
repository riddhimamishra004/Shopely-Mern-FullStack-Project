import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Public: product list (Shop, Home)
export function useProducts(filters = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { category, subcategory, search } = filters;

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios
      .get(`${API_BASE}/products`, { params: { category, subcategory, search } })
      .then((res) => setProducts(res.data.products || []))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [category, subcategory, search]);

  return { products, loading, error };
}

// ── Public: single product by ID
export function useProduct(id) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    axios
      .get(`${API_BASE}/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [id]);

  return { product, loading, error };
}

// ── Admin: full list + CRUD
export function useAdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    return axios
      .get(`${API_BASE}/products/admin/all`, { headers: authHeaders() })
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Fetch products error:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Add product (FormData with images)
  async function addProduct(formData) {
    const res = await axios.post(`${API_BASE}/products`, formData, {
      headers: authHeaders(),
      // DO NOT set Content-Type — browser sets multipart boundary automatically
    });
    setProducts((prev) => [res.data, ...prev]);
    return res.data;
  }

  // Update product (FormData)
  async function updateProduct(id, formData) {
    const res = await axios.put(`${API_BASE}/products/${id}`, formData, {
      headers: authHeaders(),
    });
    setProducts((prev) => prev.map((p) => (p._id === id ? res.data : p)));
    return res.data;
  }

  // Delete product
  async function deleteProduct(id) {
    await axios.delete(`${API_BASE}/products/${id}`, { headers: authHeaders() });
    setProducts((prev) => prev.filter((p) => p._id !== id));
  }

  return {
    products,
    loading,
    refetch: fetchProducts,
    addProduct,
    updateProduct,   // ← was missing in return before
    deleteProduct,
  };
}
