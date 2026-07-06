import { useState } from "react";
import axios from "axios";
import {
  X, Plus, Trash2, GripVertical, Check, Loader2, AlertCircle, LayoutGrid,
} from "lucide-react";

const API_BASE = "/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

function slugify(str) {
  return str.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
}

/**
 * Modal to manage a category's mega-menu "columns".
 * Shape saved to DB (matches the Category model):
 *   columns: [{ title: "Face", links: [{ label: "Face Primer", slug: "face-primer" }, ...] }, ...]
 *
 * Usage: <MegaMenuEditor category={cat} onSaved={(updated) => ...} onClose={() => ...} />
 */
export default function MegaMenuEditor({ category, onSaved, onClose }) {
  const [columns, setColumns] = useState(
    category.columns?.length
      ? category.columns.map((c) => ({ ...c, links: c.links?.length ? [...c.links] : [] }))
      : []
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function addColumn() {
    setColumns((prev) => [...prev, { title: "", links: [] }]);
  }

  function removeColumn(colIdx) {
    setColumns((prev) => prev.filter((_, i) => i !== colIdx));
  }

  function updateColumnTitle(colIdx, title) {
    setColumns((prev) => prev.map((c, i) => (i === colIdx ? { ...c, title } : c)));
  }

  function addLink(colIdx) {
    setColumns((prev) =>
      prev.map((c, i) => (i === colIdx ? { ...c, links: [...c.links, { label: "", slug: "" }] } : c))
    );
  }

  function updateLink(colIdx, linkIdx, field, value) {
    setColumns((prev) =>
      prev.map((c, i) => {
        if (i !== colIdx) return c;
        const links = c.links.map((l, j) => {
          if (j !== linkIdx) return l;
          const updated = { ...l, [field]: value };
          // auto-fill slug from label unless the user already edited slug manually
          if (field === "label" && (!l.slug || l.slug === slugify(l.label))) {
            updated.slug = slugify(value);
          }
          return updated;
        });
        return { ...c, links };
      })
    );
  }

  function removeLink(colIdx, linkIdx) {
    setColumns((prev) =>
      prev.map((c, i) => (i === colIdx ? { ...c, links: c.links.filter((_, j) => j !== linkIdx) } : c))
    );
  }

  function moveColumn(colIdx, dir) {
    setColumns((prev) => {
      const next = [...prev];
      const target = colIdx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[colIdx], next[target]] = [next[target], next[colIdx]];
      return next;
    });
  }

  async function handleSave() {
    // Basic validation: every column needs a title, every link needs a label
    for (const c of columns) {
      if (!c.title.trim()) {
        setError("Har column ka title bharna zaroori hai.");
        return;
      }
      for (const l of c.links) {
        if (!l.label.trim()) {
          setError(`"${c.title}" column mein ek link ka label khaali hai.`);
          return;
        }
      }
    }

    setSaving(true);
    setError("");
    try {
      const res = await axios.put(
        `${API_BASE}/categories/${category._id}/columns`,
        { columns },
        { headers: authHeaders() }
      );
      onSaved(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Save nahi ho paya. Dobara try karein.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-8">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-stone-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold text-stone-900">
              <LayoutGrid size={18} className="text-orange-600" />
              Mega Menu — {category.name}
            </h2>
            <p className="mt-0.5 text-xs text-stone-500">
              Columns aur unke links yahin se manage karein. Navbar isi data se banega.
            </p>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {/* Columns grid */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {columns.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 py-12 text-center">
              <LayoutGrid size={32} className="mb-2 text-stone-300" />
              <p className="text-sm text-stone-500">Abhi koi column nahi hai</p>
              <button
                onClick={addColumn}
                className="mt-3 text-sm font-medium text-orange-600 hover:underline"
              >
                Pehla column add karein
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {columns.map((col, colIdx) => (
                <div key={colIdx} className="flex flex-col rounded-xl border border-stone-200 bg-stone-50 p-3">
                  {/* Column header */}
                  <div className="mb-2 flex items-center gap-1">
                    <GripVertical size={14} className="shrink-0 text-stone-300" />
                    <input
                      type="text"
                      value={col.title}
                      onChange={(e) => updateColumnTitle(colIdx, e.target.value)}
                      placeholder="Column title, e.g. Face"
                      className="min-w-0 flex-1 rounded-md border border-stone-300 bg-white px-2 py-1.5 text-sm font-semibold outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    />
                    <button
                      onClick={() => moveColumn(colIdx, -1)}
                      disabled={colIdx === 0}
                      className="rounded p-1 text-stone-400 hover:bg-stone-200 disabled:opacity-30"
                      title="Left move karein"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => moveColumn(colIdx, 1)}
                      disabled={colIdx === columns.length - 1}
                      className="rounded p-1 text-stone-400 hover:bg-stone-200 disabled:opacity-30"
                      title="Right move karein"
                    >
                      →
                    </button>
                    <button
                      onClick={() => removeColumn(colIdx)}
                      className="rounded p-1 text-red-500 hover:bg-red-50"
                      title="Column delete karein"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Links */}
                  <div className="flex flex-col gap-1.5">
                    {col.links.map((link, linkIdx) => (
                      <div key={linkIdx} className="flex items-center gap-1">
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => updateLink(colIdx, linkIdx, "label", e.target.value)}
                          placeholder="Link label, e.g. Lipstick"
                          className="min-w-0 flex-1 rounded-md border border-stone-300 bg-white px-2 py-1.5 text-xs outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        />
                        <input
                          type="text"
                          value={link.slug}
                          onChange={(e) => updateLink(colIdx, linkIdx, "slug", e.target.value)}
                          placeholder="slug"
                          className="w-20 shrink-0 rounded-md border border-stone-300 bg-white px-2 py-1.5 text-[11px] font-mono outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        />
                        <button
                          onClick={() => removeLink(colIdx, linkIdx)}
                          className="shrink-0 rounded p-1 text-stone-400 hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => addLink(colIdx)}
                    className="mt-2 flex items-center justify-center gap-1 rounded-md border border-dashed border-stone-300 py-1.5 text-xs font-medium text-stone-500 hover:border-orange-400 hover:text-orange-600"
                  >
                    <Plus size={12} /> Link add karein
                  </button>
                </div>
              ))}

              {/* Add column tile */}
              <button
                onClick={addColumn}
                className="flex min-h-[140px] flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-stone-300 text-sm font-medium text-stone-400 hover:border-orange-400 hover:text-orange-600"
              >
                <Plus size={18} />
                Naya column
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-stone-100 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-70"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
            {saving ? "Saving..." : "Mega Menu Save Karein"}
          </button>
        </div>
      </div>
    </div>
  );
}