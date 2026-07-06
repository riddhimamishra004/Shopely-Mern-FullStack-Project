import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tag,
  Zap,
  Gift,
  ArrowUpRight,
  Copy,
  Check,
  Clock,
  ChevronRight,
  Flame,
  Star,
  ShieldCheck,
} from "lucide-react";

import ProductCard from "../../components/ecommerce/ProductCard";
import { featuredProducts } from "../../data/dummyData";
import { formatCurrency } from "../../utils/formatCrrency";

// ── Static offer data ──────────────────────────────────────────────────────────
const OFFERS = [
  {
    id: "first10",
    icon: Tag,
    label: "New Customers",
    badge: "Most Popular",
    code: "FIRST10",
    title: "10% off your first order",
    subtitle: "Welcome aboard — use code at checkout.",
    desc: "Valid on your very first purchase, any category. No minimum order value required. Discount applied automatically when you enter the code at checkout.",
    terms: [
      "One-time use per account",
      "Cannot be combined with other codes",
      "Valid on all categories",
      "No minimum order value",
      "Expires 30 days after account creation",
    ],
    bg: "from-orange-600 to-orange-700",
    accent: "bg-orange-500",
    textAccent: "text-orange-400",
    borderAccent: "border-orange-400",
    cta: "Shop now",
    to: "/shop",
    expiresIn: "30 days after signup",
    savings: "Up to ₹300",
  },
  {
    id: "b2g1",
    icon: Zap,
    label: "Limited Time",
    badge: "This Week Only",
    code: null,
    title: "Buy 2, get 1 free",
    subtitle: "On all skincare & wellness — no code needed.",
    desc: "Add any 3 qualifying items from the Skincare or Wellness categories to your cart. The lowest-priced item will be deducted automatically at checkout.",
    terms: [
      "Applies to Skincare & Wellness only",
      "Lowest-priced item is free",
      "Minimum 3 qualifying items in cart",
      "Cannot be combined with flash deals",
      "Offer valid through Sunday midnight",
    ],
    bg: "from-stone-800 to-stone-900",
    accent: "bg-stone-600",
    textAccent: "text-stone-300",
    borderAccent: "border-stone-500",
    cta: "Shop Skincare",
    to: "/shop?category=wellness",
    expiresIn: "Ends Sunday",
    savings: "Worth ₹999+",
  },
  {
    id: "gift",
    icon: Gift,
    label: "Members Only",
    badge: "Exclusive",
    code: null,
    title: "Free gift on ₹1,999+",
    subtitle: "Sign in or join free — perk unlocks automatically.",
    desc: "Spend ₹1,999 or more in a single order and receive a curated surprise gift worth ₹349. Exclusively for Zestora members. Create a free account to unlock.",
    terms: [
      "Minimum cart value ₹1,999",
      "Logged-in members only",
      "One gift per order",
      "Gift varies by availability",
      "Cannot be exchanged for cash",
    ],
    bg: "from-amber-700 to-amber-800",
    accent: "bg-amber-500",
    textAccent: "text-amber-300",
    borderAccent: "border-amber-500",
    cta: "Join free",
    to: "/register",
    expiresIn: "Ongoing",
    savings: "Gift worth ₹349",
  },
];

const dealProducts = featuredProducts.filter((p) => p.isDeal).slice(0, 4);

// ── Copy-code button ───────────────────────────────────────────────────────────
function CopyCode({ code }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={handleCopy}
      className="group flex items-center gap-2 rounded-xl border-2 border-dashed border-white/40 bg-white/10 px-4 py-2.5 transition-all hover:border-white/70 hover:bg-white/20"
    >
      <span className="font-mono text-base font-bold tracking-widest text-white">
        {code}
      </span>
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Check size={15} className="text-green-300" />
          </motion.span>
        ) : (
          <motion.span key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <Copy size={15} className="text-white/60 group-hover:text-white" />
          </motion.span>
        )}
      </AnimatePresence>
      <span className="text-xs text-white/60 group-hover:text-white/90">
        {copied ? "Copied!" : "Copy"}
      </span>
    </button>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function OffersPage() {
  const [activeOffer, setActiveOffer] = useState(OFFERS[0].id);
  const current = OFFERS.find((o) => o.id === activeOffer);
  const Icon = current.icon;

  return (
    <div className="min-h-screen bg-[#FAF7F2]">

      {/* ── Breadcrumb ── */}
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 px-4 py-3 text-xs text-stone-400 sm:px-6 lg:px-8">
          <Link to="/" className="hover:text-orange-600">Home</Link>
          <ChevronRight size={12} />
          <span className="text-stone-700 font-medium">Offers & Promotions</span>
        </div>
      </div>

      {/* ── Page header ── */}
      <div className="mx-auto max-w-7xl px-4 pb-4 pt-10 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white"
        >
          <Flame size={11} className="text-orange-400" />
          Live deals
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-3 text-3xl font-bold text-stone-900 sm:text-4xl"
        >
          Offers & Promotions
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.09 }}
          className="mt-2 text-stone-500"
        >
          All current offers in one place — click any card to see full details.
        </motion.p>
      </div>

      {/* ── Offer selector tabs ── */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {OFFERS.map((offer, i) => {
            const OfferIcon = offer.icon;
            const isActive = activeOffer === offer.id;
            return (
              <motion.button
                key={offer.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => setActiveOffer(offer.id)}
                className={`relative flex items-start gap-3 overflow-hidden rounded-2xl p-5 text-left transition-all ${
                  isActive
                    ? `bg-gradient-to-br ${offer.bg} shadow-lg`
                    : "border border-stone-200 bg-white hover:border-stone-300 hover:shadow-md"
                }`}
              >
                {/* Decorative circle */}
                <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full ${isActive ? "bg-white/10" : "bg-stone-100"}`} />

                <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isActive ? "bg-white/20" : "bg-stone-100"}`}>
                  <OfferIcon size={18} className={isActive ? "text-white" : "text-orange-600"} />
                </div>
                <div className="relative z-10 flex-1">
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? "text-white/60" : "text-stone-400"}`}>
                    {offer.label}
                  </p>
                  <p className={`mt-0.5 font-bold leading-tight ${isActive ? "text-white" : "text-stone-800"}`}>
                    {offer.title}
                  </p>
                  {offer.badge && (
                    <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${isActive ? "bg-white/20 text-white" : "bg-orange-50 text-orange-600"}`}>
                      {offer.badge}
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Active offer detail ── */}
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeOffer}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid gap-6 lg:grid-cols-[1fr_380px]"
          >
            {/* Left — hero offer card */}
            <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${current.bg} p-8 sm:p-10`}>
              {/* Background decoration */}
              <div className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full bg-white/10" />
              <div className="pointer-events-none absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-white/5" />
              <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]" width="100%" height="100%">
                <defs>
                  <pattern id="offerDots" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1.2" fill="white" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#offerDots)" />
              </svg>

              <div className="relative z-10">
                {/* Icon + label */}
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                    <Icon size={22} className="text-white" />
                  </div>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white">
                    {current.label}
                  </span>
                </div>

                {/* Title */}
                <h2 className="mt-6 text-3xl font-bold leading-tight text-white sm:text-4xl">
                  {current.title}
                </h2>
                <p className="mt-2 text-white/70">{current.subtitle}</p>

                {/* Code copy or auto-label */}
                <div className="mt-6">
                  {current.code ? (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">
                        Your promo code
                      </p>
                      <CopyCode code={current.code} />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 w-fit">
                      <Check size={15} className="text-green-300" />
                      <span className="text-sm font-semibold text-white">
                        No code needed — applied automatically
                      </span>
                    </div>
                  )}
                </div>

                {/* Meta pills */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/80">
                    <Clock size={12} />
                    {current.expiresIn}
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/80">
                    <Star size={12} className="fill-amber-300 text-amber-300" />
                    {current.savings}
                  </div>
                </div>

                {/* Description */}
                <p className="mt-6 leading-relaxed text-white/75">{current.desc}</p>

                {/* CTA */}
                <Link
                  to={current.to}
                  className="group mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-stone-900 transition-all hover:bg-stone-100 hover:shadow-lg"
                >
                  {current.cta}
                  <ArrowUpRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </div>

            {/* Right — terms + other offers */}
            <div className="flex flex-col gap-5">
              {/* Terms & conditions */}
              <div className="rounded-2xl border border-stone-200 bg-white p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck size={16} className="text-orange-600" />
                  <h3 className="font-bold text-stone-900">Terms & Conditions</h3>
                </div>
                <ul className="space-y-2.5">
                  {current.terms.map((term) => (
                    <li key={term} className="flex items-start gap-2.5 text-sm text-stone-600">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                      {term}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Other offers quick-switch */}
              <div className="rounded-2xl border border-stone-200 bg-white p-6">
                <h3 className="mb-4 font-bold text-stone-900">Other active offers</h3>
                <div className="space-y-3">
                  {OFFERS.filter((o) => o.id !== activeOffer).map((offer) => {
                    const OIcon = offer.icon;
                    return (
                      <button
                        key={offer.id}
                        onClick={() => setActiveOffer(offer.id)}
                        className="group flex w-full items-center gap-3 rounded-xl border border-stone-100 p-3 text-left transition-all hover:border-orange-200 hover:bg-orange-50"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-stone-100 group-hover:bg-orange-100">
                          <OIcon size={15} className="text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-semibold text-stone-800 group-hover:text-orange-700">
                            {offer.title}
                          </p>
                          <p className="text-xs text-stone-400">{offer.savings}</p>
                        </div>
                        <ChevronRight size={14} className="text-stone-300 group-hover:text-orange-400" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Featured deals strip ── */}
      {dealProducts.length > 0 && (
        <section className="border-t border-stone-200 bg-white py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">
                  Pair with your offer
                </p>
                <h2 className="mt-1 text-2xl font-bold text-stone-900">Today's top deals</h2>
              </div>
              <Link
                to="/shop"
                className="inline-flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700"
              >
                View all <ArrowUpRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {dealProducts.map((product, i) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Bottom CTA ── */}
      <section className="bg-stone-900 py-12">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-white">
            More savings in the full catalogue
          </h3>
          <p className="mt-2 text-stone-400 text-sm">
            Browse all products and filter by deals to find even more discounts.
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-orange-600 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-orange-500"
          >
            Browse all deals <ArrowUpRight size={15} />
          </Link>
        </div>
      </section>

    </div>
  );
}