import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, X, Star } from "lucide-react";
import { getImageUrl } from "../../utils/getImageUrl";
import { useWishlist } from "../../hooks/useWishlist";
import { useCart } from "../../hooks/useCart";
import { formatCurrency } from "../../utils/formatCrrency";

export default function Wishlist() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  function handleMoveToCart(item) {
    addToCart(
      { _id: item.productId, name: item.name, price: item.price, image: item.image, stock: item.stock },
      1
    );
    removeFromWishlist(item.productId);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">My Wishlist</h1>
          <p className="mt-1 text-sm text-stone-500">
            {wishlistItems.length} item{wishlistItems.length !== 1 && "s"} saved
          </p>
        </div>
        <Heart size={28} className="text-orange-600" />
      </div>

      {wishlistItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 px-6 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-stone-400">
            <Heart size={26} />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-stone-900">Your wishlist is empty</h3>
          <p className="mt-1 max-w-sm text-sm text-stone-500">
            Tap the heart icon on any product to save it here for later.
          </p>
          <Link
            to="/shop"
            className="mt-5 rounded-full bg-orange-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-orange-700"
          >
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {wishlistItems.map((item, i) => (
            <motion.div
              key={item.productId}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="group relative overflow-hidden rounded-xl border border-stone-200 bg-white"
            >
              <button
                onClick={() => removeFromWishlist(item.productId)}
                aria-label="Remove from wishlist"
                className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-stone-500 shadow-md transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <X size={14} />
              </button>

              <Link to={`/product/${item.productId}`} className="block aspect-square overflow-hidden bg-stone-100">
                <img
                  src={getImageUrl(item.image)}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </Link>

              <div className="p-3">
                <Link
                  to={`/product/${item.productId}`}
                  className="line-clamp-1 text-sm font-medium text-stone-800 hover:text-orange-600"
                >
                  {item.name}
                </Link>

                {item.rating > 0 && (
                  <div className="mt-1 flex items-center gap-1 text-xs text-stone-500">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    {item.rating}
                  </div>
                )}

                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-base font-semibold text-stone-900">
                    {formatCurrency(item.price)}
                  </span>
                  {item.oldPrice && (
                    <span className="text-xs text-stone-400 line-through">
                      {formatCurrency(item.oldPrice)}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleMoveToCart(item)}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md bg-orange-600 py-2 text-xs font-semibold text-white transition-colors hover:bg-orange-700"
                >
                  <ShoppingCart size={13} /> Add to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
