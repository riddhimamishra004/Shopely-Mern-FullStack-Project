import { useState } from "react";
import axios from "axios";
import {
  X, Plus, Trash2, Pencil, Check, Loader2, AlertCircle, FolderTree, Ban,
} from "lucide-react";

const API_BASE = "/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

/**
 * Modal to manage a category's product-taxonomy subcategories.
 * e.g. Men's Wear -> T-Shirts, Shirts, Jeans, Hoodies, Jackets ...
 *
 * Unlike MegaMenuEditor (which batch-saves the whole columns array),
 * this hits the dedicated per-subcategory endpoints directly so the
 * list always reflects exactly what's persisted.
 *
 * Usage: <SubcategoryManager category={cat} onSaved={(updated) => ...} onClose={() => ...} />
 */
export default function SubcategoryManager({ category, onSaved, onClose }) {
  const [subcategories, setSubcategories] = useState(category.subcategories || []);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  function applyUpdated(updatedCategory) {
    setSubcategories(updatedCategory.subcategories || []);
    onSaved?.(updatedCategory);
  }

  async function handleAdd() {
    if (!newName.trim()) return;
    setAdding(true);
    setError("");
    try {
      const res = await axios.post(
        `${API_BASE}/categories/${category._id}/subcategories`,
        { name: newName.trim() },
        { headers: authHeaders() }
      );
      applyUpdated(res.data);
      setNewName("");
    } catch (err) {
      setError(err?.response?.data?.message || "Subcategory add nahi ho payi.");
    } finally {
      setAdding(false);
    }
  }

  function startEdit(sub) {
    setEditingId(sub._id);
    setEditingName(sub.name);
    setError("");
  }

  async function handleSaveEdit(subId) {
    if (!editingName.trim()) return;
    setBusyId(subId);
    setError("");
    try {
      const res = await axios.put(
        `${API_BASE}/categories/${category._id}/subcategories/${subId}`,
        { name: editingName.trim() },
        { headers: authHeaders() }
      );
      applyUpdated(res.data);
      setEditingId(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Update nahi ho paya.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleToggleActive(sub) {
    setBusyId(sub._id);
    setError("");
    try {
      const res = await axios.put(
        `${API_BASE}/categories/${category._id}/subcategories/${sub._id}`,
        { isActive: !sub.isActive },
        { headers: authHeaders() }
      );
      applyUpdated(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Update nahi ho paya.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(subId) {
    setBusyId(subId);
    setError("");
    try {
      const res = await axios.delete(
        `${API_BASE}/categories/${category._id}/subcategories/${subId}`,
        { headers: authHeaders() }
      );
      applyUpdated(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Delete nahi ho paya.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border border-stone-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <FolderTree size={18} className="text-orange-600" />
            <div>
              <h2 className="text-base font-semibold text-stone-900">Subcategories</h2>
              <p className="text-xs text-stone-500">{category.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          {/* Add new */}
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="e.g. T-Shirts"
              className="flex-1 rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:bg-white focus:ring-1 focus:ring-orange-500"
            />
            <button
              onClick={handleAdd}
              disabled={adding || !newName.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-orange-600 px-3.5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
            >
              {adding ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
              Add
            </button>
          </div>

          {/* List */}
          {subcategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 py-10">
              <FolderTree size={28} className="mb-2 text-stone-300" />
              <p className="text-sm text-stone-500">Abhi koi subcategory nahi hai</p>
              <p className="text-xs text-stone-400">Upar se add karo — jaise T-Shirts, Jeans, Hoodies</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {subcategories.map((sub) => (
                <li
                  key={sub._id}
                  className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 ${
                    sub.isActive === false ? "border-stone-100 bg-stone-50" : "border-stone-200 bg-white"
                  }`}
                >
                  {editingId === sub._id ? (
                    <input
                      autoFocus
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveEdit(sub._id)}
                      className="flex-1 rounded-md border border-orange-300 bg-white px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  ) : (
                    <div className="min-w-0">
                      <p className={`truncate text-sm font-medium ${sub.isActive === false ? "text-stone-400" : "text-stone-800"}`}>
                        {sub.name}
                      </p>
                      <p className="truncate text-xs font-mono text-stone-400">{sub.slug}</p>
                    </div>
                  )}

                  <div className="flex shrink-0 items-center gap-1">
                    {editingId === sub._id ? (
                      <button
                        onClick={() => handleSaveEdit(sub._id)}
                        disabled={busyId === sub._id}
                        className="rounded-md p-1.5 text-green-600 hover:bg-green-50"
                        title="Save"
                      >
                        {busyId === sub._id ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                      </button>
                    ) : (
                      <button
                        onClick={() => startEdit(sub)}
                        className="rounded-md p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900"
                        title="Rename"
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleActive(sub)}
                      disabled={busyId === sub._id}
                      className={`rounded-md p-1.5 hover:bg-amber-50 ${sub.isActive === false ? "text-stone-300" : "text-amber-600"}`}
                      title={sub.isActive === false ? "Enable" : "Disable"}
                    >
                      <Ban size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(sub._id)}
                      disabled={busyId === sub._id}
                      className="rounded-md p-1.5 text-stone-500 hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-stone-100 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-lg border border-stone-200 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
