import { useState, useEffect } from "react";
import axios from "axios";
import {
  Search, Users, Loader2, Mail, Phone, MapPin,
  Calendar, ShoppingBag, X, ShieldCheck,
} from "lucide-react";

const API_BASE = "/api"; // match your backend URL/port

function authHeaders() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

// ── Customer Detail Modal ──
function CustomerModal({ customer, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-8">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-stone-200 bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-stone-900">Customer Details</h2>
          <button onClick={onClose} className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100">
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-orange-100 text-lg font-semibold text-orange-700">
            {initials(customer.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-stone-900">{customer.name}</p>
            {customer.role === "admin" && (
              <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-semibold text-orange-700">
                <ShieldCheck size={11} /> Admin
              </span>
            )}
          </div>
        </div>

        <div className="mt-5 space-y-3 text-sm">
          <div className="flex items-center gap-3 text-stone-700">
            <Mail size={15} className="text-stone-400" />
            {customer.email}
          </div>
          <div className="flex items-center gap-3 text-stone-700">
            <Phone size={15} className="text-stone-400" />
            {customer.phone || <span className="text-stone-400">Not added</span>}
          </div>
          <div className="flex items-start gap-3 text-stone-700">
            <MapPin size={15} className="mt-0.5 shrink-0 text-stone-400" />
            {customer.address || <span className="text-stone-400">No saved address</span>}
          </div>
          <div className="flex items-center gap-3 text-stone-700">
            <Calendar size={15} className="text-stone-400" />
            Joined on {formatDate(customer.createdAt)}
          </div>
          <div className="flex items-center gap-3 text-stone-700">
            <ShoppingBag size={15} className="text-stone-400" />
            {customer.orderCount ?? 0} orders placed
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──
export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  function fetchCustomers() {
    setLoading(true);
    setError("");
    axios
      .get(`${API_BASE}/users/admin`, { headers: authHeaders() })
      .then((res) => setCustomers(res.data))
      .catch(() => setError("Failed to load customers"))
      .finally(() => setLoading(false));
  }

  const filtered = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Customers</h1>
          <p className="text-sm text-stone-500">{customers.length} registered users</p>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full rounded-lg border border-stone-300 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
        />
      </div>

      {/* ── States ── */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-stone-400" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-red-200 bg-red-50 py-16">
          <p className="text-sm font-medium text-red-600">{error}</p>
          <button
            onClick={fetchCustomers}
            className="mt-3 text-sm font-medium text-orange-600 hover:underline"
          >
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white py-16">
          <Users size={36} className="mb-3 text-stone-300" />
          <p className="text-sm font-medium text-stone-500">No customers found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
                <th className="px-4 py-3 font-semibold">Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((c) => (
                <tr
                  key={c._id}
                  onClick={() => setSelected(c)}
                  className="cursor-pointer transition-colors hover:bg-stone-50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-700">
                        {initials(c.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-stone-900">{c.name}</p>
                        {c.role === "admin" && (
                          <span className="text-[11px] font-semibold text-orange-600">Admin</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-600">{c.email}</td>
                  <td className="px-4 py-3 text-stone-600">{c.phone || "—"}</td>
                  <td className="px-4 py-3 text-stone-500">{formatDate(c.createdAt)}</td>
                  <td className="px-4 py-3 text-stone-500">{c.orderCount ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && <CustomerModal customer={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}