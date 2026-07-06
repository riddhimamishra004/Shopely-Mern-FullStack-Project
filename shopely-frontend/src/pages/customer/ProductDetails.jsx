import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getImageUrl } from "../../utils/getImageUrl";
import {
  Star, Minus, Plus, ShoppingCart, Heart, Truck,
  RotateCcw, ShieldCheck, ChevronRight, Loader2,
  Check, Zap, Package, ThumbsUp, User, Tag, CreditCard,
  MapPin, Clock, BadgeCheck, TrendingUp, Sparkles,
} from "lucide-react";
import ProductCard from "../../components/ecommerce/ProductCard";
import { useProduct, useProducts } from "../../hooks/useProducts";
import { useCategories } from "../../hooks/useCategories";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../hooks/useWishlist";
import { formatCurrency } from "../../utils/formatCrrency";

const DUMMY_REVIEWS = [
  { id: 1, name: "Aarav S.", rating: 5, date: "12 Jun 2026", verified: true, comment: "Absolutely love this product! Exactly as described and arrived quickly. Great quality for the price.", tags: ["Great quality", "Fast delivery"] },
  { id: 2, name: "Priya M.", rating: 4, date: "8 Jun 2026", verified: true, comment: "Very good product. Packaging was excellent. Slight delay in delivery but overall happy with the purchase.", tags: ["Good packaging", "Value for money"] },
  { id: 3, name: "Rohit K.", rating: 5, date: "1 Jun 2026", verified: false, comment: "Exceeded expectations. Looks much better in person. Will definitely buy again from this store!", tags: ["As described", "Recommended"] },
];

const SIZES = ["S", "M", "L", "XL", "XXL"];

function StarRow({ rating, size = 14 }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={size} className={s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-stone-200"} />
      ))}
    </span>
  );
}

function RatingBar({ label, pct }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-4 shrink-0 text-right text-xs text-stone-500">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-200">
        <div className="h-full rounded-full bg-amber-400 transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 shrink-0 text-xs text-stone-400">{pct}%</span>
    </div>
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartCount } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeTab, setActiveTab] = useState("description");
  const [pincode, setPincode] = useState("");
  const [pincodeChecked, setPincodeChecked] = useState(false);

  const { product, loading, error } = useProduct(id);
  const { categories } = useCategories();
  const { products: relatedRaw } = useProducts(product ? { category: product.category } : {});

  if (loading) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center">
        <Loader2 size={28} className="animate-spin text-orange-600" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="text-xl font-semibold text-stone-900">Product not found</h1>
        <p className="mt-2 text-sm text-stone-500">This product may have been removed.</p>
        <Link to="/shop" className="mt-5 rounded-full bg-orange-600 px-5 py-2 text-sm font-medium text-white hover:bg-orange-700">
          Back to Shop
        </Link>
      </div>
    );
  }

  const wishlisted = isInWishlist(product._id);
  const category = categories.find((c) => c.slug === product.category);
  const discountPercent = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;
  const inStock = product.stock > 0;
  const allImages = product.images?.length ? product.images : [];
  const activeImg = getImageUrl(allImages[activeImage] || allImages[0]);
  const relatedProducts = relatedRaw.filter((p) => p._id !== product._id).slice(0, 4);
  const reviews = product.reviews?.length ? product.reviews : DUMMY_REVIEWS;
  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const isTrending = product.sold > 50 || product.stock <= 10;

  const colors = product.colors || [];
  const sizes = product.sizes || [];
  const highlights = product.highlights?.length ? product.highlights : (product.features || []);

  function handleQuantityChange(delta) {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > product.stock) return product.stock;
      return next;
    });
  }

  function handleAddToCart() {
    if (sizes.length && !selectedSize) { toast.error("Please select a size"); return; }
    addToCart(product, quantity, { size: selectedSize, color: selectedColor });
    toast.success(`Added to cart! 🛒`);
  }

  function handleBuyNow() {
    if (sizes.length && !selectedSize) { toast.error("Please select a size"); return; }
    addToCart(product, quantity, { size: selectedSize, color: selectedColor });
    navigate("/cart");
  }

  function handleToggleWishlist() {
    const added = toggleWishlist(product);
    toast(added ? "Added to wishlist ❤️" : "Removed from wishlist 💔");
  }

  function handlePincodeCheck() {
    if (!/^\d{6}$/.test(pincode)) { toast.error("6-digit pincode daalo"); return; }
    setPincodeChecked(true);
  }

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 4);
  const deliveryStr = deliveryDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const expressDate = new Date();
  expressDate.setDate(expressDate.getDate() + 1);
  const expressStr = expressDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  return (
    <div className="bg-[#FAF7F2]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap text-xs text-stone-400">
          <Link to="/" className="hover:text-orange-600">Home</Link>
          <ChevronRight size={13} />
          <Link to="/shop" className="hover:text-orange-600">Shop</Link>
          {category && (
            <>
              <ChevronRight size={13} />
              <Link to={`/shop?category=${category.slug}`} className="hover:text-orange-600">{category.name}</Link>
            </>
          )}
          <ChevronRight size={13} />
          <span className="truncate font-medium text-stone-700">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">

          {/* ── LEFT: Image Gallery ── */}
          <div className="flex flex-col gap-3">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-white shadow-sm">
              <img src={activeImg} alt={product.name} className="h-full w-full object-cover transition-all duration-500" />
              {discountPercent && (
                <span className="absolute left-3 top-3 rounded-full bg-orange-600 px-3 py-1 text-xs font-bold text-white">
                  -{discountPercent}% OFF
                </span>
              )}
              {isTrending && (
                <span className="absolute left-3 top-12 flex items-center gap-1 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                  <TrendingUp size={11} /> Trending
                </span>
              )}
              {!inStock && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40">
                  <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-stone-800">Out of Stock</span>
                </div>
              )}
              <button
                onClick={handleToggleWishlist}
                className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition-transform hover:scale-110 active:scale-95"
              >
                <Heart size={18} className={wishlisted ? "fill-red-500 text-red-500" : "text-stone-400"} />
              </button>
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${i === activeImage ? "border-orange-500 ring-1 ring-orange-300" : "border-stone-200 hover:border-stone-400"
                      }`}
                  >
                    <img src={getImageUrl(img)} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Product Highlights — desktop only, under gallery */}
            <div className="hidden rounded-2xl border border-stone-200 bg-white p-5 lg:block">
              <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-stone-900">
                <Sparkles size={15} className="text-orange-500" /> Product Highlights
              </h3>
              <ul className="space-y-2">
                {highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
                    <Check size={14} className="mt-0.5 shrink-0 text-green-500" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── RIGHT: Product Info ── */}
          <div className="flex flex-col">
            {category && (
              <Link to={`/shop?category=${category.slug}`} className="text-xs font-semibold uppercase tracking-widest text-orange-600 hover:underline">
                {category.name}
              </Link>
            )}

            <h1 className="mt-2 text-2xl font-bold text-stone-900 sm:text-3xl">{product.name}</h1>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 rounded-md bg-green-600 px-1.5 py-0.5 text-xs font-bold text-white">
                {avgRating.toFixed(1)} <Star size={10} className="fill-white" />
              </span>
              <span className="text-sm text-stone-400">({reviews.length} reviews)</span>
              {product.sold > 0 && <span className="text-sm text-stone-400">· {product.sold}+ sold</span>}
              {isTrending && (
                <span className="flex items-center gap-1 text-xs font-semibold text-red-500">
                  <TrendingUp size={12} /> Trending now
                </span>
              )}
            </div>

            {/* Price */}
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <span className="text-3xl font-bold text-stone-900">{formatCurrency(product.price)}</span>
              {product.oldPrice && (
                <>
                  <span className="text-lg text-stone-400 line-through">{formatCurrency(product.oldPrice)}</span>
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-sm font-bold text-green-700">
                    {discountPercent}% off
                  </span>
                </>
              )}
            </div>
            {discountPercent && (
              <p className="mt-1 text-sm font-medium text-green-600">
                🎉 {discountPercent}% off applied for you
              </p>
            )}
            <p className="mt-1 text-xs text-stone-400">Inclusive of all taxes</p>

            {/* Offers */}
            <div className="mt-4 rounded-xl border border-dashed border-orange-300 bg-orange-50/60 p-4">
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-stone-800">
                <Tag size={14} className="text-orange-600" /> Available Offers
              </h3>
              <ul className="space-y-1.5 text-xs text-stone-600">
                {product.offers?.upi && (
                  <li className="flex items-start gap-2">
                    <CreditCard size={13} className="mt-0.5 shrink-0 text-orange-500" />
                    <span><strong className="text-stone-800">UPI Offer:</strong> {product.offers.upi}</span>
                  </li>
                )}
                {product.offers?.bank && (
                  <li className="flex items-start gap-2">
                    <Tag size={13} className="mt-0.5 shrink-0 text-orange-500" />
                    <span><strong className="text-stone-800">Bank Offer:</strong> {product.offers.bank}</span>
                  </li>
                )}
                {product.offers?.combo && (
                  <li className="flex items-start gap-2">
                    <Package size={13} className="mt-0.5 shrink-0 text-orange-500" />
                    <span><strong className="text-stone-800">Combo Offer:</strong> {product.offers.combo}</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Color picker */}
            <div className="mt-5">
              <p className="mb-2 text-sm font-semibold text-stone-700">
                Color: <span className="font-normal text-stone-500">{selectedColor || "Select a color"}</span>
              </p>
              <div className="flex gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    title={color}
                    className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${selectedColor === color ? "border-orange-500 ring-2 ring-orange-200" : "border-white shadow-md"
                      }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Size picker */}
            {colors.length > 0 && (
              <div className="mt-5">
                {/* color picker jaisa pehle tha */}
              </div>
            )}

            {sizes.length > 0 && (
              <div className="mt-5">
                {/* size picker jaisa pehle tha */}
              </div>
            )}

            {/* Stock status */}
            <div className="mt-4">
              {inStock ? (
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                    <Check size={11} className="text-white" />
                  </span>
                  <span className="font-medium text-green-600">
                    In Stock
                    {product.stock <= 10 && (
                      <span className="ml-1 font-normal text-orange-500">— only {product.stock} left!</span>
                    )}
                  </span>
                </div>
              ) : (
                <span className="text-sm font-medium text-red-600">Out of Stock</span>
              )}
            </div>

            {/* Delivery / Pincode check */}
            <div className="mt-4 rounded-xl border border-stone-200 bg-white p-4">
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-stone-800">
                <MapPin size={14} className="text-orange-500" /> Delivery Options
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter pincode"
                  className="flex-1 rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
                <button
                  onClick={handlePincodeCheck}
                  className="rounded-md bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-800"
                >
                  Check
                </button>
              </div>
              {pincodeChecked && (
                <p className="mt-2 text-xs font-medium text-green-600">✓ Delivery available at {pincode}</p>
              )}
              <div className="mt-3 space-y-2 border-t border-stone-100 pt-3">
                <div className="flex items-center gap-2 text-sm text-stone-600">
                  <Truck size={14} className="shrink-0 text-orange-500" />
                  <span>Standard delivery by <strong className="text-stone-800">{deliveryStr}</strong> <span className="text-stone-400">(free on ₹999+)</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-stone-600">
                  <Zap size={14} className="shrink-0 text-orange-500" />
                  <span>Express delivery by <strong className="text-stone-800">{expressStr}</strong> <span className="text-stone-400">(extra charges)</span></span>
                </div>
              </div>
            </div>

            {/* Quantity + actions */}
            {inStock && (
              <div className="mt-5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-stone-600">Qty:</span>
                  <div className="flex items-center rounded-lg border border-stone-300 bg-white">
                    <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1} className="flex h-9 w-9 items-center justify-center text-stone-500 disabled:opacity-30 hover:text-stone-800">
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center text-sm font-bold text-stone-900">{quantity}</span>
                    <button onClick={() => handleQuantityChange(1)} disabled={quantity >= product.stock} className="flex h-9 w-9 items-center justify-center text-stone-500 disabled:opacity-30 hover:text-stone-800">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button onClick={handleAddToCart} className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-orange-600 px-6 py-3 text-sm font-bold text-orange-600 transition-colors hover:bg-orange-50">
                    <ShoppingCart size={16} /> Add to Cart
                  </button>
                  <button onClick={handleBuyNow} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-orange-700">
                    <Zap size={16} /> Buy Now
                  </button>
                </div>
              </div>
            )}

            {/* Trust badges */}
            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-stone-200 pt-5 sm:grid-cols-4">
              {[
                { icon: RotateCcw, label: "10 Day Return", sub: "Easy returns" },
                { icon: Package, label: "Cash on Delivery", sub: "Available" },
                { icon: BadgeCheck, label: "Shopely Assured", sub: "Quality checked" },
                { icon: ShieldCheck, label: "Secure Pay", sub: "100% safe" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center gap-1 text-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50">
                    <Icon size={15} className="text-orange-600" />
                  </div>
                  <p className="text-xs font-semibold text-stone-700">{label}</p>
                  <p className="text-[10px] text-stone-400">{sub}</p>
                </div>
              ))}
            </div>

            {/* Product Highlights — mobile, under trust badges */}
            <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 lg:hidden">
              <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-stone-900">
                <Sparkles size={15} className="text-orange-500" /> Product Highlights
              </h3>
              <ul className="space-y-2">
                {highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
                    <Check size={14} className="mt-0.5 shrink-0 text-green-500" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── Tabs: Description / Specs / Reviews ── */}
        <div className="mt-12">
          <div className="flex gap-1 border-b border-stone-200">
            {["description", "specs", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-semibold capitalize transition-colors ${activeTab === tab ? "border-b-2 border-orange-600 text-orange-600" : "text-stone-500 hover:text-stone-800"
                  }`}
              >
                {tab === "reviews" ? `Reviews (${reviews.length})` : tab}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {activeTab === "description" && (
              <div className="max-w-3xl rounded-2xl border border-stone-200 bg-white p-6">
                <p className="leading-relaxed text-stone-600">
                  {product.description || "No description available for this product."}
                </p>
                {product.features?.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {product.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
                        <Check size={15} className="mt-0.5 shrink-0 text-green-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activeTab === "specs" && (
              <div className="max-w-3xl overflow-hidden rounded-2xl border border-stone-200 bg-white">
                {[
                  ["Brand", product.brand || "ShopWave"],
                  ["Category", category?.name || product.category],
                  ["SKU", product._id?.slice(-8).toUpperCase()],
                  ["In Stock", product.stock > 0 ? `${product.stock} units` : "Out of stock"],
                  ["Rating", `${avgRating.toFixed(1)} / 5`],
                  ...(product.specs
                    ? Object.entries(product.specs)
                    : [
                      ["Material", "Premium quality"],
                      ["Weight", "500g"],
                      ["Warranty", "1 Year"],
                      ["Country of Origin", "India"],
                    ]),
                ].map(([key, val], i) => (
                  <div key={key} className={`flex justify-between px-5 py-3 text-sm ${i % 2 === 0 ? "bg-stone-50" : "bg-white"}`}>
                    <span className="font-medium text-stone-600">{key}</span>
                    <span className="text-stone-800">{val}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="max-w-3xl space-y-5">
                {/* Rating summary */}
                <div className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-6 sm:flex-row">
                  <div className="flex shrink-0 flex-col items-center justify-center text-center sm:w-36">
                    <span className="text-5xl font-bold text-stone-900">{avgRating.toFixed(1)}</span>
                    <StarRow rating={avgRating} size={18} />
                    <span className="mt-1 text-xs text-stone-400">{reviews.length} reviews</span>
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviews.filter((r) => Math.round(r.rating) === star).length;
                      const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
                      return <RatingBar key={star} label={star} pct={pct} />;
                    })}
                  </div>
                </div>

                {/* What customers loved */}
                {lovedTags.length > 0 && (
                  <div className="rounded-2xl border border-stone-200 bg-white p-5">
                    <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-stone-800">
                      <ThumbsUp size={14} className="text-orange-500" /> What customers loved
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {lovedTags.map((tag, i) => (
                        <span key={i} className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Individual reviews */}
                {reviews.map((review, i) => (
                  <div key={review.id || i} className="rounded-2xl border border-stone-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">
                          {(review.name || review.user?.name || "U")[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-stone-800">{review.name || review.user?.name || "Anonymous"}</p>
                          <p className="text-xs text-stone-400">{review.date || review.createdAt?.slice(0, 10)}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <StarRow rating={review.rating} size={13} />
                        {review.verified && (
                          <span className="flex items-center gap-1 text-[10px] font-medium text-green-600">
                            <Check size={10} /> Verified Purchase
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-stone-600">{review.comment}</p>
                    <button className="mt-3 flex items-center gap-1.5 text-xs text-stone-400 hover:text-orange-600 transition-colors">
                      <ThumbsUp size={12} /> Helpful
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Similar / Related Products ── */}
        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-stone-900">Similar Products</h2>
              <Link to={`/shop?category=${product.category}`} className="text-sm font-medium text-orange-600 hover:underline">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}