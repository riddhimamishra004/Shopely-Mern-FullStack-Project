import mongoose from "mongoose";

const columnLinkSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true },
  slug:  { type: String, trim: true }, // optional — subcategory/filter target
}, { _id: false });

const columnSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true }, // e.g. "Face", "Top Brands"
  links: [columnLinkSchema],
}, { _id: false });

// ── Real product-taxonomy subcategory (Men's Wear -> T-Shirts, Shirts, ...) ──
// Distinct from `columns` above, which is purely mega-menu marketing links.
// Kept as a subdocument array on Category so a category can have unlimited
// subcategories without a separate collection/join.
const subcategorySchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  slug:     { type: String, required: true, trim: true, lowercase: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const categorySchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  slug:          { type: String, required: true, unique: true, lowercase: true },
  icon:          { type: String, default: "Package" },
  image:         { type: String, default: "" },
  description:   { type: String },
  isActive:      { type: Boolean, default: true },
  order:         { type: Number, default: 0 },   // navbar tab sequence
  columns:       [columnSchema],                  // mega-menu grouped columns
  subcategories: [subcategorySchema],             // product taxonomy (unlimited)
}, { timestamps: true });

export const Category = mongoose.model("Category", categorySchema);