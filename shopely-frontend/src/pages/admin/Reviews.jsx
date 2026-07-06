import { useState, useEffect, useMemo } from "react";
import { Star, Search, Trash2, Loader2, AlertCircle, Check, MessageSquare } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

function Stars({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={13} className={i <= rating ? "fill-amber-400 text-amber-400" : "text-stone-200"} />
      ))}
    </div>
  );
}

function DeleteConfirm({ review, onConfirm, onClose }) {
  const [deleting, setDeleting] = useState(false);
  async function go() {
    setDeleting(true);
    await onConfirm();
    setDeleting(false);
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
          <Trash2 size={18} className="text-red-600" />
        </div>
        <h2 className="text-base font-semibold text-stone-900">Delete Review?</h2>
        <p className="mt-1 text-sm text-stone-500">Yeh review permanently delete ho jayegi.</p>
        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-lg border border-stone-200 py-2 text-sm font-medium hover:bg-stone-50">Cancel</button>
          <button onClick={go} disabled={deleting}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 py-2 text-sm font-medium text-white disabled:opacity-70">
            {deleting && <Loader2 size={13} className="animate-spin" />}
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => { fetchReviews(); }, []);

  async function fetchReviews() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/admin/reviews`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to load reviews");
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function handleDelete() {
    try {
      const res = await fetch(`${API_BASE}/admin/reviews/${deleteTarget._id}`, {
        method: "DELETE", headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Delete failed");
      setReviews(prev => prev.filter(r => r._id !== deleteTarget._id));
      showToast("Review delete ho gayi!");
      setDeleteTarget(null);
    } catch (err) {
      showToast("Error: " + err.message);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reviews.filter(r => {
      const matchQ = !q
        || r.product?.name?.toLowerCase().includes(q)
        || r.user?.name?.toLowerCase().includes(q)
        || r.comment?.toLowerCase().includes(q);
      const matchRating = !ratingFilter || r.rating === ratingFilter;
      return matchQ && matchRating;
    });
  }, [reviews, search, ratingFilter]);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Reviews</h1>
          <p className="text-sm text-stone-500">
            {reviews.length} total reviews · Average rating: <span className="font-semibold text-amber-600">{avgRating} ★</span>
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by product, user, or comment..."
            className="w-full rounded-lg border border-stone-300 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => setRatingFilter(0)}
            className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${ratingFilter === 0 ? "bg-orange-600 text-white border-orange-600" : "border-stone-200 text-stone-600 hover:bg-stone-50"}`}>
            All
          </button>
          {[5,4,3,2,1].map(r => (
            <button key={r} onClick={() => setRatingFilter(r === ratingFilter ? 0 : r)}
              className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${ratingFilter === r ? "bg-amber-500 text-white border-amber-500" : "border-stone-200 text-stone-600 hover:bg-stone-50"}`}>
              {r}★
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} /> {error}
          <button onClick={fetchReviews} className="ml-auto text-xs underline">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-stone-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white py-16">
          <MessageSquare size={36} className="mb-3 text-stone-300" />
          <p className="text-sm text-stone-400">No reviews found</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(r => (
            <div key={r._id} className="group rounded-xl border border-stone-200 bg-white p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-stone-800">{r.product?.name || "Unknown Product"}</p>
                  <p className="text-xs text-stone-400">{r.user?.name || "Unknown"} · {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <button onClick={() => setDeleteTarget(r)}
                  className="shrink-0 rounded-md p-1.5 text-stone-300 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
              <Stars rating={r.rating} />
              {r.comment && (
                <p className="mt-2 text-sm text-stone-600 line-clamp-3">"{r.comment}"</p>
              )}
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <DeleteConfirm review={deleteTarget} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 shadow-lg">
          <Check size={16} className="text-green-600" /> {toast}
        </div>
      )}
    </div>
  );
}
