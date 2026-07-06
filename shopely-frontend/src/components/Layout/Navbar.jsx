import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  ChevronDown,
  Menu,
  X,
  LogOut,
  Package,
  LayoutDashboard,
  Sparkles,
  Zap,
  Truck,
  HelpCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../hooks/useWishlist";
import { useCategories } from "../../hooks/useCategories";

/**
 * Renders a category's mega menu as a row of columns, each with a title
 * and a list of links — this is the DB-driven "columns" field on the
 * Category model. Used both inside the "Categories" dropdown panel and
 * inside each per-category hover panel on the icon strip.
 */
function MegaMenuColumns({ columns, onLinkClick, maxWidth = 900, shopAllSlug, shopAllLabel = "Shop All" }) {
  if (!columns || columns.length === 0) {
    return <p className="px-2 py-6 text-center text-sm text-stone-400">Is category ke liye abhi mega menu set nahi hai</p>;
  }
  return (
    <div
      className="grid gap-x-6 gap-y-1 p-5"
      style={{
        gridTemplateColumns: `repeat(${columns.length}, minmax(140px, 1fr))`,
        maxWidth,
      }}
    >
      {columns.map((col, i) => (
        <div key={i} className="min-w-0">
          <p className="mb-2 truncate text-sm font-semibold text-stone-900">{col.title}</p>
          <div className="flex flex-col gap-0.5">
            {i === 0 && shopAllSlug && (
              <button
                onClick={() => onLinkClick(shopAllSlug)}
                className="truncate rounded-md px-1.5 py-1 text-left text-[13px] font-semibold text-orange-600 transition-colors hover:bg-orange-50"
              >
                {shopAllLabel}
              </button>
            )}
            {col.links?.map((link, j) => (
              <button
                key={j}
                onClick={() => onLinkClick(link.slug || link.label)}
                className="truncate rounded-md px-1.5 py-1 text-left text-[13px] text-stone-600 transition-colors hover:bg-orange-50 hover:text-orange-700"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const { cartItems } = useCart();
  const { wishlistCount } = useWishlist();
  const { categories, loading: categoriesLoading } = useCategories();

  // Shared keyframes for dropdown / mega-menu / mobile-panel animations.
  // Defined once here (no tailwind.config changes needed) and reused via
  // the "animate-navFade" / "animate-navSlideDown" classes below.
  const navAnimationStyles = (
    <style>{`
      @keyframes navFadeScale {
        from { opacity: 0; transform: scale(0.98) translateY(-4px); }
        to   { opacity: 1; transform: scale(1) translateY(0); }
      }
      @keyframes navSlideDown {
        from { opacity: 0; transform: translateY(-6px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes navExpand {
        from { opacity: 0; max-height: 0; }
        to   { opacity: 1; max-height: 600px; }
      }
      .animate-navFade { animation: navFadeScale 160ms ease-out; transform-origin: top; }
      .animate-navSlideDown { animation: navSlideDown 180ms ease-out; }
      .animate-navExpand { animation: navExpand 220ms ease-out; overflow: hidden; }
    `}</style>
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [activeMegaCategory, setActiveMegaCategory] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(null);

  // Which icon-strip nav item currently has its mega menu open (slug or null)
  const [openNavMenu, setOpenNavMenu] = useState(null);
  const closeTimer = useRef(null);

  const categoryRef = useRef(null);
  const profileRef = useRef(null);

  const cartCount = cartItems?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (categoryRef.current && !categoryRef.current.contains(e.target)) {
        setCategoryOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
    setCategoryOpen(false);
    setMobileCategoryOpen(null);
    setOpenNavMenu(null);
  }, [location.pathname, location.search]);

  // Reset to the first mega menu column whenever the Categories button reopens
  useEffect(() => {
    if (categoryOpen && categories.length > 0) {
      setActiveMegaCategory(categories[0].slug);
    }
  }, [categoryOpen, categories]);

  // Small delay before closing a nav-strip mega menu so moving the mouse
  // from the trigger down into the panel doesn't close it prematurely.
  function openNavMenuNow(slug) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenNavMenu(slug);
  }
  function scheduleCloseNavMenu() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenNavMenu(null), 150);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileOpen(false);
    }
  }

  function handleCategoryClick(categorySlug) {
    navigate(`/shop?category=${encodeURIComponent(categorySlug)}`);
    setCategoryOpen(false);
    setOpenNavMenu(null);
    setMobileOpen(false);
  }

  function handleLogout() {
    logout();
    setProfileOpen(false);
    navigate("/");
  }

  function isActiveLink(categorySlug) {
    if (location.pathname !== "/shop") return false;
    const currentCategory = new URLSearchParams(location.search).get("category");
    return currentCategory === categorySlug;
  }

  const activeCategoryData =
    categories.find((c) => c.slug === activeMegaCategory) || categories[0];

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur-sm">
      {navAnimationStyles}
      {/* ---------- Utility strip ---------- */}
      <div className="hidden bg-stone-900 text-stone-300 sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-xs sm:px-6 lg:px-8">
          <span className="flex items-center gap-1.5">
            <Truck size={12} /> Free shipping over ₹999 &middot; Demo store, no real payments
          </span>
          <div className="flex items-center gap-4">
            <Link to="/track-order" className="flex items-center gap-1 transition-colors hover:text-white">
              <Package size={12} /> Track Order
            </Link>
            <Link to="/help" className="flex items-center gap-1 transition-colors hover:text-white">
              <HelpCircle size={12} /> Help &amp; FAQ
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-stone-900">
              Shop<span className="text-orange-600">ly</span>
            </span>
          </Link>

          {/* Mega menu trigger - desktop ("Categories" button) */}
          <div className="relative hidden lg:block" ref={categoryRef}>
            <button
              onClick={() => setCategoryOpen((v) => !v)}
              className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100"
              aria-expanded={categoryOpen}
              aria-haspopup="true"
            >
              Categories
              <ChevronDown
                size={16}
                className={`transition-transform ${categoryOpen ? "rotate-180" : ""}`}
              />
            </button>

            {categoryOpen && (
              <div className="absolute left-0 z-50 mt-1 flex max-w-[90vw] origin-top animate-navFade overflow-hidden rounded-lg border border-stone-200 bg-white shadow-xl">
                {categoriesLoading ? (
                  <div className="flex w-[680px] items-center justify-center py-12">
                    <Loader2 size={20} className="animate-spin text-stone-400" />
                  </div>
                ) : categories.length === 0 ? (
                  <div className="w-[680px] py-12 text-center text-sm text-stone-400">
                    No categories yet
                  </div>
                ) : (
                  <>
                    {/* Left rail: top-level categories */}
                    <div className="w-56 shrink-0 border-r border-stone-100 bg-stone-50 py-2">
                      {categories.map((category) => {
                        const Icon = category.IconComponent;
                        const active = activeMegaCategory === category.slug;
                        return (
                          <button
                            key={category.slug}
                            onMouseEnter={() => setActiveMegaCategory(category.slug)}
                            onClick={() => handleCategoryClick(category.slug)}
                            className={`flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm transition-colors ${active
                              ? "bg-white font-medium text-orange-700"
                              : "text-stone-700 hover:bg-white hover:text-orange-700"
                              }`}
                          >
                            <span className="flex items-center gap-2.5">
                              <Icon size={16} strokeWidth={1.75} />
                              {category.name}
                            </span>
                            <ChevronDown size={14} className="-rotate-90 text-stone-300" />
                          </button>
                        );
                      })}
                    </div>

                    {/* Right panel: DB-driven mega-menu columns for the active category */}
                    {activeCategoryData && (
                      <div className="flex flex-1 overflow-x-auto">
                        <MegaMenuColumns
                          columns={activeCategoryData.columns}
                          onLinkClick={handleCategoryClick}
                          maxWidth={720}
                          shopAllSlug={activeCategoryData.slug}
                          shopAllLabel={`Shop all ${activeCategoryData.name}`}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Search bar - desktop */}
          <form onSubmit={handleSearchSubmit} className="hidden flex-1 max-w-md md:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-full border border-stone-300 bg-stone-50 py-2 pl-10 pr-4 text-sm text-stone-900 placeholder-stone-400 outline-none transition-colors focus:border-orange-500 focus:bg-white focus:ring-1 focus:ring-orange-500"
              />
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            </div>
          </form>

          {/* Quick-access pills - desktop */}
          <div className="hidden items-center gap-1 lg:flex">
            <Link
              to="/deals"
              className="flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 transition-colors hover:bg-orange-100"
            >
              <Zap size={13} className="fill-orange-600 text-orange-600" /> Deals
            </Link>
            <Link
              to="/new-arrivals"
              className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-stone-600 transition-colors hover:bg-stone-100"
            >
              <Sparkles size={13} /> New
            </Link>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-1">
            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative rounded-md p-2 text-stone-700 transition-colors hover:bg-stone-100"
              aria-label="Wishlist"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-orange-600 px-1 text-[10px] font-semibold text-white">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative rounded-md p-2 text-stone-700 transition-colors hover:bg-stone-100"
              aria-label="Cart"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span
                  key={cartCount}
                  className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] animate-bounce items-center justify-center rounded-full bg-orange-600 px-1 text-[10px] font-semibold text-white"
                  style={{ animationIterationCount: 1, animationDuration: "400ms" }}
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* Auth area - desktop */}
            {user ? (
              <div className="relative hidden md:block" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-md p-2 text-stone-700 transition-colors hover:bg-stone-100"
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                >
                  <User size={20} />
                  <span className="max-w-[100px] truncate text-sm font-medium">
                    {user.name?.split(" ")[0] || "Account"}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${profileOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {profileOpen && (
                  <div className="absolute z-50 right-0 mt-1 w-48 origin-top-right animate-navFade overflow-hidden rounded-lg border border-stone-200 bg-white py-1 shadow-lg">
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                    >
                      <User size={15} /> Profile
                    </Link>
                    <Link
                      to="/profile/orders"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                    >
                      <Package size={15} /> My Orders
                    </Link>
                    <Link
                      to="/wishlist"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                    >
                      <Heart size={15} /> Wishlist
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                      >
                        <LayoutDashboard size={15} /> Dashboard
                      </Link>
                    )}
                    <hr className="my-1 border-stone-100" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Link
                  to="/login"
                  className="rounded-md px-3 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="rounded-md p-2 text-stone-700 transition-colors hover:bg-stone-100 md:hidden"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Category icon nav - desktop. Each category opens its own mega menu
          (columns fetched from DB) on hover/focus. Hidden whenever the
          Categories button or Profile dropdown is open so nothing overlaps. */}
      {!categoryOpen && !profileOpen && !categoriesLoading && categories.length > 0 && (
        <div className="hidden border-t border-stone-100 bg-white md:block">
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <nav className="flex items-stretch justify-between gap-1">
              {/* Every nav item — including "For You" — now comes from the
                  categories list in DB, so all of them behave identically
                  (hover opens mega menu instantly if columns exist). */}
              {categories.map((category) => {
                const Icon = category.IconComponent;
                const active = isActiveLink(category.slug);
                const hasMegaMenu = category.columns?.length > 0;
                const isOpen = openNavMenu === category.slug;

                return (
                  <div
                    key={category.slug}
                    className="relative flex flex-1 shrink-0"
                    onMouseEnter={() => hasMegaMenu && openNavMenuNow(category.slug)}
                    onMouseLeave={() => hasMegaMenu && scheduleCloseNavMenu()}
                  >
                    <Link
                      to={`/shop?category=${category.slug}`}
                      className={`group relative flex w-full flex-col items-center gap-1.5 px-3.5 py-2.5 transition-colors duration-200 ${active ? "text-stone-900" : "text-stone-600 hover:text-orange-600"
                        }`}
                      onFocus={() => hasMegaMenu && openNavMenuNow(category.slug)}
                    >
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 ${active ? "bg-orange-50" : "group-hover:scale-110 group-hover:bg-orange-50"
                          }`}
                      >
                        <Icon size={20} strokeWidth={1.75} className={active ? "text-orange-600" : ""} />
                      </span>

                      <span className="flex max-w-[72px] items-center gap-0.5 truncate text-xs font-medium leading-none">
                        {category.name}
                        {hasMegaMenu && (
                          <ChevronDown
                            size={11}
                            className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                          />
                        )}
                      </span>

                      <span
                        className={`absolute bottom-0 left-2 right-2 h-[2.5px] origin-left rounded-full bg-orange-600 transition-transform duration-300 ease-out ${active || isOpen ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                          }`}
                      />
                    </Link>

                    {/* Per-item mega menu panel — DB-driven columns, matches the
                        multi-column reference layout (Face / Eyes / Lips / ...) */}
                    {hasMegaMenu && isOpen && (
                      <div
                        className="absolute left-0 top-full z-50 mt-0 max-w-[95vw] origin-top animate-navFade overflow-x-auto overflow-y-hidden rounded-lg border border-stone-200 bg-white shadow-xl"
                        onMouseEnter={() => openNavMenuNow(category.slug)}
                        onMouseLeave={() => scheduleCloseNavMenu()}
                      >
                        <MegaMenuColumns
                          columns={category.columns}
                          onLinkClick={handleCategoryClick}
                          maxWidth={Math.min(category.columns.length * 190, 1000)}
                          shopAllSlug={category.slug}
                          shopAllLabel={`Shop all ${category.name}`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Mobile panel */}
      {mobileOpen && (
        <div className="max-h-[calc(100vh-4rem)] animate-navSlideDown overflow-y-auto border-t border-stone-200 bg-white px-4 pb-4 pt-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="mb-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-full border border-stone-300 bg-stone-50 py-2 pl-10 pr-4 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            </div>
          </form>

          <div className="mb-3 grid grid-cols-2 gap-2">
            <Link
              to="/deals"
              className="flex items-center justify-center gap-1.5 rounded-md bg-orange-50 py-2 text-sm font-semibold text-orange-700"
            >
              <Zap size={14} className="fill-orange-600 text-orange-600" /> Today's Deals
            </Link>
            <Link
              to="/new-arrivals"
              className="flex items-center justify-center gap-1.5 rounded-md bg-stone-100 py-2 text-sm font-semibold text-stone-700"
            >
              <Sparkles size={14} /> New Arrivals
            </Link>
          </div>

          {/* Mobile mega menu: accordion-style. "For You" stays a plain
              link, every backend category expands inline showing its
              DB-driven columns grouped by title. */}
          <div className="mb-3 rounded-lg border border-stone-100">
            {categoriesLoading ? (
              <div className="flex items-center justify-center border-t border-stone-100 py-6">
                <Loader2 size={18} className="animate-spin text-stone-400" />
              </div>
            ) : (
              categories.map((category) => {
                const Icon = category.IconComponent;
                const hasMegaMenu = category.columns?.length > 0;
                const expanded = mobileCategoryOpen === category.slug;

                if (!hasMegaMenu) {
                  return (
                    <Link
                      key={category.slug}
                      to={`/shop?category=${category.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="flex w-full items-center gap-2.5 border-t border-stone-100 px-3 py-2.5 text-left text-sm font-medium text-stone-700"
                    >
                      <Icon size={17} strokeWidth={1.75} />
                      {category.name}
                    </Link>
                  );
                }

                return (
                  <div key={category.slug} className="border-t border-stone-100">
                    <button
                      onClick={() => setMobileCategoryOpen(expanded ? null : category.slug)}
                      className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-medium text-stone-700"
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon size={17} strokeWidth={1.75} />
                        {category.name}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`text-stone-400 transition-transform ${expanded ? "rotate-180" : ""}`}
                      />
                    </button>
                    {expanded && (
                      <div className="flex animate-navExpand flex-col gap-3 px-3 pb-3">
                        {category.columns.map((col, i) => (
                          <div key={i}>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-400">
                              {col.title}
                            </p>
                            <div className="grid grid-cols-2 gap-1">
                              {col.links?.map((link, j) => (
                                <button
                                  key={j}
                                  onClick={() => handleCategoryClick(link.slug || link.label)}
                                  className="rounded-md px-2 py-1.5 text-left text-sm text-stone-600 hover:bg-orange-50 hover:text-orange-700"
                                >
                                  {link.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={() => handleCategoryClick(category.slug)}
                          className="rounded-md bg-orange-50 px-2 py-1.5 text-left text-sm font-medium text-orange-600"
                        >
                          Shop all {category.name}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <hr className="mb-3 border-stone-100" />

          <div className="mb-3 flex flex-col gap-1">
            <Link
              to="/wishlist"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-stone-700 hover:bg-stone-50"
            >
              <Heart size={16} /> Wishlist
              {wishlistCount > 0 && (
                <span className="ml-auto rounded-full bg-orange-100 px-1.5 py-0.5 text-[11px] font-semibold text-orange-700">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link
              to="/track-order"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-stone-700 hover:bg-stone-50"
            >
              <Package size={16} /> Track Order
            </Link>
            <Link
              to="/help"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-stone-700 hover:bg-stone-50"
            >
              <HelpCircle size={16} /> Help &amp; FAQ
            </Link>
          </div>

          <hr className="mb-3 border-stone-100" />

          {user ? (
            <div className="flex flex-col gap-1">
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-stone-700 hover:bg-stone-50"
              >
                <User size={16} /> Profile
              </Link>
              <Link
                to="/profile/orders"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-stone-700 hover:bg-stone-50"
              >
                <Package size={16} /> My Orders
              </Link>
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-stone-700 hover:bg-stone-50"
                >
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex-1 rounded-md border border-stone-300 py-2 text-center text-sm font-medium text-stone-700"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="flex-1 rounded-md bg-orange-600 py-2 text-center text-sm font-medium text-white"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}