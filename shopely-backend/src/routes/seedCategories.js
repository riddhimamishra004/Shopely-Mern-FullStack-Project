// seedCategories.js
//
// Run this once to populate/refresh sample categories with mega-menu columns,
// similar in structure to the Nykaa-style reference (multiple columns per
// category, each with a title + list of links).
//
// USAGE:
//   1. Adjust the two import paths below to match your project structure.
//   2. Adjust MONGO_URI if you don't use process.env.MONGO_URI.
//   3. From your backend folder:  node seedCategories.js
//
// This UPSERTS by slug — safe to re-run, it won't create duplicate
// categories. NOTE: like `columns`, the `subcategories` array is fully
// overwritten on every run — if you've since added/edited subcategories
// from the admin panel, re-running this script will replace them with
// whatever is hardcoded below.

import mongoose from "mongoose";
import dotenv from "dotenv";
import { Category } from "../models/Category.js"; // adjust path if needed

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/shopely";

// Turns mega-menu columns into a flat, deduped subcategories list
// (name/slug), so categories that already have rich `columns` get
// real product-taxonomy subcategories for free without re-typing them.
function flattenLinksToSubcategories(columns = []) {
  const seen = new Map();
  for (const col of columns) {
    for (const link of col.links || []) {
      if (!link.slug || seen.has(link.slug)) continue;
      seen.set(link.slug, { name: link.label, slug: link.slug, isActive: true });
    }
  }
  return Array.from(seen.values());
}

const categories = [
  {
    name: "For You",
    icon: "Sparkles",
    order: 0,
    columns: [], // no dropdown needed for a personalized feed link
  },

  // ── Explicit example from the spec: Men's Wear / Women's Wear as their
  // own top-level categories, each with real subcategories used by
  // Products (category + subcategory), independent of the mega-menu. ──
  {
    name: "Men's Wear",
    icon: "Shirt",
    order: 1,
    columns: [
      {
        title: "Shop by type",
        links: [
          { label: "T-Shirts", slug: "men-tshirts" },
          { label: "Shirts", slug: "men-shirts" },
          { label: "Jeans", slug: "men-jeans" },
          { label: "Hoodies", slug: "men-hoodies" },
          { label: "Jackets", slug: "men-jackets" },
        ],
      },
    ],
    subcategories: [
      { name: "T-Shirts", slug: "men-tshirts" },
      { name: "Shirts", slug: "men-shirts" },
      { name: "Jeans", slug: "men-jeans" },
      { name: "Hoodies", slug: "men-hoodies" },
      { name: "Jackets", slug: "men-jackets" },
    ],
  },
  {
    name: "Women's Wear",
    icon: "Shirt",
    order: 2,
    columns: [
      {
        title: "Shop by type",
        links: [
          { label: "Sarees", slug: "women-sarees" },
          { label: "Kurtis", slug: "women-kurtis" },
          { label: "Dresses", slug: "women-dresses" },
          { label: "Tops", slug: "women-tops" },
          { label: "Jeans", slug: "women-jeans" },
        ],
      },
    ],
    subcategories: [
      { name: "Sarees", slug: "women-sarees" },
      { name: "Kurtis", slug: "women-kurtis" },
      { name: "Dresses", slug: "women-dresses" },
      { name: "Tops", slug: "women-tops" },
      { name: "Jeans", slug: "women-jeans" },
    ],
  },

  {
    name: "Fashion",
    icon: "Shirt",
    order: 3,
    columns: [
      {
        title: "Men's Wear",
        links: [
          { label: "T-Shirts", slug: "men-tshirts" },
          { label: "Shirts", slug: "men-shirts" },
          { label: "Jeans", slug: "men-jeans" },
          { label: "Jackets", slug: "men-jackets" },
          { label: "Ethnic Wear", slug: "men-ethnic" },
          { label: "Activewear", slug: "men-activewear" },
        ],
      },
      {
        title: "Women's Wear",
        links: [
          { label: "Dresses", slug: "women-dresses" },
          { label: "Tops", slug: "women-tops" },
          { label: "Kurtas & Kurtis", slug: "women-kurtas" },
          { label: "Sarees", slug: "women-sarees" },
          { label: "Jeans & Trousers", slug: "women-jeans" },
          { label: "Ethnic Wear", slug: "women-ethnic" },
        ],
      },
      {
        title: "Girls Wear",
        links: [
          { label: "Dresses", slug: "girls-dresses" },
          { label: "Tops & Tees", slug: "girls-tops" },
          { label: "Ethnic Wear", slug: "girls-ethnic" },
          { label: "Skirts", slug: "girls-skirts" },
        ],
      },
      {
        title: "Boys Wear",
        links: [
          { label: "T-Shirts", slug: "boys-tshirts" },
          { label: "Shirts", slug: "boys-shirts" },
          { label: "Shorts", slug: "boys-shorts" },
          { label: "Ethnic Wear", slug: "boys-ethnic" },
        ],
      },
      {
        title: "Footwear",
        links: [
          { label: "Sneakers", slug: "sneakers" },
          { label: "Sandals", slug: "sandals" },
          { label: "Formal Shoes", slug: "formal-shoes" },
          { label: "Heels", slug: "heels" },
        ],
      },
      {
        title: "Accessories",
        links: [
          { label: "Bags", slug: "bags" },
          { label: "Watches", slug: "watches" },
          { label: "Belts", slug: "belts" },
          { label: "Sunglasses", slug: "sunglasses" },
        ],
      },
    ],
  },

  {
    name: "Beauty",
    icon: "Sparkle",
    order: 4,
    columns: [
      {
        title: "Face",
        links: [
          { label: "Face Primer", slug: "face-primer" },
          { label: "Foundation", slug: "foundation" },
          { label: "Concealer", slug: "concealer" },
          { label: "Compact", slug: "compact" },
          { label: "Blush", slug: "blush" },
          { label: "Highlighter", slug: "highlighter" },
        ],
      },
      {
        title: "Eyes",
        links: [
          { label: "Kajal", slug: "kajal" },
          { label: "Eyeliner", slug: "eyeliner" },
          { label: "Mascara", slug: "mascara" },
          { label: "Eye Shadow", slug: "eye-shadow" },
        ],
      },
      {
        title: "Lips",
        links: [
          { label: "Lipstick", slug: "lipstick" },
          { label: "Lip Gloss", slug: "lip-gloss" },
          { label: "Lip Liner", slug: "lip-liner" },
          { label: "Lip Tint", slug: "lip-tint" },
        ],
      },
      {
        title: "Skin Care",
        links: [
          { label: "Moisturizer", slug: "moisturizer" },
          { label: "Sunscreen", slug: "sunscreen" },
          { label: "Face Wash", slug: "face-wash" },
          { label: "Serum", slug: "serum" },
        ],
      },
    ],
  },

  {
    name: "Electronics",
    icon: "Smartphone",
    order: 5,
    columns: [
      {
        title: "Mobiles & Tablets",
        links: [
          { label: "Smartphones", slug: "smartphones" },
          { label: "Tablets", slug: "tablets" },
          { label: "Mobile Accessories", slug: "mobile-accessories" },
        ],
      },
      {
        title: "Computers",
        links: [
          { label: "Laptops", slug: "laptops" },
          { label: "Monitors", slug: "monitors" },
          { label: "Keyboards & Mice", slug: "keyboards-mice" },
        ],
      },
      {
        title: "Audio",
        links: [
          { label: "Headphones", slug: "headphones" },
          { label: "Bluetooth Speakers", slug: "speakers" },
          { label: "Earbuds", slug: "earbuds" },
        ],
      },
    ],
  },

  {
    name: "Home & Kitchen",
    icon: "Home",
    order: 6,
    columns: [
      {
        title: "Kitchen",
        links: [
          { label: "Cookware", slug: "cookware" },
          { label: "Appliances", slug: "kitchen-appliances" },
          { label: "Storage", slug: "kitchen-storage" },
        ],
      },
      {
        title: "Home Decor",
        links: [
          { label: "Wall Art", slug: "wall-art" },
          { label: "Lighting", slug: "lighting" },
          { label: "Cushions & Covers", slug: "cushions" },
        ],
      },
      {
        title: "Furniture",
        links: [
          { label: "Sofas", slug: "sofas" },
          { label: "Beds", slug: "beds" },
          { label: "Storage Units", slug: "storage-units" },
        ],
      },
    ],
  },

  {
    name: "Books",
    icon: "BookOpen",
    order: 7,
    columns: [
      {
        title: "Fiction",
        links: [
          { label: "Bestsellers", slug: "fiction-bestsellers" },
          { label: "Romance", slug: "romance" },
          { label: "Thriller", slug: "thriller" },
          { label: "Fantasy", slug: "fantasy" },
        ],
      },
      {
        title: "Non-Fiction",
        links: [
          { label: "Biography", slug: "biography" },
          { label: "Self-Help", slug: "self-help" },
          { label: "Business", slug: "business-books" },
        ],
      },
      {
        title: "Kids & Young Adult",
        links: [
          { label: "Picture Books", slug: "picture-books" },
          { label: "Young Adult", slug: "young-adult" },
          { label: "Educational", slug: "educational-books" },
        ],
      },
    ],
  },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  for (const cat of categories) {
    const slug = cat.name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    // Use explicit `subcategories` if given (Men's Wear / Women's Wear above),
    // otherwise derive them from the mega-menu columns so nothing is left empty.
    const subcategories = (cat.subcategories?.length
      ? cat.subcategories
      : flattenLinksToSubcategories(cat.columns)
    ).map((s) => ({ name: s.name, slug: s.slug, isActive: true }));

    const doc = await Category.findOneAndUpdate(
      { slug },
      {
        name: cat.name,
        slug,
        icon: cat.icon,
        order: cat.order,
        columns: cat.columns,
        subcategories,
        isActive: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`✔ ${doc.name} — ${doc.columns.length} columns, ${doc.subcategories.length} subcategories`);
  }

  console.log("\nDone. Categories seeded/updated.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});