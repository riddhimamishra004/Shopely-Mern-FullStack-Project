import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, CreditCard, Truck, Check, Tag, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { useCart } from "../../hooks/useCart";
import { formatCurrency } from "../../utils/formatCrrency";

const PAYMENT_METHODS = [
  { id: "razorpay", label: "Pay Online", desc: "UPI, Card, Netbanking — sab ek jagah" },
  { id: "cod", label: "Cash on Delivery", desc: "Pay when your order arrives" },
];


function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, cartCount, cartTotal, clearCart } = useCart();

  const shipping = cartTotal >= 999 ? 0 : 49;

  // ── Coupon ──
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discountType, discountValue, discountAmount }
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const discountAmount = appliedCoupon?.discountAmount || 0;
  const orderTotal = Math.max(0, cartTotal + shipping - discountAmount);

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), cartTotal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Coupon apply nahi ho paya");
      setAppliedCoupon(data);
      toast.success(data.message || "Coupon applied!");
    } catch (err) {
      setCouponError(err.message);
      setAppliedCoupon(null);
    } finally {
      setApplyingCoupon(false);
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
  }

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [placing, setPlacing] = useState(false);

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-20 text-center sm:py-28">
        <h1 className="text-xl font-bold text-stone-900">Nothing to checkout</h1>
        <p className="mt-2 text-sm text-stone-500">Your cart is empty.</p>
        <Link
          to="/shop"
          className="mt-6 rounded-full bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function validate() {
    const { fullName, phone, address, city, state, pincode } = form;
    if (!fullName.trim()) return "Please enter your full name.";
    if (!/^\d{10}$/.test(phone.trim())) return "Enter a valid 10-digit phone number.";
    if (!address.trim()) return "Please enter your delivery address.";
    if (!city.trim()) return "Please enter your city.";
    if (!state.trim()) return "Please enter your state.";
    if (!/^\d{6}$/.test(pincode.trim())) return "Enter a valid 6-digit pincode.";
    return null;
  }

  function buildOrderData() {
    return {
      items: cartItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      shippingAddress: form,
      itemsTotal: cartTotal,
      shippingCost: shipping,
      couponCode: appliedCoupon?.code || "",
      discountAmount,
      total: orderTotal,
    };
  }

  async function handleCodOrder(token) {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...buildOrderData(), paymentMethod: "cod" }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Order place nahi ho paya");
    }
  }

  async function handleRazorpayOrder(token) {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) throw new Error("Razorpay load nahi hua, internet check karo");

    const createRes = await fetch("/api/orders/razorpay/create", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        amount: orderTotal,
        itemsTotal: cartTotal,
        shippingCost: shipping,
        couponCode: appliedCoupon?.code || "",
      }),
    });
    if (!createRes.ok) throw new Error("Payment shuru nahi ho paya");
    const razorpayOrder = await createRes.json();

    return new Promise((resolve, reject) => {
      const rzp = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: "INR",
        name: "Shopely",
        description: "Order Payment",
        order_id: razorpayOrder.id,
        prefill: {
          name: form.fullName,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: "#ea580c" },
        handler: async function (response) {
          try {
            const verifyRes = await fetch("/api/orders/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderData: buildOrderData(),
              }),
            });
            if (!verifyRes.ok) throw new Error("Payment verify nahi hua");
            resolve();
          } catch (err) {
            reject(err);
          }
        },
        modal: {
          ondismiss: function () {
            reject(new Error("Payment cancel kar diya gaya"));
          },
        },
      });
      rzp.open();
    });
  }

  async function handlePlaceOrder(e) {
    e.preventDefault();
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }
    setPlacing(true);
    try {
      const token = localStorage.getItem("token");
      if (paymentMethod === "cod") {
        await handleCodOrder(token);
      } else {
        await handleRazorpayOrder(token);
      }
      clearCart();
      toast.success("Order placed successfully! 🎉");
      navigate("/orders");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6">
        <Link to="/cart" className="mb-1 flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700">
          <ArrowLeft size={15} />
          Back to Cart
        </Link>
        <h1 className="text-xl font-bold text-stone-900 sm:text-2xl">Checkout</h1>
      </div>

      <form onSubmit={handlePlaceOrder}>
        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="flex flex-col gap-5 lg:col-span-2">
            <section className="rounded-xl border border-stone-200 bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <MapPin size={16} className="text-orange-600" />
                <h2 className="text-base font-bold text-stone-900">Delivery details</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-stone-500">Full name *</label>
                  <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Rahul Sharma"
                    className="rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-stone-500">Phone number *</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" maxLength={10}
                    className="rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                </div>
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-xs font-medium text-stone-500">Email (optional)</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="rahul@example.com"
                    className="rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                </div>
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-xs font-medium text-stone-500">Address *</label>
                  <input name="address" value={form.address} onChange={handleChange} placeholder="House no., Street, Area"
                    className="rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-stone-500">City *</label>
                  <input name="city" value={form.city} onChange={handleChange} placeholder="Indore"
                    className="rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-stone-500">State *</label>
                  <input name="state" value={form.state} onChange={handleChange} placeholder="Madhya Pradesh"
                    className="rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-stone-500">Pincode *</label>
                  <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="452001" maxLength={6}
                    className="rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-stone-200 bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <CreditCard size={16} className="text-orange-600" />
                <h2 className="text-base font-bold text-stone-900">Payment method</h2>
              </div>
              <div className="flex flex-col gap-3">
                {PAYMENT_METHODS.map((method) => (
                  <label key={method.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-colors ${paymentMethod === method.id ? "border-orange-500 bg-orange-50" : "border-stone-200 hover:border-stone-300"
                      }`}>
                    <input type="radio" name="paymentMethod" value={method.id}
                      checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)}
                      className="mt-0.5 accent-orange-600" />
                    <div>
                      <p className="text-sm font-medium text-stone-800">{method.label}</p>
                      <p className="text-xs text-stone-500">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            <div className="flex items-center gap-2 rounded-lg bg-stone-50 px-4 py-3 text-sm text-stone-600">
              <Truck size={15} className="shrink-0 text-orange-500" />
              <span>Estimated delivery: <strong className="text-stone-800">3–5 business days</strong></span>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-xl border border-stone-200 bg-white p-5">
              <h2 className="text-base font-bold text-stone-900">Order summary</h2>
              <div className="mt-4 flex flex-col gap-3">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-stone-700 text-[10px] font-bold text-white">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex flex-1 items-center justify-between gap-2">
                      <span className="line-clamp-2 text-xs text-stone-700">{item.name}</span>
                      <span className="shrink-0 text-xs font-semibold text-stone-900">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <hr className="my-4 border-stone-200" />

              {/* Coupon */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <Tag size={14} className="shrink-0 text-green-600" />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-green-700">{appliedCoupon.code} applied</p>
                        <p className="text-[11px] text-green-600">You saved {formatCurrency(appliedCoupon.discountAmount)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="shrink-0 rounded-md p-1 text-green-700 hover:bg-green-100"
                      title="Remove coupon"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApplyCoupon())}
                          placeholder="Enter coupon code"
                          className="w-full rounded-md border border-stone-300 py-2 pl-8 pr-3 text-xs font-mono uppercase outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={applyingCoupon || !couponInput.trim()}
                        className="flex items-center gap-1 rounded-md border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700 transition-colors hover:border-orange-500 hover:text-orange-600 disabled:opacity-50"
                      >
                        {applyingCoupon ? <Loader2 size={13} className="animate-spin" /> : "Apply"}
                      </button>
                    </div>
                    {couponError && <p className="mt-1.5 text-[11px] text-red-600">{couponError}</p>}
                  </>
                )}
              </div>

              <hr className="my-4 border-stone-200" />
              <div className="flex flex-col gap-2 text-sm text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal ({cartCount} {cartCount === 1 ? "item" : "items"})</span>
                  <span className="font-medium text-stone-900">{formatCurrency(cartTotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span className="font-medium text-green-600">−{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className={`font-medium ${shipping === 0 ? "text-green-600" : "text-stone-900"}`}>
                    {shipping === 0 ? "Free" : formatCurrency(shipping)}
                  </span>
                </div>
              </div>
              <hr className="my-4 border-stone-200" />
              <div className="flex justify-between text-base font-bold text-stone-900">
                <span>Total</span>
                <span>{formatCurrency(orderTotal)}</span>
              </div>
              <button type="submit" disabled={placing}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-orange-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-70">
                {placing ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Placing order…
                  </>
                ) : (
                  <>
                    <Check size={15} />
                    Place order · {formatCurrency(orderTotal)}
                  </>
                )}
              </button>
              <p className="mt-3 text-center text-xs text-stone-400">
                By placing your order, you agree to our{" "}
                <Link to="/terms" className="underline hover:text-stone-600">Terms & Conditions</Link>
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}