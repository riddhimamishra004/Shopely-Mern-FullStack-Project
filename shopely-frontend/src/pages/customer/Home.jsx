import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight, Truck, RotateCcw, ShieldCheck, Mail,
  Flame, Star, ChevronLeft, ChevronRight, Tag, Zap, Gift, Quote,
  TrendingUp, Package, Sparkles, BadgeCheck,
} from "lucide-react";
import axios from "axios";
import ProductCard from "../../components/ecommerce/ProductCard";
import { categories as dummyCategories, dealsEndAt } from "../../data/dummyData";
import { formatCurrency } from "../../utils/formatCrrency";
import { getImageUrl } from "../../utils/getImageUrl";
import { useCategories } from "../../hooks/useCategories";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

function useCountdown(targetIso) {
  const [timeLeft, setTimeLeft] = useState(() => getDiff(targetIso));
  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getDiff(targetIso)), 1000);
    return () => clearInterval(id);
  }, [targetIso]);
  return timeLeft;
}
function getDiff(targetIso) {
  const diff = Math.max(0, new Date(targetIso).getTime() - Date.now());
  return {
    hours: Math.floor(diff / 3600000),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}
const pad = (n) => String(n).padStart(2, "0");

function ScrollRow({ children }) {
  const ref = useRef(null);
  const scroll = (dir) => ref.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  return (
    <div className="relative">
      <div ref={ref} className="flex gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
        {children}
      </div>
      <button onClick={() => scroll(-1)} className="absolute -left-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 shadow-md hover:scale-105 lg:flex">
        <ChevronLeft size={16} />
      </button>
      <button onClick={() => scroll(1)} className="absolute -right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 shadow-md hover:scale-105 lg:flex">
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="w-44 shrink-0 animate-pulse rounded-xl border border-stone-200 bg-white">
      <div className="aspect-square rounded-t-xl bg-stone-200" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-stone-200 rounded" />
        <div className="h-3 bg-stone-100 rounded w-2/3" />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   OFFER CARDS — each can be "image" or "video" backed.
   Replace the `media` URLs below with your real assets
   (put files in /public/media/offers/ and point here).
--------------------------------------------------------- */
const OFFERS = [
  {
    id: 1,
    type: "image",
    media: "https://images.unsplash.com/photo-1607082349566-187342175e2f?q=80&w=1200&auto=format&fit=crop",
    icon: Tag,
    label: "USE CODE: FIRST10",
    title: "10% off your first order",
    desc: "New customers only. Auto-applied at checkout.",
    cta: "Shop now",
    to: "/shop",
  },
  {
    id: 2,
    type: "video",
    media: "https://www.w3schools.com/html/mov_bbb.mp4",
    icon: Zap,
    label: "LIMITED TIME",
    title: "Buy 2, get 1 free",
    desc: "On all skincare & wellness products this week.",
    cta: "View offer",
    to: "/offers",
  },
  {
    id: 3,
    type: "image",
    media: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=1200&auto=format&fit=crop",
    icon: Gift,
    label: "MEMBERS ONLY",
    title: "Free gift on ₹1,999+",
    desc: "Sign in or join free to unlock this perk.",
    cta: "Join free",
    to: "/register",
  },
];

/* ---------------------------------------------------------
   SHOP BY BRAND — dummy data, same pattern as dummyCategories.
   Swap for a real /api/brands call whenever you have one;
   just replace BRANDS with the fetched array (same shape).
--------------------------------------------------------- */
const BRANDS = [
  { id: "b1", name: "Nova Home", slug: "nova-home", color: "1D3557", image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=600&auto=format&fit=crop" },
  { id: "b2", name: "Urban Edge", slug: "urban-edge", color: "3A3A3A", image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=600&auto=format&fit=crop" },
  { id: "b3", name: "Pure Skin", slug: "pure-skin", color: "B5838D", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop" },
  { id: "b4", name: "Kettle & Co.", slug: "kettle-co", color: "9C6644", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&auto=format&fit=crop" },
  { id: "b5", name: "Aether Tech", slug: "aether-tech", color: "2E4374", image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=600&auto=format&fit=crop" },
  { id: "b6", name: "Rootwear", slug: "rootwear", color: "6B4226", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop" },
  { id: "b7", name: "Glow Lab", slug: "glow-lab", color: "C1440E", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop" },
  { id: "b8", name: "Solstice", slug: "solstice", color: "E2A438", image: "https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=600&auto=format&fit=crop" },
  { id: "b9", name: "Craftline", slug: "craftline", color: "4A5D4E", image: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?q=80&w=600&auto=format&fit=crop" },
  { id: "b10", name: "Nimbus", slug: "nimbus", color: "3454A6", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop" },
  { id: "b11", name: "Terra Goods", slug: "terra-goods", color: "2F7A5C", image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=600&auto=format&fit=crop" },
  { id: "b12", name: "Bright Fold", slug: "bright-fold", color: "8A5A9E", image: "https://images.unsplash.com/photo-1585336455962-c7ba912dbf8e?q=80&w=600&auto=format&fit=crop" },
];

const TESTIMONIALS = [
  { id: 1, name: "Priya Mehta", location: "Mumbai", avatar: "PM", rating: 5, product: "Ceramic Non-Stick Pan", text: "Genuinely the best kitchen purchase I've made in years. Arrived in two days, perfectly packed." },
  { id: 2, name: "Rohan Verma", location: "Bengaluru", avatar: "RV", rating: 5, product: "Skincare Trio", text: "I was skeptical ordering skincare online but the product descriptions were so accurate. Returns process was seamless." },
  { id: 3, name: "Sneha Joshi", location: "Pune", avatar: "SJ", rating: 5, product: "Insulated Travel Mug", text: "Coffee stays hot for 6 hours — tested it. Looks premium and fits every cup holder. Great value." },
  { id: 4, name: "Arjun Nair", location: "Chennai", avatar: "AN", rating: 4, product: "Stackable Storage Boxes", text: "Exactly as pictured. Solid build, stack securely. Ordered three sets after the first one." },
];

export default function Home() {
  const { hours, minutes, seconds } = useCountdown(dealsEndAt);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { categories } = useCategories();

  useEffect(() => {
    axios.get(`${API_BASE}/products`)
      .then((res) => {
        const raw = res.data;
        const products = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.products)
            ? raw.products
            : Array.isArray(raw?.data)
              ? raw.data
              : [];
        setAllProducts(products);
      })
      .catch(() => setAllProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const heroShelf = allProducts.slice(0, 6);
  const dealProducts = allProducts.slice(0, 6);
  const bestSellers = allProducts.slice(0, 6);
  const newArrivals = allProducts.slice(0, 6);
  const spotlightProducts = allProducts.slice(6, 11).length ? allProducts.slice(6, 11) : allProducts.slice(0, 5);
  const displayCategories = categories.length ? categories : dummyCategories;

  // Auto-rotate testimonials
  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial((p) => (p + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="bg-[#FAF7F2]">

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-stone-200 bg-[#FAF7F2] pt-10 sm:pt-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 max-w-xl">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500" /> Fresh on the shelf
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="mt-4 text-[2.6rem] font-bold leading-[1.05] tracking-tight text-stone-900 sm:text-6xl">
              Good things,<br />
              <span className="relative inline-block">
                well chosen.
                <svg viewBox="0 0 200 12" className="absolute -bottom-1 left-0 h-3 w-full text-orange-500" preserveAspectRatio="none">
                  <path d="M2 9C40 3 100 1 198 6" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="mt-4 text-stone-600">
              Electronics, fashion, and home goods — sourced for quality, priced honestly. Free delivery on your first order.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-6 flex gap-3">
              <Link to="/shop" className="group inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-colors">
                Browse the shelf <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
              <Link to="/new-arrivals" className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 hover:border-orange-500 hover:text-orange-600 transition-colors">
                New in
              </Link>
            </motion.div>
          </div>

          {/* Hero shelf */}
          <div className="relative mt-10 sm:mt-4">
            <div className="flex gap-5 overflow-x-auto pb-10 pt-6 [&::-webkit-scrollbar]:hidden sm:justify-end" style={{ scrollbarWidth: "none" }}>
              {loading
                ? Array(5).fill(0).map((_, i) => (
                  <div key={i} className="relative shrink-0 w-36 sm:w-44">
                    <div className="aspect-square animate-pulse rounded-xl border-4 border-white bg-stone-200 shadow-lg" />
                  </div>
                ))
                : heroShelf.map((product, i) => (
                  <motion.div key={product._id}
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0, rotate: i % 2 === 0 ? -3 : 3 }}
                    transition={{ duration: 0.5, delay: 0.2 + i * 0.07 }}
                    whileHover={{ rotate: 0, y: -8, scale: 1.04, zIndex: 20 }}
                    className="relative shrink-0" style={{ transformOrigin: "bottom center" }}>
                    <Link to={`/product/${product._id}`} className="block w-36 overflow-hidden rounded-xl border-4 border-white bg-white shadow-lg sm:w-44">
                      <div className="aspect-square overflow-hidden bg-stone-100">
                        <img src={getImageUrl(product.images?.[0])} alt={product.name} className="h-full w-full object-cover" />
                      </div>
                    </Link>
                    <div className="absolute -right-2 -top-2 flex h-12 w-12 rotate-12 items-center justify-center rounded-full border-2 border-white bg-orange-600 text-center shadow-md">
                      <span className="text-[10px] font-bold leading-tight text-white">
                        {product.oldPrice ? `-${Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%` : "New"}
                      </span>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        </div>

        {/* Trust bar */}
        <div className="border-t border-stone-200 bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-5 text-sm text-stone-600 sm:grid-cols-3 sm:px-6 lg:px-8">
            {[{ icon: Truck, label: "Free shipping over ₹999" }, { icon: RotateCcw, label: "7-day easy returns" }, { icon: ShieldCheck, label: "Secure checkout" }].map(({ icon: Icon, label }, i) => (
              <div key={label} className={`flex items-center justify-center gap-2 ${i === 0 ? "sm:justify-start" : i === 2 ? "sm:justify-end" : ""}`}>
                <Icon size={18} className="text-orange-600" /> {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 1 — OFFER CARDS (image + video backgrounds, mixed)
          Fully responsive grid: 1 col mobile → 2 col tablet → 3 col desktop
      ============================================================ */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">Today's picks</p>
            <h2 className="mt-1 text-xl font-bold text-stone-900 sm:text-2xl">Offers for you</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {OFFERS.map((offer, i) => {
              const Icon = offer.icon;
              return (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <Link
                    to={offer.to}
                    className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl transition-transform hover:-translate-y-1 sm:aspect-[5/4]"
                  >
                    {/* media background — image or video */}
                    {offer.type === "video" ? (
                      <video
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        src={offer.media}
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    ) : (
                      <img
                        src={offer.media}
                        alt={offer.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    )}
                    {/* readability overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

                    <div className="relative z-10 p-5">
                      <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
                        <Icon size={11} /> {offer.label}
                      </span>
                      <h3 className="text-lg font-bold leading-tight text-white">{offer.title}</h3>
                      <p className="mt-1.5 text-sm text-white/75">{offer.desc}</p>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white underline-offset-4 group-hover:underline">
                        {offer.cta} <ArrowUpRight size={14} />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 2 — NEW PRODUCT SPOTLIGHT (exclusive products)
          Big feature card + responsive supporting grid
      ============================================================ */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-orange-600">
                <Sparkles size={13} /> Exclusive spotlight
              </p>
              <h2 className="mt-1 text-2xl font-bold text-stone-900">New Product Spotlight</h2>
            </div>
            <Link to="/new-arrivals" className="text-sm font-medium text-orange-600 hover:text-orange-700">View all</Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array(4).fill(0).map((_, i) => <div key={i} className="animate-pulse rounded-2xl bg-stone-200 h-64" />)}
            </div>
          ) : spotlightProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* Feature card — spans full height across 2 rows on large screens */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="group relative min-h-[280px] overflow-hidden rounded-2xl border border-stone-200 bg-stone-900 sm:col-span-2 sm:min-h-[340px] lg:col-span-2 lg:row-span-2"
              >
                <Link to={`/product/${spotlightProducts[0]._id}`} className="absolute inset-0 block">
                  <img
                    src={getImageUrl(spotlightProducts[0].images?.[0])}
                    alt={spotlightProducts[0].name}
                    className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-5 pt-16">
                    <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-orange-600 px-2.5 py-1 text-[11px] font-semibold text-white">
                      <BadgeCheck size={12} /> Exclusive
                    </span>
                    <p className="text-base font-semibold text-white">{spotlightProducts[0].name}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-lg font-bold text-white">{formatCurrency(spotlightProducts[0].price)}</span>
                      {spotlightProducts[0].oldPrice && (
                        <span className="text-sm text-stone-400 line-through">{formatCurrency(spotlightProducts[0].oldPrice)}</span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>

              {/* Supporting products — responsive: 2 cols mobile, wraps into remaining grid space */}
              {spotlightProducts.slice(1).map((product, i) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-stone-400 text-sm">No spotlight products yet.</div>
          )}
        </div>
      </section>

      {/* ============================================================
          SECTION 3 — SHOP BY BRAND
          Responsive grid: 2 cols mobile → 3 tablet → 4 md → 6 desktop
      ============================================================ */}
      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">Trusted names</p>
              <h2 className="mt-1 text-2xl font-bold text-stone-900">Shop by Brand</h2>
            </div>
            <Link to="/shop" className="text-sm font-medium text-orange-600 hover:text-orange-700">View all</Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {BRANDS.map((brand, i) => (
              <motion.div
                key={brand.id}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
              >
                <Link
                  to={`/shop?brand=${brand.slug}`}
                  className="group relative flex aspect-[4/5] flex-col items-center justify-end overflow-hidden rounded-2xl shadow-sm transition-shadow hover:shadow-lg"
                >
                  {/* background photo */}
                  <img
                    src={brand.image}
                    alt={brand.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* readability overlay, deepens on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/5 transition-colors duration-300 group-hover:from-black/90" />

                  <div className="relative z-10 flex flex-col items-center gap-2 p-3 pb-4 text-center">
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/90 text-sm font-bold text-white shadow-md backdrop-blur-sm transition-transform duration-300 group-hover:scale-110"
                      style={{ background: `#${brand.color}CC` }}
                    >
                      {brand.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                    </span>
                    <p className="truncate text-xs font-semibold text-white sm:text-sm">{brand.name}</p>
                    <span className="flex items-center gap-0.5 text-[10px] font-medium text-white/0 transition-all duration-300 group-hover:text-white/90">
                      Shop now <ArrowUpRight size={10} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          SHOP BY CATEGORY — converted from horizontal scroll to a
          proper responsive grid: 2 cols mobile → 3 sm → 4 md → 6 lg
      ============================================================ */}
      <section className="pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-end justify-between">
            <h2 className="text-xl font-bold text-stone-900 sm:text-2xl">Shop by Category</h2>
            <Link to="/shop" className="text-sm font-medium text-orange-600 hover:text-orange-700">View all</Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {displayCategories.map((cat, i) => (
              <motion.div
                key={cat.id || cat._id || cat.slug}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.03 }}
              >
                <Link
                  to={`/shop?category=${cat.slug || cat.id}`}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white"
                >
                  <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-stone-100">
                    {cat.image
                      ? <img src={cat.image} alt={cat.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      : <div className="flex h-full w-full items-center justify-center text-3xl">🛍️</div>
                    }
                  </div>
                  <div className="relative rounded-b-2xl border-x border-b border-dashed border-stone-300 px-3 py-3">
                    <span className="absolute -left-2 -top-3 h-4 w-4 rounded-full bg-[#FAF7F2]" />
                    <span className="absolute -right-2 -top-3 h-4 w-4 rounded-full bg-[#FAF7F2]" />
                    <p className="truncate text-sm font-semibold text-stone-800 group-hover:text-orange-600">{cat.name}</p>
                    <p className="mt-0.5 text-xs text-stone-400">Shop now →</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FLASH DEALS */}
      <section className="bg-stone-900 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
                <Flame size={22} className="text-orange-500" />
              </motion.span>
              <h2 className="text-xl font-bold text-white sm:text-2xl">Today's Deals</h2>
            </div>
            <div className="flex items-center gap-2">
              {[{ value: hours, label: "hrs" }, { value: minutes, label: "min" }, { value: seconds, label: "sec" }].map((u, i) => (
                <div key={u.label} className="flex items-center gap-2">
                  <div className="flex flex-col items-center rounded-lg bg-stone-800 px-3 py-1.5">
                    <AnimatePresence mode="popLayout">
                      <motion.span key={u.value} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.2 }}
                        className="text-base font-bold tabular-nums text-orange-400">{pad(u.value)}</motion.span>
                    </AnimatePresence>
                    <span className="text-[10px] uppercase text-stone-400">{u.label}</span>
                  </div>
                  {i < 2 && <span className="text-stone-500">:</span>}
                </div>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {Array(6).fill(0).map((_, i) => <div key={i} className="animate-pulse rounded-xl bg-stone-800 aspect-square" />)}
            </div>
          ) : dealProducts.length > 0 ? (
            <div className="mt-7 grid gap-5 lg:grid-cols-[1.1fr_2fr]">
              <Link to={`/product/${dealProducts[0]._id}`} className="group relative overflow-hidden rounded-2xl bg-stone-800">
                <div className="aspect-[4/3] overflow-hidden lg:aspect-auto lg:h-full">
                  <img src={getImageUrl(dealProducts[0].images?.[0])} alt={dealProducts[0].name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5">
                  <p className="text-sm font-medium text-stone-200">{dealProducts[0].name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-lg font-bold text-white">{formatCurrency(dealProducts[0].price)}</span>
                    {dealProducts[0].oldPrice && <span className="text-sm text-stone-400 line-through">{formatCurrency(dealProducts[0].oldPrice)}</span>}
                  </div>
                </div>
              </Link>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {dealProducts.slice(1, 7).map((product, i) => (
                  <motion.div key={product._id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="rounded-xl bg-white">
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-10 text-center">
              <Package size={36} className="mx-auto text-stone-600 mb-3" />
              <p className="text-stone-400 text-sm">No products yet.</p>
              <Link to="/shop" className="mt-3 inline-block text-sm text-orange-400 hover:underline">Browse all →</Link>
            </div>
          )}
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-orange-600 flex items-center gap-1">
                <TrendingUp size={13} /> Customer favourites
              </p>
              <h2 className="mt-1 text-2xl font-bold text-stone-900">Best Sellers</h2>
            </div>
            <Link to="/shop" className="text-sm font-medium text-orange-600 hover:text-orange-700">View all</Link>
          </div>

          {loading ? (
            <div className="grid gap-5 lg:grid-cols-3">
              {Array(4).fill(0).map((_, i) => <div key={i} className="animate-pulse rounded-2xl bg-stone-200 h-64" />)}
            </div>
          ) : bestSellers.length > 0 ? (
            <div className="grid gap-5 lg:grid-cols-3">
              {bestSellers[0] && (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }}
                  className="group relative min-h-[280px] overflow-hidden rounded-2xl border border-stone-200 bg-white lg:row-span-2">
                  <Link to={`/product/${bestSellers[0]._id}`} className="absolute inset-0 block">
                    <div className="absolute inset-0 overflow-hidden bg-stone-100">
                      <img src={getImageUrl(bestSellers[0].images?.[0])} alt={bestSellers[0].name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <span className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-stone-900 px-2.5 py-1 text-[11px] font-semibold text-white">
                      <Star size={11} className="fill-amber-400 text-amber-400" /> #1 Best Seller
                    </span>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 pt-14">
                      <p className="font-medium text-white">{bestSellers[0].name}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-lg font-bold text-white">{formatCurrency(bestSellers[0].price)}</span>
                        {bestSellers[0].oldPrice && <span className="text-sm text-stone-300 line-through">{formatCurrency(bestSellers[0].oldPrice)}</span>}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}
              <div className="grid grid-cols-2 gap-4 lg:col-span-2">
                {bestSellers.slice(1).map((product, i) => (
                  <motion.div key={product._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-stone-400 text-sm">No products yet.</div>
          )}
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-bold text-stone-900">Just Landed</h2>
            <Link to="/new-arrivals" className="text-sm font-medium text-orange-600 hover:text-orange-700">View all</Link>
          </div>
          <ScrollRow>
            {loading
              ? Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : newArrivals.length > 0
                ? newArrivals.map((p) => (
                  <div key={p._id} className="w-44 shrink-0 sm:w-52">
                    <ProductCard product={p} />
                  </div>
                ))
                : <p className="text-stone-400 text-sm py-8">No new arrivals yet.</p>
            }
          </ScrollRow>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 bg-[#FAF7F2]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">Real customers</p>
              <h2 className="mt-1 text-2xl font-bold text-stone-900">What people are saying</h2>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setActiveTestimonial((p) => (p - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 shadow-sm hover:border-orange-500 hover:text-orange-600 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setActiveTestimonial((p) => (p + 1) % TESTIMONIALS.length)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 shadow-sm hover:border-orange-500 hover:text-orange-600 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="hidden gap-5 lg:grid lg:grid-cols-4">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.07 }}
                onClick={() => setActiveTestimonial(i)}
                className={`relative flex cursor-pointer flex-col rounded-2xl border p-5 transition-all ${i === activeTestimonial ? "border-orange-400 bg-white shadow-lg shadow-orange-100" : "border-stone-200 bg-white hover:shadow-md"}`}>
                <Quote size={20} className="mb-3 text-orange-200" />
                <p className="flex-1 text-sm leading-relaxed text-stone-700">"{t.text}"</p>
                <div className="mt-4 border-t border-stone-100 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-600 text-xs font-bold text-white">{t.avatar}</div>
                    <div>
                      <p className="text-sm font-semibold text-stone-900">{t.name}</p>
                      <p className="text-xs text-stone-400">{t.location}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} size={12} className={s < t.rating ? "fill-amber-400 text-amber-400" : "text-stone-200"} />
                    ))}
                    <span className="ml-1 text-[11px] text-stone-400">on {t.product}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile */}
          <div className="lg:hidden">
            <AnimatePresence mode="wait">
              <motion.div key={activeTestimonial} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}
                className="rounded-2xl border border-orange-300 bg-white p-6 shadow-lg">
                <Quote size={22} className="mb-3 text-orange-200" />
                <p className="text-sm leading-relaxed text-stone-700">"{TESTIMONIALS[activeTestimonial].text}"</p>
                <div className="mt-5 border-t border-stone-100 pt-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-600 text-sm font-bold text-white">{TESTIMONIALS[activeTestimonial].avatar}</div>
                  <div>
                    <p className="font-semibold text-stone-900">{TESTIMONIALS[activeTestimonial].name}</p>
                    <p className="text-xs text-stone-400">{TESTIMONIALS[activeTestimonial].location}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="mt-4 flex justify-center gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button key={i} onClick={() => setActiveTestimonial(i)}
                  className={`h-1.5 rounded-full transition-all ${i === activeTestimonial ? "w-6 bg-orange-500" : "w-1.5 bg-stone-300"}`} />
              ))}
            </div>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-4 rounded-2xl border border-stone-200 bg-white px-8 py-6">
            {[{ value: "4.9★", label: "Average rating" }, { value: "12,400+", label: "Happy customers" }, { value: "98%", label: "Would recommend" }].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-stone-900 sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-xs text-stone-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-stone-900 py-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-orange-600/10 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-amber-600/10 blur-3xl" />
          <svg className="absolute inset-0 h-full w-full opacity-[0.04]" width="100%" height="100%">
            <defs><pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M 36 0 L 0 0 0 36" fill="none" stroke="white" strokeWidth="1" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <motion.span initial={{ opacity: 0, y: -8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/40 bg-orange-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-orange-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-500" /> New arrivals every week
          </motion.span>

          <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.06 }}
            className="mt-5 text-4xl font-bold leading-tight text-white sm:text-5xl">
            Your home deserves<br /><span className="text-orange-400">better things.</span>
          </motion.h2>

          <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="mx-auto mt-4 max-w-xl text-stone-400">
            From kitchen essentials to wellness finds — quality meets honest pricing. Explore the full catalogue.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.14 }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/shop" className="group inline-flex items-center gap-2 rounded-full bg-orange-600 px-7 py-3.5 text-sm font-semibold text-white hover:bg-orange-500 hover:shadow-lg transition-all">
              Shop the full catalogue <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
            <Link to="/new-arrivals" className="inline-flex items-center gap-2 rounded-full border border-stone-700 px-7 py-3.5 text-sm font-semibold text-stone-300 hover:border-stone-500 hover:text-white transition-all">
              What's new this week
            </Link>
          </motion.div>

          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.22 }}
            className="mt-6 text-xs text-stone-600">
            Trusted by 12,400+ customers · Free returns · No-fuss checkout
          </motion.p>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="relative overflow-hidden bg-orange-600">
        <div className="relative mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white">Stay in the loop</h2>
          <p className="mt-2 text-sm text-orange-50">Get early access to new arrivals and member-only offers.</p>
          <form className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row" onSubmit={(e) => { e.preventDefault(); }}>
            <div className="relative flex-1">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input type="email" placeholder="Enter your email"
                className="w-full rounded-full border-0 bg-white py-2.5 pl-10 pr-4 text-sm text-stone-900 placeholder-stone-400 outline-none ring-2 ring-transparent focus:ring-stone-900" />
            </div>
            <button type="submit" className="rounded-full bg-stone-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}