import { getImageUrl } from "../../utils/getImageUrl";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Package, X, Loader2, Pencil, Trash2 } from "lucide-react";
import { useAdminProducts } from "../../hooks/useProducts";
import { useCategories } from "../../hooks/useCategories";

function stockInfo(stock) {
  if (stock === 0) return { label: "Out of stock", className: "bg-red-50 text-red-700" };
  if (stock <= 10) return { label: `Low stock - ${stock} left`, className: "bg-amber-50 text-amber-700" };
  return { label: `${stock} in stock`, className: "bg-green-50 text-green-700" };
}

function formatCurrency(n) {
  return "$" + Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function ProductDetail({ product, onClose, onEdit, onDelete }) {
  if (!product) return null;
  const stock = stockInfo(product.stock);
  const image = getImageUrl(product.images?.[0]);
  return (
    <div
      className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-5 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
              {image ? (
                <img src={image} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <Package size={20} className="text-gray-300" />
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{product.name}</p>
              <p className="text-sm text-gray-500 mt-0.5">{product._id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        <span className={`inline-block text-xs px-2.5 py-1 rounded-md mb-3 ${stock.className}`}>
          {stock.label}
        </span>

        <div className="border-t border-gray-200 pt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Category</span>
            <span className="text-gray-900">{product.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Price</span>
            <span className="text-gray-900 font-medium">{formatCurrency(product.price)}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 h-9 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 flex items-center justify-center gap-1.5"
          >
            <Pencil size={14} />
            Edit
          </button>
          <button
            onClick={() => onDelete(product)}
            className="flex-1 h-9 rounded-lg border border-red-200 text-red-600 text-sm hover:bg-red-50 flex items-center justify-center gap-1.5"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirm({ product, onConfirm, onClose }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await onConfirm();
    setDeleting(false);
  }

  return (
    <div
      className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div className="bg-white rounded-xl p-5 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-semibold text-gray-900">Delete product?</h2>
        <p className="text-sm text-gray-500 mt-1">
          "{product.name}" delete ho jayega. Yeh undo nahi ho sakta.
        </p>
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 h-9 rounded-lg border border-gray-200 text-sm hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 h-9 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-70 flex items-center justify-center gap-1.5"
          >
            {deleting && <Loader2 size={14} className="animate-spin" />}
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const navigate = useNavigate();
  const { products, loading, refetch, deleteProduct } = useAdminProducts();
  const { categories } = useCategories();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const categoryFilters = ["All", ...categories.map((c) => c.slug)];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesQ = !q || p.name.toLowerCase().includes(q);
      const matchesCategory = category === "All" || p.category === category;
      return matchesQ && matchesCategory;
    });
  }, [products, search, category]);

  async function handleDelete() {
    await deleteProduct(deleteTarget._id);
    setDeleteTarget(null);
    setSelected(null);
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 bg-white">
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">{products.length} products total</p>
        </div>
        <button
          onClick={() => navigate("/admin/products/add")}
          className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 shrink-0"
        >
          <Plus size={16} />
          Add product
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1 min-w-0">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name"
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 -mx-1 px-1 sm:mx-0 sm:px-0">
          {categoryFilters.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`h-9 px-3 rounded-lg text-sm whitespace-nowrap border transition-colors capitalize ${category === c
                ? "bg-blue-50 text-blue-700 border-blue-200 font-medium"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package size={28} className="text-gray-300 mb-2" />
          <p className="text-sm text-gray-400">
            {products.length === 0
              ? "No products yet. Add your first product to get started."
              : "No products match your filters."}
          </p>
          {products.length === 0 && (
            <button
              onClick={() => navigate("/admin/products/add")}
              className="mt-3 text-sm font-medium text-blue-600 hover:underline"
            >
              Add a product
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((p) => {
            const stock = stockInfo(p.stock);
            const image = getImageUrl(p.images?.[0]);
            return (
              <button
                key={p._id}
                onClick={() => setSelected(p)}
                className="text-left border border-gray-200 rounded-xl p-3 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="w-full aspect-square rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden mb-2.5">
                  {image ? (
                    <img src={image} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <Package size={28} className="text-gray-300" />
                  )}
                </div>
                <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                <p className="text-xs text-gray-500 mt-0.5 capitalize">{p.category}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(p.price)}
                  </span>
                </div>
                <span
                  className={`inline-block text-[11px] px-2 py-0.5 rounded-md mt-2 ${stock.className}`}
                >
                  {stock.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <ProductDetail
        product={selected}
        onClose={() => setSelected(null)}
        onEdit={(p) => navigate(`/admin/products/edit/${p._id}`)}
        onDelete={(p) => setDeleteTarget(p)}
      />

      {deleteTarget && (
        <DeleteConfirm
          product={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}