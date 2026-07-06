import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, Grid2x2, List, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "../../components/ecommerce/ProductCard";
import { useProducts } from "../../hooks/useProducts";
import { useCategories } from "../../hooks/useCategories";

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest First" },
];

const MAX_PRICE = 50000;
const PAGE_SIZE = 12;

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get("category");
  const urlSearch = searchParams.get("search") || "";

  const [selectedCategories, setSelectedCategories] = useState(urlCategory ? [urlCategory] : []);
  const [priceRange, setPriceRange] = useState([0, MAX_PRICE]);
  const [sortBy, setSortBy] = useState("relevance");
  const [view, setView] = useState("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { categories } = useCategories();
  const { products, loading } = useProducts({
    category: selectedCategories.length === 1 ? selectedCategories[0] : undefined,
    search: urlSearch || undefined,
  });

  useEffect(() => {
    setSelectedCategories(urlCategory ? [urlCategory] : []);
    setPage(1);
  }, [urlCategory]);

  useEffect(() => { setPage(1); }, [selectedCategories, priceRange, sortBy]);

  function toggleCategory(slug) {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    );
  }

  function clearFilters() {
    setSelectedCategories([]);
    setPriceRange([0, MAX_PRICE]);
    setSearchParams({});
  }

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (selectedCategories.length > 1) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    switch (sortBy) {
      case "price-low": result.sort((a, b) => a.price - b.price); break;
      case "price-high": result.sort((a, b) => b.price - a.price); break;
      case "rating": result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case "newest": result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
    }
    return result;
  }, [products, selectedCategories, priceRange, sortBy]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const paginated = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasActiveFilters = selectedCategories.length > 0 || priceRange[1] < MAX_PRICE || urlSearch;

  function Pagination() {
    if (totalPages <= 1) return null;
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return (
      <div className="mt-10 flex items-center justify-center gap-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-300 text-stone-500 disabled:opacity-40 hover:border-orange-500 hover:text-orange-600 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`e${i}`} className="px-1 text-stone-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-semibold transition-colors ${
                p === page
                  ? "border-orange-600 bg-orange-600 text-white"
                  : "border-stone-300 text-stone-700 hover:border-orange-500 hover:text-orange-600"
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-300 text-stone-500 disabled:opacity-40 hover:border-orange-500 hover:text-orange-600 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">
          {urlSearch ? `Results for "${urlSearch}"` : "Shop All Products"}
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          {loading ? "Loading..." : `${filteredProducts.length} product${filteredProducts.length !== 1 ? "s" : ""} found`}
          {totalPages > 1 && ` · Page ${page} of ${totalPages}`}
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <FilterPanel
            categories={categories} selectedCategories={selectedCategories}
            toggleCategory={toggleCategory} priceRange={priceRange}
            setPriceRange={setPriceRange} clearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </aside>

        {/* Main */}
        <div className="flex-1">
          {/* Top bar */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="flex items-center gap-2 rounded-md border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 lg:hidden hover:border-orange-500"
            >
              <SlidersHorizontal size={15} />
              Filters
              {hasActiveFilters && <span className="h-1.5 w-1.5 rounded-full bg-orange-600" />}
            </button>

            <div className="ml-auto flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700 outline-none focus:border-orange-500"
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <div className="hidden items-center gap-1 rounded-md border border-stone-300 p-1 sm:flex">
                <button onClick={() => setView("grid")}
                  className={`rounded p-1.5 ${view === "grid" ? "bg-stone-900 text-white" : "text-stone-500"}`}>
                  <Grid2x2 size={15} />
                </button>
                <button onClick={() => setView("list")}
                  className={`rounded p-1.5 ${view === "list" ? "bg-stone-900 text-white" : "text-stone-500"}`}>
                  <List size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {selectedCategories.map((slug) => {
                const cat = categories.find((c) => c.slug === slug);
                return (
                  <button key={slug} onClick={() => toggleCategory(slug)}
                    className="flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 hover:bg-orange-100">
                    {cat?.name || slug} <X size={12} />
                  </button>
                );
              })}
              {priceRange[1] < MAX_PRICE && (
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
                  Up to ₹{priceRange[1].toLocaleString("en-IN")}
                </span>
              )}
              <button onClick={clearFilters} className="text-xs font-medium text-stone-500 underline hover:text-stone-700">
                Clear all
              </button>
            </div>
          )}

          {/* Product grid */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin text-stone-400" />
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 py-16 text-center">
              <p className="text-stone-500">No products match your filters.</p>
              <button onClick={clearFilters} className="mt-3 text-sm font-medium text-orange-600 hover:text-orange-700">
                Clear filters
              </button>
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {paginated.map((p) => <ProductCard key={p._id} product={p} view="grid" />)}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {paginated.map((p) => <ProductCard key={p._id} product={p} view="list" />)}
            </div>
          )}

          <Pagination />
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-80 max-w-[85vw] overflow-y-auto bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-stone-900">Filters</h2>
              <button onClick={() => setMobileFiltersOpen(false)} className="rounded-md p-1.5 text-stone-500 hover:bg-stone-100">
                <X size={18} />
              </button>
            </div>
            <FilterPanel
              categories={categories} selectedCategories={selectedCategories}
              toggleCategory={toggleCategory} priceRange={priceRange}
              setPriceRange={setPriceRange} clearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />
            <button onClick={() => setMobileFiltersOpen(false)}
              className="mt-6 w-full rounded-md bg-orange-600 py-2.5 text-sm font-semibold text-white hover:bg-orange-700">
              Show {filteredProducts.length} results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterPanel({ categories, selectedCategories, toggleCategory, priceRange, setPriceRange, clearFilters, hasActiveFilters }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-stone-900">Category</h3>
      <div className="mt-3 flex flex-col gap-2.5">
        {categories.map((cat) => (
          <label key={cat.slug} className="flex cursor-pointer items-center gap-2.5 text-sm text-stone-600 hover:text-stone-900">
            <input type="checkbox" checked={selectedCategories.includes(cat.slug)}
              onChange={() => toggleCategory(cat.slug)}
              className="h-4 w-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500" />
            {cat.name}
          </label>
        ))}
      </div>
      <hr className="my-5 border-stone-200" />
      <h3 className="text-sm font-semibold text-stone-900">Price Range</h3>
      <div className="mt-3">
        <input type="range" min={0} max={MAX_PRICE} step={500}
          value={priceRange[1]}
          onChange={(e) => setPriceRange([0, Number(e.target.value)])}
          className="w-full accent-orange-600" />
        <div className="mt-1 flex justify-between text-xs text-stone-500">
          <span>₹0</span>
          <span>₹{priceRange[1].toLocaleString("en-IN")}</span>
        </div>
      </div>
      {hasActiveFilters && (
        <button onClick={clearFilters} className="mt-6 text-sm font-medium text-orange-600 hover:text-orange-700">
          Clear all filters
        </button>
      )}
    </div>
  );
}
