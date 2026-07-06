import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

import { useCart } from "../../hooks/useCart";
import { formatCurrency } from "../../utils/formatCrrency";

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, cartCount, cartTotal, removeFromCart, updateQuantity, clearCart } =
    useCart();

  function handleRemove(productId, name) {
    removeFromCart(productId);
    toast(`${name} cart se hata diya 🗑️`);
  }

  function handleClearCart() {
    clearCart();
    toast("Cart khali kar diya 🧹");
  }

  function handleCheckout() {
    navigate("/checkout");
  }

  // Empty state
  if (cartItems.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-20 text-center sm:py-28">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-stone-100">
          <ShoppingBag size={32} className="text-stone-400" />
        </div>
        <h1 className="mt-5 text-xl font-bold text-stone-900">Your cart is empty</h1>
        <p className="mt-2 text-sm text-stone-500">
          Looks like you haven't added anything yet.
        </p>
        <Link
          to="/shop"
          className="mt-6 rounded-full bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <Link
            to="/shop"
            className="mb-1 flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700"
          >
            <ArrowLeft size={15} />
            Continue Shopping
          </Link>
          <h1 className="text-xl font-bold text-stone-900 sm:text-2xl">
            Your Cart{" "}
            <span className="text-base font-medium text-stone-500">
              ({cartCount} {cartCount === 1 ? "item" : "items"})
            </span>
          </h1>
        </div>

        <button
          onClick={handleClearCart}
          className="shrink-0 rounded-md px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        {/* Items list */}
        <div className="flex flex-col gap-3 lg:col-span-2">
          {cartItems.map((item) => (
            <div
              key={item.productId}
              className="flex gap-3 rounded-xl border border-stone-200 bg-white p-3 sm:gap-4 sm:p-4"
            >
              <Link
                to={`/product/${item.productId}`}
                className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-stone-100 sm:h-24 sm:w-24"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </Link>

              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    to={`/product/${item.productId}`}
                    className="text-sm font-medium text-stone-800 hover:text-orange-600 sm:text-base"
                  >
                    {item.name}
                  </Link>
                  <button
                    onClick={() => handleRemove(item.productId, item.name)}
                    aria-label="Remove item"
                    className="shrink-0 rounded-md p-1.5 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  {/* Quantity stepper */}
                  <div className="flex items-center rounded-md border border-stone-300">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center text-stone-600 disabled:opacity-40"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-stone-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.stock != null && item.quantity >= item.stock}
                      className="flex h-8 w-8 items-center justify-center text-stone-600 disabled:opacity-40"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <span className="text-sm font-semibold text-stone-900 sm:text-base">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 rounded-xl border border-stone-200 bg-white p-5">
            <h2 className="text-base font-bold text-stone-900">Order Summary</h2>

            <div className="mt-4 flex flex-col gap-2 text-sm text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal ({cartCount} {cartCount === 1 ? "item" : "items"})</span>
                <span className="font-medium text-stone-900">
                  {formatCurrency(cartTotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-medium text-green-600">
                  {cartTotal >= 999 ? "Free" : formatCurrency(49)}
                </span>
              </div>
            </div>

            <hr className="my-4 border-stone-200" />

            <div className="flex justify-between text-base font-bold text-stone-900">
              <span>Total</span>
              <span>
                {formatCurrency(cartTotal >= 999 ? cartTotal : cartTotal + 49)}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="mt-5 w-full rounded-md bg-orange-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
            >
              Proceed to Checkout
            </button>

            {cartTotal < 999 && (
              <p className="mt-3 text-center text-xs text-stone-500">
                Add {formatCurrency(999 - cartTotal)} more for free shipping
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}