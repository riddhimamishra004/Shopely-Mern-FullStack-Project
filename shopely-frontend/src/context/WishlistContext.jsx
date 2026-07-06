import { createContext, useContext, useState, useEffect } from "react";
// import { getImageUrl } from "../../utils/getImageUrl";
const WishlistContext = createContext(null);

const WISHLIST_STORAGE_KEY = "shopely_wishlist";

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  function isInWishlist(productId) {
    return wishlistItems.some((item) => item.productId === productId);
  }

  function addToWishlist(product) {
    setWishlistItems((prev) => {
      if (prev.some((item) => item.productId === product._id)) return prev;
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          oldPrice: product.oldPrice,
          image: product.images?.[0],
          rating: product.rating,
          reviews: product.reviews,
          stock: product.stock,
          category: product.category,
          addedAt: new Date().toISOString(),
        },
      ];
    });
  }

  function removeFromWishlist(productId) {
    setWishlistItems((prev) => prev.filter((item) => item.productId !== productId));
  }

  function toggleWishlist(product) {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
      return false;
    }
    addToWishlist(product);
    return true;
  }

  function clearWishlist() {
    setWishlistItems([]);
  }

  const value = {
    wishlistItems,
    wishlistCount: wishlistItems.length,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlistContext() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlistContext must be used within a WishlistProvider");
  }
  return context;
}

export default WishlistContext;