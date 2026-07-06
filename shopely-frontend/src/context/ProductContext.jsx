import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { categories as seedCategories, featuredProducts as seedProducts } from "../data/dummyData";
import { readStorage, writeStorage, generateId } from "../utils/storage";

const ProductContext = createContext(null);

const PRODUCTS_KEY = "shopely_products";
const CATEGORIES_KEY = "shopely_categories";

function loadProducts() {
  return readStorage(PRODUCTS_KEY, seedProducts);
}
function saveProducts(products) {
  writeStorage(PRODUCTS_KEY, products);
}
function loadCategories() {
  return readStorage(CATEGORIES_KEY, seedCategories);
}
function saveCategories(cats) {
  writeStorage(CATEGORIES_KEY, cats);
}

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setProducts(loadProducts());
    setCategories(loadCategories());
    setLoading(false);
  }, []);

  const fetchProducts = useCallback(async () => {
    const data = loadProducts();
    setProducts(data);
    return data;
  }, []);

  const fetchCategories = useCallback(async () => {
    const data = loadCategories();
    setCategories(data);
    return data;
  }, []);

  async function fetchProductById(id) {
    const data = loadProducts();
    return data.find((p) => p._id === id) || null;
  }

  // ---------- Admin CRUD (persists to localStorage so it behaves like a real backend) ----------
  function addProduct(productData) {
    const newProduct = {
      _id: generateId("p"),
      rating: 0,
      reviews: 0,
      images: productData.image ? [productData.image] : [],
      isDeal: false,
      isNewArrival: true,
      isBestSeller: false,
      createdAt: new Date().toISOString(),
      ...productData,
    };
    const updated = [...loadProducts(), newProduct];
    saveProducts(updated);
    setProducts(updated);
    return newProduct;
  }

  function updateProduct(id, updates) {
    const updated = loadProducts().map((p) => (p._id === id ? { ...p, ...updates } : p));
    saveProducts(updated);
    setProducts(updated);
  }

  function deleteProduct(id) {
    const updated = loadProducts().filter((p) => p._id !== id);
    saveProducts(updated);
    setProducts(updated);
  }

  function addCategory(category) {
    const newCategory = { id: generateId("cat"), icon: "Package", ...category };
    const updated = [...loadCategories(), newCategory];
    saveCategories(updated);
    setCategories(updated);
    return newCategory;
  }

  function updateCategory(id, updates) {
    const updated = loadCategories().map((c) => (c.id === id ? { ...c, ...updates } : c));
    saveCategories(updated);
    setCategories(updated);
  }

  function deleteCategory(id) {
    const updated = loadCategories().filter((c) => c.id !== id);
    saveCategories(updated);
    setCategories(updated);
  }

  function resetDemoData() {
    saveProducts(seedProducts);
    saveCategories(seedCategories);
    setProducts(seedProducts);
    setCategories(seedCategories);
  }

  const value = {
    products,
    categories,
    loading,
    error,
    fetchProducts,
    fetchCategories,
    fetchProductById,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    resetDemoData,
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export function useProductContext() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProductContext must be used within a ProductProvider");
  }
  return context;
}

export default ProductContext;