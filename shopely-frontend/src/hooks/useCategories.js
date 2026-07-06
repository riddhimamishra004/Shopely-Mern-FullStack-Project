import { useState, useEffect } from "react";
import axios from "axios";
import * as LucideIcons from "lucide-react";
import { Package } from "lucide-react";

const API_BASE = "/api";

/**
 * Category.icon in the DB is stored as a plain string, e.g. "Shirt", "Smartphone".
 * This resolves that string to the matching lucide-react component at runtime.
 * Falls back to Package if the name doesn't match any icon.
 */
function resolveIcon(iconName) {
  if (iconName && LucideIcons[iconName]) return LucideIcons[iconName];
  return Package;
}

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    axios
      .get(`${API_BASE}/categories`) // public route — only isActive: true categories
      .then((res) => {
        if (cancelled) return;

        const mapped = res.data.map((cat) => ({
          _id: cat._id,
          slug: cat.slug,
          name: cat.name,
          image: cat.image,
          order: cat.order ?? 0,
          IconComponent: resolveIcon(cat.icon),
          // IMPORTANT: this is the mega-menu data — without this line the
          // navbar dropdown has nothing to render even if columns exist in DB.
          columns: Array.isArray(cat.columns) ? cat.columns : [],
          // Product-taxonomy subcategories (Men's Wear -> T-Shirts, Shirts...).
          // Only active ones are relevant on the storefront/admin-product-form side.
          subcategories: Array.isArray(cat.subcategories)
            ? cat.subcategories.filter((s) => s.isActive !== false)
            : [],
        }));

        // Respect the admin-defined order (order field), fall back to name
        mapped.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

        setCategories(mapped);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, loading, error };
}