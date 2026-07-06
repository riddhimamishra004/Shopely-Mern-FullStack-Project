import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

import ProductCard from "../../components/ecommerce/ProductCard";
import { useProducts } from "../../hooks/useProducts";
import { dealsEndAt } from "../../data/dummyData";

function getTimeLeft() {
  const diff = new Date(dealsEndAt).getTime() - Date.now();
  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n) {
  return String(n).padStart(2, "0");
}

export default function Deals() {
  const { products } = useProducts();
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  const dealProducts = useMemo(() => products.filter((p) => p.isDeal), [products]);

  return (
    <div>
      {/* ---------- Hero / countdown banner ---------- */}
      <section className="bg-gradient-to-r from-orange-600 to-orange-500">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-3 text-white">
              <Flame size={28} className="shrink-0" />
              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">Today's Deals</h1>
                <p className="text-sm text-orange-100">
                  Flash savings on {dealProducts.length} hand-picked products. Ends soon.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {[
                { label: "HRS", value: timeLeft.hours },
                { label: "MIN", value: timeLeft.minutes },
                { label: "SEC", value: timeLeft.seconds },
              ].map((unit) => (
                <div
                  key={unit.label}
                  className="flex w-16 flex-col items-center rounded-lg bg-white/15 py-2 text-white backdrop-blur-sm"
                >
                  <span className="text-xl font-bold tabular-nums">{pad(unit.value)}</span>
                  <span className="text-[10px] font-medium tracking-wide text-orange-100">
                    {unit.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Deals grid ---------- */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {dealProducts.length === 0 ? (
          <p className="py-16 text-center text-stone-500">No active deals right now — check back soon.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {dealProducts.map((product, i) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
