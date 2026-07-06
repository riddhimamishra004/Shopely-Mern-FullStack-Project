import { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus, Pencil, Trash2, Search, FolderTree,
  X, Check, Loader2, AlertCircle, ImageIcon, LayoutGrid,
} from "lucide-react";
import MegaMenuEditor from "../admin/MegaMenuEditor";
import SubcategoryManager from "../admin/SubcategoryManager";

import api from "../../services/api"; 

function slugify(str) {
  return str.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
}

function authHeaders() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

// ── Modal ──
function CategoryModal({ mode, initial, onSave, onClose }) {
  const [name, setName] = useState(initial?.name || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [image, setImage] = useState(initial?.image || "");
  const [slugEdited, setSlugEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleNameChange(e) {
    setName(e.target.value);
    if (!slugEdited) setSlug(slugify(e.target.value));
  }

  function handleSlugChange(e) {
    setSlugEdited(true);
    setSlug(e.target.value);
  }

  async function handleSave() {
    if (!name.trim()) { setError("Category name required."); return; }
    if (!slug.trim()) { setError("Slug required."); return; }
    setSaving(true);
    setError("");
    try {
      await onSave({ name: name.trim(), slug: slug.trim(), image });
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong. Try again.");
      setSaving(false);
      return;
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-stone-900">
            {mode === "add" ? "Add Category" : "Edit Category"}
          </h2>
          <button onClick={onClose} className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-stone-700">Category Name</label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="e.g. Electronics"
              className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:bg-white focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-stone-700">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={handleSlugChange}
              placeholder="e.g. electronics"
              className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm font-mono outline-none focus:border-orange-500 focus:bg-white focus:ring-1 focus:ring-orange-500"
            />
            <p className="mt-1 text-[11px] text-stone-400">URL mein yahi use hoga: /shop?category={slug || "..."}</p>
          </div>

          {/* Image URL */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-stone-700">Image URL (optional)</label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:bg-white focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-stone-200 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-700 disabled:opacity-70"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
            {saving ? "Saving..." : mode === "add" ? "Add Category" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm ──
function DeleteConfirm({ category, onConfirm, onClose }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setDeleting(true);
    setError("");
    try {
      await onConfirm();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete. Try again.");
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-6 shadow-xl">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
          <Trash2 size={20} className="text-red-600" />
        </div>
        <h2 className="text-base font-semibold text-stone-900">Delete Category?</h2>
        <p className="mt-1 text-sm text-stone-500">
          <span className="font-medium text-stone-700">"{category.name}"</span> delete ho jayegi. Yeh action undo nahi ho sakta.
        </p>
        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle size={15} /> {error}
          </div>
        )}
        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-stone-200 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-70"
          >
            {deleting ? <Loader2 size={14} className="animate-spin" /> : null}
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──
export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // null | { mode: "add"|"edit", data? }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [menuTarget, setMenuTarget] = useState(null); // category whose mega-menu is being edited
  const [subcategoryTarget, setSubcategoryTarget] = useState(null); // category whose subcategories are being managed
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  function fetchCategories() {
    setLoading(true);
    axios
      .get("/categories/admin", { headers: authHeaders() })
      .then((res) => setCategories(res.data))
      .catch(() => showToast("Failed to load categories"))
      .finally(() => setLoading(false));
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSave(data) {
    if (modal.mode === "add") {
      const res = await api.post("/categories", data, { headers: authHeaders() });
      setCategories((prev) => [...prev, res.data]);
      showToast("Category add ho gayi!");
    } else {
      const res = await api.patch(
        `/categories/${modal.data._id}`,
        data,
        { headers: authHeaders() }
      );
      setCategories((prev) =>
        prev.map((c) => (c._id === modal.data._id ? res.data : c))
      );
      showToast("Category update ho gayi!");
    }
    setModal(null);
  }

  async function handleDelete() {
    await api.delete(`/categories/${deleteTarget._id}`, {
      headers: authHeaders(),
    });
    setCategories((prev) => prev.filter((c) => c._id !== deleteTarget._id));
    showToast("Category delete ho gayi!");
    setDeleteTarget(null);
  }

  function handleMegaMenuSaved(updatedCategory) {
    setCategories((prev) => prev.map((c) => (c._id === updatedCategory._id ? updatedCategory : c)));
    showToast("Mega menu save ho gaya!");
    setMenuTarget(null);
  }

  function handleSubcategoriesSaved(updatedCategory) {
    setCategories((prev) => prev.map((c) => (c._id === updatedCategory._id ? updatedCategory : c)));
    // Keep the modal open (it manages its own list live), just sync the parent list.
    setSubcategoryTarget((prev) => (prev && prev._id === updatedCategory._id ? updatedCategory : prev));
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Categories</h1>
          <p className="text-sm text-stone-500">{categories.length} total categories</p>
        </div>
        <button
          onClick={() => setModal({ mode: "add" })}
          className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-700"
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {/* ── Search ── */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories..."
          className="w-full rounded-lg border border-stone-300 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
        />
      </div>

      {/* ── Loading ── */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-stone-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white py-16">
          <FolderTree size={36} className="mb-3 text-stone-300" />
          <p className="text-sm font-medium text-stone-500">No categories found</p>
          <button
            onClick={() => setModal({ mode: "add" })}
            className="mt-3 text-sm font-medium text-orange-600 hover:underline"
          >
            Add your first category
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((cat) => (
            <div
              key={cat._id}
              className="group rounded-xl border border-stone-200 bg-white p-4 transition-shadow hover:shadow-md"
            >
              {/* Image / placeholder */}
              <div className="mb-3 flex h-28 w-full items-center justify-center overflow-hidden rounded-lg bg-stone-100">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon size={32} className="text-stone-300" />
                )}
              </div>

              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-stone-900">{cat.name}</p>
                  <p className="truncate text-xs font-mono text-stone-400">{cat.slug}</p>
                  <p className="mt-1 text-xs text-stone-500">
                    {cat.columns?.length || 0} mega-menu columns · {cat.subcategories?.length || 0} subcategories
                  </p>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => setSubcategoryTarget(cat)}
                    className="rounded-md p-1.5 text-stone-500 transition-colors hover:bg-orange-50 hover:text-orange-600"
                    title="Subcategories"
                  >
                    <FolderTree size={15} />
                  </button>
                  <button
                    onClick={() => setMenuTarget(cat)}
                    className="rounded-md p-1.5 text-stone-500 transition-colors hover:bg-orange-50 hover:text-orange-600"
                    title="Mega Menu"
                  >
                    <LayoutGrid size={15} />
                  </button>
                  <button
                    onClick={() => setModal({ mode: "edit", data: cat })}
                    className="rounded-md p-1.5 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900"
                    title="Edit"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(cat)}
                    className="rounded-md p-1.5 text-stone-500 transition-colors hover:bg-red-50 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Quick shortcuts always visible on mobile since hover doesn't apply */}
              <div className="mt-3 grid grid-cols-2 gap-2 sm:hidden">
                <button
                  onClick={() => setSubcategoryTarget(cat)}
                  className="flex items-center justify-center gap-1.5 rounded-md border border-stone-200 py-1.5 text-xs font-medium text-stone-600 hover:border-orange-300 hover:text-orange-600"
                >
                  <FolderTree size={13} /> Subcategories
                </button>
                <button
                  onClick={() => setMenuTarget(cat)}
                  className="flex items-center justify-center gap-1.5 rounded-md border border-stone-200 py-1.5 text-xs font-medium text-stone-600 hover:border-orange-300 hover:text-orange-600"
                >
                  <LayoutGrid size={13} /> Mega Menu
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modals ── */}
      {modal && (
        <CategoryModal
          mode={modal.mode}
          initial={modal.data}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          category={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {menuTarget && (
        <MegaMenuEditor
          category={menuTarget}
          onSaved={handleMegaMenuSaved}
          onClose={() => setMenuTarget(null)}
        />
      )}

      {subcategoryTarget && (
        <SubcategoryManager
          category={subcategoryTarget}
          onSaved={handleSubcategoriesSaved}
          onClose={() => setSubcategoryTarget(null)}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 shadow-lg">
          <Check size={16} className="text-green-600" />
          {toast}
        </div>
      )}
    </div>
  );
}