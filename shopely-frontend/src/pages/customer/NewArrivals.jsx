import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import ProductCard from "../../components/ecommerce/ProductCard";
import { useProducts } from "../../hooks/useProducts";

export default function NewArrivals() {
  const { products } = useProducts();

  const newProducts = useMemo(
    () =>
      products
        .filter((p) => p.isNewArrival)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [products]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-orange-600">
          <Sparkles size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">New Arrivals</h1>
          <p className="mt-0.5 text-sm text-stone-500">
            {newProducts.length} fresh picks, just landed
          </p>
        </div>
      </div>

      {newProducts.length === 0 ? (
        <p className="py-16 text-center text-stone-500">No new arrivals right now — check back soon.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {newProducts.map((product, i) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="relative"
            >
              <span className="absolute right-2 top-2 z-10 rounded-full bg-stone-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                NEW
              </span>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
