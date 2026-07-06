import { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus, Pencil, Trash2, Search, Tag, X, Check, Loader2,
  AlertCircle, Percent, Banknote, Ban, Calendar,
} from "lucide-react";

const API_BASE = "/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function isExpired(coupon) {
  return coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
}

// ── Add/Edit Modal ──
function CouponModal({ mode, initial, onSave, onClose }) {
  const [code, setCode] = useState(initial?.code || "");
  const [discountType, setDiscountType] = useState(initial?.discountType || "percentage");
  const [discountValue, setDiscountValue] = useState(initial?.discountValue ?? "");
  const [maxDiscount, setMaxDiscount] = useState(initial?.maxDiscount ?? "");
  const [minPurchase, setMinPurchase] = useState(initial?.minPurchase ?? "");
  const [expiryDate, setExpiryDate] = useState(
    initial?.expiryDate ? new Date(initial.expiryDate).toISOString().slice(0, 10) : ""
  );
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!code.trim()) { setError("Coupon code required hai."); return; }
    if (!discountValue || Number(discountValue) <= 0) { setError("Valid discount value required hai."); return; }
    if (discountType === "percentage" && Number(discountValue) > 100) { setError("Percentage discount 100 se zyada nahi ho sakta."); return; }
    if (!expiryDate) { setError("Expiry date required hai."); return; }

    setSaving(true);
    setError("");
    try {
      await onSave({
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        maxDiscount: maxDiscount === "" ? null : Number(maxDiscount),
        minPurchase: minPurchase === "" ? 0 : Number(minPurchase),
        expiryDate,
        isActive,
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong. Try again.");
      setSaving(false);
      return;
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-stone-900">
            {mode === "add" ? "Create Coupon" : "Edit Coupon"}
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
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-stone-700">Coupon Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. FIRST10"
              className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm font-mono uppercase outline-none focus:border-orange-500 focus:bg-white focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-700">Discount Type</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:bg-white focus:ring-1 focus:ring-orange-500"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-700">
                Value {discountType === "percentage" ? "(%)" : "(₹)"}
              </label>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === "percentage" ? "10" : "100"}
                className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:bg-white focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          {discountType === "percentage" && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-700">Max Discount Cap (optional)</label>
              <input
                type="number"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                placeholder="e.g. 500 (leave blank for no cap)"
                className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:bg-white focus:ring-1 focus:ring-orange-500"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-700">Min. Purchase (₹)</label>
              <input
                type="number"
                value={minPurchase}
                onChange={(e) => setMinPurchase(e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:bg-white focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-700">Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:bg-white focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          <label className="flex items-center gap-2.5 rounded-lg border border-stone-200 px-3 py-2.5">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 accent-orange-600"
            />
            <span className="text-sm text-stone-700">Coupon active hai (turant use ho sakta hai)</span>
          </label>
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
            {saving ? "Saving..." : mode === "add" ? "Create Coupon" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm ──
function DeleteConfirm({ coupon, onConfirm, onClose }) {
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
        <h2 className="text-base font-semibold text-stone-900">Delete Coupon?</h2>
        <p className="mt-1 text-sm text-stone-500">
          <span className="font-mono font-medium text-stone-700">"{coupon.code}"</span> delete ho jayega. Yeh action undo nahi ho sakta.
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
export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // null | { mode: "add"|"edit", data? }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  function fetchCoupons() {
    setLoading(true);
    axios
      .get(`${API_BASE}/coupons/admin`, { headers: authHeaders() })
      .then((res) => setCoupons(res.data))
      .catch(() => showToast("Failed to load coupons"))
      .finally(() => setLoading(false));
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  const filtered = coupons.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSave(data) {
    if (modal.mode === "add") {
      const res = await axios.post(`${API_BASE}/coupons`, data, { headers: authHeaders() });
      setCoupons((prev) => [res.data, ...prev]);
      showToast("Coupon create ho gaya!");
    } else {
      const res = await axios.put(`${API_BASE}/coupons/${modal.data._id}`, data, { headers: authHeaders() });
      setCoupons((prev) => prev.map((c) => (c._id === modal.data._id ? res.data : c)));
      showToast("Coupon update ho gaya!");
    }
    setModal(null);
  }

  async function handleDelete() {
    await axios.delete(`${API_BASE}/coupons/${deleteTarget._id}`, { headers: authHeaders() });
    setCoupons((prev) => prev.filter((c) => c._id !== deleteTarget._id));
    showToast("Coupon delete ho gaya!");
    setDeleteTarget(null);
  }

  async function handleToggleActive(coupon) {
    setBusyId(coupon._id);
    try {
      const res = await axios.put(
        `${API_BASE}/coupons/${coupon._id}`,
        { isActive: !coupon.isActive },
        { headers: authHeaders() }
      );
      setCoupons((prev) => prev.map((c) => (c._id === coupon._id ? res.data : c)));
    } catch {
      showToast("Update nahi ho paya");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Coupons</h1>
          <p className="text-sm text-stone-500">{coupons.length} total coupons</p>
        </div>
        <button
          onClick={() => setModal({ mode: "add" })}
          className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-700"
        >
          <Plus size={16} />
          Create Coupon
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search coupon code..."
          className="w-full rounded-lg border border-stone-300 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
        />
      </div>

      {/* Loading / Empty / List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-stone-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white py-16">
          <Tag size={36} className="mb-3 text-stone-300" />
          <p className="text-sm font-medium text-stone-500">No coupons found</p>
          <button
            onClick={() => setModal({ mode: "add" })}
            className="mt-3 text-sm font-medium text-orange-600 hover:underline"
          >
            Create your first coupon
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((coupon) => {
            const expired = isExpired(coupon);
            const disabled = !coupon.isActive || expired;
            return (
              <div
                key={coupon._id}
                className={`group rounded-xl border bg-white p-4 transition-shadow hover:shadow-md ${
                  disabled ? "border-stone-100 opacity-70" : "border-stone-200"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                      {coupon.discountType === "percentage" ? <Percent size={16} /> : <Banknote size={16} />}
                    </span>
                    <div>
                      <p className="font-mono text-sm font-bold text-stone-900">{coupon.code}</p>
                      <p className="text-xs text-stone-500">
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountValue}% off`
                          : `₹${coupon.discountValue} off`}
                        {coupon.maxDiscount ? ` (max ₹${coupon.maxDiscount})` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => setModal({ mode: "edit", data: coupon })}
                      className="rounded-md p-1.5 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900"
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(coupon)}
                      className="rounded-md p-1.5 text-stone-500 transition-colors hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-stone-500">
                  <p>Min. purchase: <span className="font-medium text-stone-700">₹{coupon.minPurchase || 0}</span></p>
                  <p className="flex items-center gap-1">
                    <Calendar size={12} />
                    Expires: <span className={`font-medium ${expired ? "text-red-600" : "text-stone-700"}`}>{formatDate(coupon.expiryDate)}</span>
                  </p>
                  <p>Used <span className="font-medium text-stone-700">{coupon.usageCount || 0}</span> times</p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      expired
                        ? "bg-red-50 text-red-600"
                        : coupon.isActive
                        ? "bg-green-50 text-green-700"
                        : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {expired ? "Expired" : coupon.isActive ? "Active" : "Disabled"}
                  </span>
                  <button
                    onClick={() => handleToggleActive(coupon)}
                    disabled={busyId === coupon._id || expired}
                    className="flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-orange-600 disabled:opacity-50"
                  >
                    {busyId === coupon._id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Ban size={12} />
                    )}
                    {coupon.isActive ? "Disable" : "Enable"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {modal && (
        <CouponModal
          mode={modal.mode}
          initial={modal.data}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          coupon={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 shadow-lg">
          <Check size={16} className="text-green-600" />
          {toast}
        </div>
      )}
    </div>
  );
}
