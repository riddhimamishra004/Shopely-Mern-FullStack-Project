import { Link } from "react-router-dom";
import { Star, ShoppingCart, Heart } from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../hooks/useWishlist";
import { formatCurrency } from "../../utils/formatCrrency";
import { getImageUrl } from "../../utils/getImageUrl";
export default function ProductCard({ product, view = "grid" }) {
  const image = getImageUrl(product.images?.[0]);
  const { addToCart, cartCount } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const wishlisted = isInWishlist(product._id);

  function handleAddToCart(e) {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    toast.success(`Cart mein ab ${cartCount + 1} items hain 🛒`);
  }

  function handleToggleWishlist(e) {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleWishlist(product);
    if (added) {
      toast.success("Added to wishlist ❤️");
    } else {
      toast("Removed from wishlist 💔");
    }
  }

  const discountPercent = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  if (view === "list") {
    return (
      <Link
        to={`/product/${product._id}`}
        className="group flex gap-4 overflow-hidden rounded-xl border border-stone-200 bg-white p-3 transition-shadow hover:shadow-md"
      >
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg bg-stone-100 sm:h-36 sm:w-36">
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {discountPercent && (
            <span className="absolute left-1.5 top-1.5 rounded-full bg-orange-600 px-2 py-0.5 text-[10px] font-semibold text-white">
              -{discountPercent}%
            </span>
          )}

          {/* Wishlist heart */}
          <button
            onClick={handleToggleWishlist}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm transition-transform duration-200 hover:scale-110 active:scale-95"
          >
            <Heart
              size={14}
              className={
                wishlisted
                  ? "fill-red-500 text-red-500"
                  : "text-stone-500"
              }
            />
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-between py-1">
          <div>
            <h3 className="text-sm font-medium text-stone-800 sm:text-base">{product.name}</h3>
            <div className="mt-1 flex items-center gap-1 text-xs text-stone-500">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-stone-300">&middot;</span>
              <span>{product.reviews} reviews</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-stone-900">
                {formatCurrency(product.price)}
              </span>
              {product.oldPrice && (
                <span className="text-sm text-stone-400 line-through">
                  {formatCurrency(product.oldPrice)}
                </span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              aria-label="Add to cart"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-stone-700 transition-colors hover:bg-orange-600 hover:text-white"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/product/${product._id}`}
      className="group block overflow-hidden rounded-xl border border-stone-200 bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-stone-100">
        <img
          src={image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {discountPercent && (
          <span className="absolute left-2 top-2 rounded-full bg-orange-600 px-2 py-0.5 text-[11px] font-semibold text-white">
            -{discountPercent}%
          </span>
        )}

        {/* Wishlist heart - top right, always visible */}
        <button
          onClick={handleToggleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition-transform duration-200 hover:scale-110 active:scale-95 sm:h-9 sm:w-9"
        >
          <Heart
            size={16}
            className={
              wishlisted
                ? "fill-red-500 text-red-500"
                : "text-stone-500"
            }
          />
        </button>

        {/* Add to cart - bottom right.
            Always visible on mobile (no opacity-0), hidden until hover on sm+ screens. */}
        <button
          onClick={handleAddToCart}
          aria-label="Add to cart"
          className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-stone-700 shadow-md transition-all duration-200 hover:bg-orange-600 hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
        >
          <ShoppingCart size={16} />
        </button>
      </div>

      <div className="p-3">
        <h3 className="truncate text-sm font-medium text-stone-800">{product.name}</h3>

        <div className="mt-1 flex items-center gap-1 text-xs text-stone-500">
          <Star size={13} className="fill-amber-400 text-amber-400" />
          <span>{product.rating}</span>
          <span className="text-stone-300">&middot;</span>
          <span>{product.reviews} reviews</span>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <span className="text-base font-semibold text-stone-900">
            {formatCurrency(product.price)}
          </span>
          {product.oldPrice && (
            <span className="text-sm text-stone-400 line-through">
              {formatCurrency(product.oldPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}