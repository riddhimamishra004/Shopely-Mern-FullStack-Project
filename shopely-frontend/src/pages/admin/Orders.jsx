import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";

const API_BASE = "/api";
const ORDERS_PER_PAGE = 10;

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-700", icon: RefreshCw },
  shipped: { label: "Shipped", color: "bg-purple-100 text-purple-700", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-700", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700", icon: XCircle },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status?.toLowerCase()] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.color}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

function OrderDetailModal({ order, onClose, onStatusChange }) {
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(order.status);

  async function handleStatusUpdate() {
    if (selectedStatus === order.status) return;
    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/orders/${order._id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: selectedStatus }),
      });
      if (!res.ok) throw new Error("Update failed");
      onStatusChange(order._id, selectedStatus);
      onClose();
    } catch (err) {
      alert("Status update nahi hua: " + err.message);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-stone-200 bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold text-stone-900">
              Order #{order._id?.slice(-8).toUpperCase()}
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Customer */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-2">Customer</p>
            <p className="text-sm font-medium text-stone-800">{order.user?.name || "N/A"}</p>
            <p className="text-xs text-stone-500">{order.user?.email || "N/A"}</p>
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-2">Items</p>
            <div className="space-y-2">
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-stone-50 px-3 py-2">
                  <div className="flex items-center gap-3">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-9 w-9 rounded-md object-cover border border-stone-200" />
                    ) : (
                      <div className="h-9 w-9 rounded-md bg-stone-200 flex items-center justify-center">
                        <Package size={14} className="text-stone-400" />
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-medium text-stone-800 line-clamp-1">{item.name}</p>
                      <p className="text-[10px] text-stone-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-stone-700">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping */}
          {order.shippingAddress && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-2">Shipping Address</p>
              <p className="text-xs text-stone-600 leading-relaxed">
                {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
                {order.shippingAddress.postalCode}, {order.shippingAddress.country}
              </p>
            </div>
          )}

          {/* Payment + Total */}
          {/* Payment + Total */}
          <div className="rounded-lg border border-stone-100 px-4 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-stone-400">Payment Method</p>
                <p className="text-xs font-medium text-stone-700 mt-0.5 capitalize">
                  {order.paymentMethod === "razorpay" ? "Online (Razorpay)" : "Cash on Delivery"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-stone-400">Status</p>
                <p className="text-xs font-medium mt-0.5">
                  {order.isPaid ? (
                    <span className="text-green-600">Paid ✓</span>
                  ) : (
                    <span className="text-red-500">Unpaid</span>
                  )}
                </p>
              </div>
            </div>

            {order.paymentMethod === "razorpay" && order.razorpayPaymentId && (
              <div className="border-t border-stone-100 pt-2">
                <p className="text-xs text-stone-400">Razorpay Payment ID</p>
                <p className="text-xs font-mono text-stone-700 mt-0.5 break-all">
                  {order.razorpayPaymentId}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-stone-100 pt-2">
              <p className="text-xs text-stone-400">Total</p>
              <p className="text-sm font-bold text-stone-900">
                ₹{order.total?.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Status Update */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-2">Update Status</p>
            <div className="flex gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                {Object.entries(STATUS_CONFIG).map(([val, { label }]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={updating || selectedStatus === order.status}
                className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? "..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      // array directly ya { orders: [] } dono handle karo
      setOrders(Array.isArray(data) ? data : data.orders ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Search + Filter
  const filtered = orders.filter((o) => {
    const matchSearch =
      search === "" ||
      o._id?.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" || o.status?.toLowerCase() === statusFilter;
    return matchSearch && matchStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / ORDERS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  // Reset page when filter/search changes
  useEffect(() => { setCurrentPage(1); }, [search, statusFilter]);

  function handleStatusChange(orderId, newStatus) {
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
    );
  }

  // Summary counts
  const counts = Object.keys(STATUS_CONFIG).reduce((acc, key) => {
    acc[key] = orders.filter((o) => o.status?.toLowerCase() === key).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Orders</h1>
          <p className="text-sm text-stone-400 mt-0.5">{orders.length} total orders</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Object.entries(STATUS_CONFIG).map(([key, { label, color, icon: Icon }]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(statusFilter === key ? "all" : key)}
            className={`rounded-xl border p-3 text-left transition-all ${statusFilter === key
                ? "border-orange-300 bg-orange-50 ring-2 ring-orange-200"
                : "border-stone-200 bg-white hover:border-stone-300"
              }`}
          >
            <div className={`inline-flex rounded-lg p-1.5 ${color} mb-2`}>
              <Icon size={13} />
            </div>
            <p className="text-lg font-bold text-stone-900">{counts[key] ?? 0}</p>
            <p className="text-xs text-stone-400">{label}</p>
          </button>
        ))}
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Order ID, customer name ya email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-stone-200 bg-white py-2.5 pl-9 pr-4 text-sm text-stone-700 placeholder-stone-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-stone-200 bg-white py-2.5 pl-8 pr-8 text-sm text-stone-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 appearance-none cursor-pointer"
          >
            <option value="all">All Status</option>
            {Object.entries(STATUS_CONFIG).map(([val, { label }]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw size={22} className="animate-spin text-orange-500" />
              <p className="text-sm text-stone-400">Orders load ho rahe hain...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <XCircle size={28} className="text-red-400" />
            <p className="text-sm text-stone-500">Error: {error}</p>
            <button onClick={fetchOrders} className="text-xs text-orange-600 hover:underline">
              Dobara try karo
            </button>
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <ShoppingBag size={28} className="text-stone-300" />
            <p className="text-sm text-stone-400">Koi order nahi mila</p>
            {(search || statusFilter !== "all") && (
              <button
                onClick={() => { setSearch(""); setStatusFilter("all"); }}
                className="text-xs text-orange-600 hover:underline"
              >
                Filter clear karo
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-400">Order ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-400">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-400">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-400">Items</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-400">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-400">Payment</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-400">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-400"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {paginated.map((order) => (
                    <tr key={order._id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-stone-500">
                          #{order._id?.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-stone-800">{order.user?.name || "N/A"}</p>
                        <p className="text-xs text-stone-400">{order.user?.email || ""}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-stone-500">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm text-stone-600">
                        {order.items?.length ?? 0}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-stone-800">
                        ₹{order.total?.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3">
                        {order.isPaid ? (
                          <span className="text-xs font-medium text-green-600">Paid</span>
                        ) : (
                          <span className="text-xs font-medium text-red-500">Unpaid</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="flex items-center gap-1.5 rounded-md border border-stone-200 px-2.5 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50 transition-colors"
                        >
                          <Eye size={12} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden divide-y divide-stone-100">
              {paginated.map((order) => (
                <div key={order._id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-stone-500">
                      #{order._id?.slice(-8).toUpperCase()}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-stone-800">{order.user?.name || "N/A"}</p>
                      <p className="text-xs text-stone-400">{order.user?.email || ""}</p>
                    </div>
                    <p className="text-sm font-bold text-stone-900">₹{order.total?.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-stone-400">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                      {" · "}{order.items?.length ?? 0} items
                      {" · "}
                      {order.isPaid ? (
                        <span className="text-green-600">Paid</span>
                      ) : (
                        <span className="text-red-500">Unpaid</span>
                      )}
                    </p>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex items-center gap-1 rounded-md border border-stone-200 px-2.5 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50"
                    >
                      <Eye size={12} />
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-stone-400">
            {(currentPage - 1) * ORDERS_PER_PAGE + 1}–
            {Math.min(currentPage * ORDERS_PER_PAGE, filtered.length)} of {filtered.length} orders
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-md border border-stone-200 p-1.5 text-stone-500 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === "..." ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-xs text-stone-400">…</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setCurrentPage(item)}
                    className={`min-w-[32px] rounded-md border px-2 py-1 text-xs font-medium transition-colors ${currentPage === item
                        ? "border-orange-300 bg-orange-50 text-orange-700"
                        : "border-stone-200 text-stone-600 hover:bg-stone-50"
                      }`}
                  >
                    {item}
                  </button>
                )
              )}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-md border border-stone-200 p-1.5 text-stone-500 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}