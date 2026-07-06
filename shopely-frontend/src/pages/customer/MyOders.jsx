import { Link } from "react-router-dom";
import { useState } from "react";
import { Loader2, PackageOpen, CheckCircle2, Circle, Truck, XCircle, CreditCard } from "lucide-react";
import { useMyOrders } from "../../hooks/useOrders";
import { formatCurrency } from "../../utils/formatCrrency";

const statusStyles = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const steps = ["pending", "processing", "shipped", "delivered"];
const stepLabels = {
  pending: "Order Placed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
};

function OrderProgress({ status }) {
  if (status === "cancelled") {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
        <XCircle size={16} />
        <span>This order has been cancelled</span>
      </div>
    );
  }

  const currentIndex = steps.indexOf(status);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => {
          const isCompleted = idx <= currentIndex;
          const isLast = idx === steps.length - 1;
          return (
            <div key={step} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                {isCompleted ? (
                  <CheckCircle2 size={20} className="text-orange-600" />
                ) : (
                  <Circle size={20} className="text-stone-300" />
                )}
                <span
                  className={`mt-1 text-center text-[10px] sm:text-xs ${isCompleted ? "font-medium text-stone-900" : "text-stone-400"
                    }`}
                >
                  {stepLabels[step]}
                </span>
              </div>
              {!isLast && (
                <div
                  className={`mx-1 h-0.5 flex-1 ${idx < currentIndex ? "bg-orange-600" : "bg-stone-200"
                    }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MyOrders() {
  const { orders, loading, error } = useMyOrders();
  const [trackingId, setTrackingId] = useState(null);

  if (loading) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-center px-4 py-24 text-center">
        <Loader2 size={28} className="animate-spin text-orange-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-center px-4 py-24 text-center">
        <PackageOpen size={40} className="text-stone-300" />
        <h1 className="mt-4 text-xl font-semibold text-stone-900">No orders yet</h1>
        <p className="mt-2 text-sm text-stone-500">
          Aapne abhi tak koi order place nahi kiya hai.
        </p>
        <Link
          to="/shop"
          className="mt-5 rounded-full bg-orange-600 px-5 py-2 text-sm font-medium text-white hover:bg-orange-700"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-xl font-bold text-stone-900 sm:text-2xl">My Orders</h1>

      <div className="mt-6 space-y-4">
        {orders.map((order) => (
          <div
            key={order._id}
            className="rounded-xl border border-stone-200 p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs text-stone-500">Order ID</p>
                <p className="text-sm font-medium text-stone-900">{order._id}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[order.status] || "bg-stone-100 text-stone-600"
                  }`}
              >
                {order.status}
              </span>
            </div>

            <div className="mt-3 border-t border-stone-100 pt-3">
              <p className="text-xs text-stone-500">
                {order.items.length} item{order.items.length > 1 ? "s" : ""}
              </p>
              <p className="mt-1 truncate text-sm text-stone-700">
                {order.items.map((item) => item.name).join(", ")}
              </p>
            </div>

            {/* Payment Info */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3">
              <div className="flex items-center gap-1.5 text-xs text-stone-500">
                <CreditCard size={13} />
                {order.paymentMethod === "razorpay" ? (
                  order.razorpayPaymentId ? (
                    <span>
                      Payment ID:{" "}
                      <span className="font-mono text-stone-700">{order.razorpayPaymentId}</span>
                    </span>
                  ) : (
                    <span>Online Payment</span>
                  )
                ) : (
                  <span>Cash on Delivery</span>
                )}
              </div>
              {order.isPaid && (
                <span className="text-xs font-medium text-green-600">Paid ✓</span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3 text-sm">
              <span className="text-stone-500">
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <span className="font-semibold text-stone-900">
                {formatCurrency(order.total)}
              </span>
            </div>

            {/* Track Order button */}
            <button
              onClick={() =>
                setTrackingId(trackingId === order._id ? null : order._id)
              }
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-stone-200 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 sm:text-sm"
            >
              <Truck size={14} />
              {trackingId === order._id ? "Hide Tracking" : "Track Order"}
            </button>

            {trackingId === order._id && <OrderProgress status={order.status} />}
          </div>
        ))}
      </div>
    </div>
  );
}