import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  ChevronRight,
  Clock,
  XCircle,
  ArrowUpRight,
  Phone,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";

// ── Dummy order data ───────────────────────────────────────────────────────────
const DUMMY_ORDERS = {
  "ORD-2024-001": {
    id: "ORD-2024-001",
    status: "Delivered",
    placedOn: "12 Jun 2026",
    deliveredOn: "15 Jun 2026",
    estimatedDelivery: null,
    paymentMethod: "UPI — GPay",
    paymentStatus: "Paid",
    items: [
      { id: 1, name: "Pro Cast Iron Skillet Set", qty: 1, price: 1349, oldPrice: 2999, emoji: "🍳" },
      { id: 2, name: "Ceramic Mug (Set of 2)", qty: 2, price: 349, oldPrice: null, emoji: "☕" },
      { id: 3, name: "Bamboo Spice Box", qty: 1, price: 299, oldPrice: 499, emoji: "🪴" },
    ],
    address: {
      name: "Priya Mehta",
      line: "42, Shivaji Nagar, Near City Mall",
      city: "Pune",
      state: "Maharashtra",
      pin: "411005",
      phone: "+91 98765 43210",
    },
    subtotal: 1997,
    shipping: 0,
    discount: 648,
    total: 1349,
    tracking: [
      { label: "Order Placed", date: "12 Jun, 10:30 AM", done: true },
      { label: "Order Confirmed", date: "12 Jun, 11:00 AM", done: true },
      { label: "Shipped", date: "13 Jun, 2:15 PM", done: true },
      { label: "Out for Delivery", date: "15 Jun, 9:00 AM", done: true },
      { label: "Delivered", date: "15 Jun, 1:45 PM", done: true },
    ],
  },
  "ORD-2024-002": {
    id: "ORD-2024-002",
    status: "In Transit",
    placedOn: "28 May 2026",
    deliveredOn: null,
    estimatedDelivery: "2 Jul 2026",
    paymentMethod: "Credit Card — HDFC",
    paymentStatus: "Paid",
    items: [
      { id: 1, name: "Ultra Hydration Skincare Trio", qty: 1, price: 1099, oldPrice: 1999, emoji: "🧴" },
      { id: 2, name: "Vitamin C Face Serum 30ml", qty: 1, price: 449, oldPrice: 899, emoji: "✨" },
    ],
    address: {
      name: "Priya Mehta",
      line: "Tech Park, Building B, Floor 3",
      city: "Pune",
      state: "Maharashtra",
      pin: "411045",
      phone: "+91 98765 43210",
    },
    subtotal: 2897,
    shipping: 0,
    discount: 1350,
    total: 1548,
    tracking: [
      { label: "Order Placed", date: "28 May, 3:00 PM", done: true },
      { label: "Order Confirmed", date: "28 May, 3:30 PM", done: true },
      { label: "Shipped", date: "29 May, 10:00 AM", done: true },
      { label: "Out for Delivery", date: null, done: false },
      { label: "Delivered", date: null, done: false },
    ],
  },
};

function formatCurrency(n) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function StatusConfig(status) {
  return {
    Delivered: { color: "text-green-700", bg: "bg-green-100", icon: CheckCircle2, label: "Delivered" },
    "In Transit": { color: "text-blue-700", bg: "bg-blue-100", icon: Truck, label: "In Transit" },
    Processing: { color: "text-amber-700", bg: "bg-amber-100", icon: Clock, label: "Processing" },
    Cancelled: { color: "text-red-600", bg: "bg-red-100", icon: XCircle, label: "Cancelled" },
  }[status] || { color: "text-stone-600", bg: "bg-stone-100", icon: Clock, label: status };
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text).catch(() => { }); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="ml-2 inline-flex items-center gap-1 text-xs text-stone-400 hover:text-orange-600 transition-colors"
    >
      {copied ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function OrderSummary() {
  const { id } = useParams();

  // Fallback to first order if no id match (for demo)
  const order = DUMMY_ORDERS[id] || DUMMY_ORDERS["ORD-2024-001"];
  const { color, bg, icon: StatusIcon } = StatusConfig(order.status);

  const currentStep = order.tracking.filter((t) => t.done).length - 1;

  return (
    <div className="min-h-screen bg-[#FAF7F2]">

      {/* ── Breadcrumb ── */}
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 px-4 py-3 text-xs text-stone-400 sm:px-6 lg:px-8">
          <Link to="/" className="hover:text-orange-600">Home</Link>
          <ChevronRight size={12} />
          <Link to="/profile/orders" className="hover:text-orange-600">My Orders</Link>
          <ChevronRight size={12} />
          <span className="font-medium text-stone-700">{order.id}</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ── Page title + status ── */}
        <div className="mb-7 flex flex-wrap items-start justify-between gap-3">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">
              Order Summary
            </p>
            <h1 className="mt-1 text-2xl font-bold text-stone-900 sm:text-3xl">
              {order.id}
            </h1>
            <p className="mt-1 text-sm text-stone-400">Placed on {order.placedOn}</p>
          </motion.div>
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.08 }}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${bg} ${color}`}
          >
            <StatusIcon size={15} />
            {order.status}
          </motion.span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

          {/* ── LEFT column ── */}
          <div className="space-y-5">

            {/* Tracking timeline */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 }}
              className="rounded-2xl border border-stone-200 bg-white p-6"
            >
              <h2 className="mb-5 font-bold text-stone-900">Order Tracking</h2>
              {order.estimatedDelivery && (
                <div className="mb-5 flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3">
                  <Truck size={15} className="text-blue-600" />
                  <p className="text-sm font-medium text-blue-700">
                    Estimated delivery by <strong>{order.estimatedDelivery}</strong>
                  </p>
                </div>
              )}
              {order.deliveredOn && (
                <div className="mb-5 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3">
                  <CheckCircle2 size={15} className="text-green-600" />
                  <p className="text-sm font-medium text-green-700">
                    Delivered on <strong>{order.deliveredOn}</strong>
                  </p>
                </div>
              )}

              <div className="space-y-0">
                {order.tracking.map((step, i) => {
                  const isLast = i === order.tracking.length - 1;
                  const isCurrent = step.done && (isLast || !order.tracking[i + 1]?.done);
                  return (
                    <div key={step.label} className="flex gap-4">
                      {/* Dot + line */}
                      <div className="flex flex-col items-center">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all ${step.done
                          ? isCurrent
                            ? "border-orange-500 bg-orange-500"
                            : "border-green-500 bg-green-500"
                          : "border-stone-200 bg-white"
                          }`}>
                          {step.done ? (
                            <Check size={13} className="text-white" />
                          ) : (
                            <div className="h-2 w-2 rounded-full bg-stone-300" />
                          )}
                        </div>
                        {!isLast && (
                          <div className={`my-1 w-0.5 flex-1 ${step.done ? "bg-green-300" : "bg-stone-200"}`}
                            style={{ minHeight: 24 }} />
                        )}
                      </div>
                      {/* Content */}
                      <div className={`pb-5 pt-1 ${isLast ? "" : ""}`}>
                        <p className={`text-sm font-semibold ${step.done ? "text-stone-900" : "text-stone-400"}`}>
                          {step.label}
                          {isCurrent && (
                            <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-600">
                              Current
                            </span>
                          )}
                        </p>
                        {step.date && (
                          <p className="mt-0.5 text-xs text-stone-400">{step.date}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Order items */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-stone-200 bg-white p-6"
            >
              <h2 className="mb-5 font-bold text-stone-900">
                Items ({order.items.length})
              </h2>
              <div className="divide-y divide-stone-100">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-3xl">
                      {item.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-stone-900 truncate">{item.name}</p>
                      <p className="mt-0.5 text-xs text-stone-400">Qty: {item.qty}</p>
                      {item.oldPrice && (
                        <p className="mt-0.5 text-xs text-stone-400 line-through">{formatCurrency(item.oldPrice)}</p>
                      )}
                    </div>
                    <p className="font-bold text-stone-900">{formatCurrency(item.price * item.qty)}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Delivery address */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
              className="rounded-2xl border border-stone-200 bg-white p-6"
            >
              <h2 className="mb-4 font-bold text-stone-900">Delivery Address</h2>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50">
                  <MapPin size={15} className="text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold text-stone-800">{order.address.name}</p>
                  <p className="mt-0.5 text-sm text-stone-500">{order.address.line}</p>
                  <p className="text-sm text-stone-500">
                    {order.address.city}, {order.address.state} — {order.address.pin}
                  </p>
                  <p className="mt-1 flex items-center text-sm text-stone-500">
                    <Phone size={12} className="mr-1.5 text-stone-400" />
                    {order.address.phone}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT column ── */}
          <div className="space-y-5">

            {/* Price summary */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="rounded-2xl border border-stone-200 bg-white p-6"
            >
              <h2 className="mb-5 font-bold text-stone-900">Price Breakdown</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">
                    {order.shipping === 0 ? "Free" : formatCurrency(order.shipping)}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>− {formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="border-t border-stone-100 pt-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-stone-900">Total Paid</span>
                    <span className="text-lg font-bold text-stone-900">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Payment info */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="rounded-2xl border border-stone-200 bg-white p-6"
            >
              <h2 className="mb-4 font-bold text-stone-900">Payment</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-500">Method</span>
                  <span className="font-medium text-stone-800">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Status</span>
                  <span className="font-semibold text-green-600">{order.paymentStatus}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Order ID</span>
                  <span className="flex items-center font-mono text-xs text-stone-700">
                    {order.id}
                    <CopyButton text={order.id} />
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="rounded-2xl border border-stone-200 bg-white p-5 space-y-2.5"
            >
              {order.status === "Delivered" && (
                <button className="flex w-full items-center justify-between rounded-xl bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700 transition-colors hover:bg-orange-100">
                  <span className="flex items-center gap-2">
                    <Package size={15} /> Return / Exchange
                  </span>
                  <ChevronRight size={14} />
                </button>
              )}
              {order.status === "Delivered" && (
                <button className="flex w-full items-center justify-between rounded-xl bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-100">
                  <span className="flex items-center gap-2">
                    ★ Write a Review
                  </span>
                  <ChevronRight size={14} />
                </button>
              )}
              {order.status === "In Transit" && (
                <button className="flex w-full items-center justify-between rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100">
                  <span className="flex items-center gap-2">
                    <Truck size={15} /> Track Shipment
                  </span>
                  <ChevronRight size={14} />
                </button>
              )}
              <Link
                to="/shop"
                className="flex w-full items-center justify-between rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
              >
                <span className="flex items-center gap-2">
                  <ArrowUpRight size={15} /> Shop Again
                </span>
                <ChevronRight size={14} />
              </Link>
              <Link
                to="/orders"
                className="block w-full rounded-xl border border-stone-200 px-4 py-3 text-center text-sm font-semibold text-stone-600 transition-colors hover:border-stone-300 hover:text-stone-900"
              >
                ← Back to Orders
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}