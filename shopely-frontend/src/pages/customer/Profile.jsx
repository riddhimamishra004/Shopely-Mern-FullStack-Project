import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Package,
  Heart,
  Settings as SettingsIcon,
  LogOut,
  ChevronRight,
  MapPin,
  Mail,
  Phone,
  ShoppingCart,
  X,
  Check,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { useMyOrders } from "../../hooks/useOrders";
import { useWishlist } from "../../hooks/useWishlist";
import { useCart } from "../../hooks/useCart";
import { formatCurrency } from "../../utils/formatCrrency";

const TABS = [
  { id: "overview", label: "Profile", icon: User },
  { id: "orders", label: "My Orders", icon: Package },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

const STATUS_STYLES = {
  Placed: "bg-blue-50 text-blue-700",
  Confirmed: "bg-indigo-50 text-indigo-700",
  Shipped: "bg-amber-50 text-amber-700",
  "Out for Delivery": "bg-orange-50 text-orange-700",
  Delivered: "bg-green-50 text-green-700",
  Cancelled: "bg-red-50 text-red-700",
};

export default function Profile() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const { orders, loading, error, cancelOrder } = useMyOrders();
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const initialTab = location.pathname.includes("/profile/orders") ? "orders" : "overview";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });
  const [saved, setSaved] = useState(false);

  if (!user) return null;
  if (loading) return <div className="mx-auto max-w-5xl px-4 py-8 text-center text-stone-500">Loading orders...</div>;
  if (error) return <div className="mx-auto max-w-5xl px-4 py-8 text-center text-red-600">Error: {error}</div>;

  // const orders = getOrdersByUser(user.id);

  function handleTabChange(tabId) {
    setActiveTab(tabId);
    navigate(tabId === "orders" ? "/profile/orders" : "/profile", { replace: true });
  }

  function handleSaveProfile(e) {
    e.preventDefault();
    updateUser(form);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  function handleMoveToCart(item) {
    addToCart(
      { _id: item.productId, name: item.name, price: item.price, image: item.image, stock: item.stock },
      1
    );
    removeFromWishlist(item.productId);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-stone-900">My Account</h1>
      <p className="mt-1 text-sm text-stone-500">
        Welcome back, {user.name?.split(" ")[0] || "there"}.
      </p>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        {/* ---------- Sidebar tabs ---------- */}
        <aside className="lg:w-56 lg:shrink-0">
          <div className="flex flex-row gap-1 overflow-x-auto rounded-xl border border-stone-200 bg-white p-2 lg:flex-col lg:overflow-visible">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${active
                    ? "bg-orange-50 text-orange-700"
                    : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                    }`}
                >
                  <Icon size={16} />
                  {tab.label}
                  {tab.id === "orders" && orders.length > 0 && (
                    <span className="ml-auto rounded-full bg-stone-100 px-1.5 py-0.5 text-[11px] font-semibold text-stone-600">
                      {orders.length}
                    </span>
                  )}
                  {tab.id === "wishlist" && wishlistItems.length > 0 && (
                    <span className="ml-auto rounded-full bg-stone-100 px-1.5 py-0.5 text-[11px] font-semibold text-stone-600">
                      {wishlistItems.length}
                    </span>
                  )}
                </button>
              );
            })}

            <button
              onClick={handleLogout}
              className="mt-1 flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 lg:mt-2 lg:border-t lg:border-stone-100 lg:pt-3"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </aside>

        {/* ---------- Tab content ---------- */}
        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {activeTab === "overview" && (
                <div className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-stone-900">Account Details</h2>
                    {!editing && (
                      <button
                        onClick={() => setEditing(true)}
                        className="text-sm font-medium text-orange-600 hover:text-orange-700"
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  {editing ? (
                    <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-stone-700">Full Name</label>
                        <input
                          value={form.name}
                          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                          className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-stone-700">Phone</label>
                        <input
                          value={form.phone}
                          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                          placeholder="+91 98765 43210"
                          className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-stone-700">Address</label>
                        <textarea
                          value={form.address}
                          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                          rows={2}
                          placeholder="House no., street, city, state, pincode"
                          className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditing(false)}
                          className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="mt-5 space-y-3 text-sm">
                      {saved && (
                        <div className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-green-700">
                          <Check size={15} /> Profile updated.
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-stone-700">
                        <User size={16} className="text-stone-400" />
                        {user.name}
                        {user.role === "admin" && (
                          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-semibold text-orange-700">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-stone-700">
                        <Mail size={16} className="text-stone-400" />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-3 text-stone-700">
                        <Phone size={16} className="text-stone-400" />
                        {user.phone || <span className="text-stone-400">Not added yet</span>}
                      </div>
                      {user.address && Object.keys(user.address).length > 0 ? (
                        <span>
                          {[user.address.street, user.address.city, user.address.state, user.address.pincode]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      ) : (
                        <span className="text-stone-400">No saved address yet</span>
                      )}

                      {user.role === "admin" && (
                        <Link
                          to="/admin/dashboard"
                          className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
                        >
                          Go to Admin Dashboard <ChevronRight size={14} />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "orders" && (
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <EmptyState
                      icon={Package}
                      title="No orders yet"
                      message="When you place an order, it'll show up here."
                      ctaLabel="Start Shopping"
                      ctaTo="/shop"
                    />
                  ) : (
                    orders.map((order) => (
                      <div
                        key={order.id}
                        className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                          <div>
                            <p className="text-sm font-semibold text-stone-900">{order.id}</p>
                            <p className="text-xs text-stone-500">
                              Placed on {new Date(order.placedAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[order.status] || "bg-stone-100 text-stone-700"
                              }`}
                          >
                            {order.status}
                          </span>
                        </div>

                        <div className="mt-3 space-y-2">
                          {order.items.map((item) => (
                            <div key={item.productId} className="flex items-center gap-3">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-12 w-12 shrink-0 rounded-md object-cover"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm text-stone-800">{item.name}</p>
                                <p className="text-xs text-stone-500">Qty: {item.quantity}</p>
                              </div>
                              <p className="text-sm font-medium text-stone-900">
                                {formatCurrency(item.price * item.quantity)}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3">
                          <p className="text-sm font-semibold text-stone-900">
                            Total: {formatCurrency(order.total)}
                          </p>
                          <div className="flex gap-2">
                            <Link
                              to={`/track-order?id=${order.id}`}
                              className="rounded-md border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50"
                            >
                              Track Order
                            </Link>
                            {order.status !== "Delivered" && order.status !== "Cancelled" && (
                              <button
                                onClick={() => cancelOrder(order.id)}
                                className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                              >
                                Cancel Order
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "wishlist" && (
                <div>
                  {wishlistItems.length === 0 ? (
                    <EmptyState
                      icon={Heart}
                      title="Your wishlist is empty"
                      message="Save items you love so you can find them again easily."
                      ctaLabel="Explore Products"
                      ctaTo="/shop"
                    />
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {wishlistItems.map((item) => (
                        <div
                          key={item.productId}
                          className="flex gap-3 rounded-xl border border-stone-200 bg-white p-3"
                        >
                          <Link to={`/product/${item.productId}`} className="shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-20 w-20 rounded-lg object-cover"
                            />
                          </Link>
                          <div className="flex flex-1 flex-col justify-between">
                            <div>
                              <Link
                                to={`/product/${item.productId}`}
                                className="line-clamp-1 text-sm font-medium text-stone-800 hover:text-orange-600"
                              >
                                {item.name}
                              </Link>
                              <p className="mt-0.5 text-sm font-semibold text-stone-900">
                                {formatCurrency(item.price)}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleMoveToCart(item)}
                                className="flex items-center gap-1 rounded-md bg-orange-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-orange-700"
                              >
                                <ShoppingCart size={12} /> Add to Cart
                              </button>
                              <button
                                onClick={() => removeFromWishlist(item.productId)}
                                aria-label="Remove from wishlist"
                                className="flex items-center justify-center rounded-md border border-stone-200 px-2 py-1.5 text-stone-500 hover:bg-stone-50 hover:text-red-600"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "settings" && (
                <div className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
                  <h2 className="text-lg font-semibold text-stone-900">Settings</h2>
                  <p className="mt-1 text-sm text-stone-500">
                    This is a demo store — settings here are illustrative only.
                  </p>

                  <div className="mt-5 divide-y divide-stone-100">
                    <SettingsRow label="Email notifications" defaultOn />
                    <SettingsRow label="Order update SMS alerts" defaultOn />
                    <SettingsRow label="Marketing emails" />
                  </div>

                  <button
                    onClick={handleLogout}
                    className="mt-6 rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Log out of this device
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, message, ctaLabel, ctaTo }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-400">
        <Icon size={22} />
      </div>
      <h3 className="mt-4 text-base font-semibold text-stone-900">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-stone-500">{message}</p>
      <Link
        to={ctaTo}
        className="mt-5 rounded-full bg-orange-600 px-5 py-2 text-sm font-medium text-white hover:bg-orange-700"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}

function SettingsRow({ label, defaultOn = false }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-stone-700">{label}</span>
      <button
        onClick={() => setOn((v) => !v)}
        aria-pressed={on}
        className={`relative h-6 w-11 rounded-full transition-colors ${on ? "bg-orange-600" : "bg-stone-200"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"
            }`}
        />
      </button>
    </div>
  );
}
