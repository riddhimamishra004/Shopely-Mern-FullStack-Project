import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name:    { type: String, required: true },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price:       { type: Number, required: true, min: 0 },
  oldPrice:    { type: Number },
  images:      [{ type: String }],
  category:    { type: String, required: true },
  categoryId:  { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  subcategory:     { type: String, default: "" },       // subcategory NAME, e.g. "T-Shirts"
  subcategorySlug: { type: String, default: "" },       // matches Category.subcategories[].slug
  brand:       { type: String },
  stock:       { type: Number, required: true, default: 0, min: 0 },
  rating:      { type: Number, default: 0 },
  numReviews:  { type: Number, default: 0 },
  reviews:     [reviewSchema],
  isFeatured:  { type: Boolean, default: false },
  isNewArrival:{ type: Boolean, default: false },
  isDeal:      { type: Boolean, default: false },
  discount:    { type: Number, default: 0 },
  tags:        [{ type: String }],

  // ── Naye dynamic fields ──
  sizes:       [{ type: String }],        // e.g. ["S","M","L","XL"]
  colors:      [{ type: String }],        // e.g. ["#1a1a1a","#d97706"]
  highlights:  [{ type: String }],        // product highlight bullets
  offers: {
    upi:   { type: String },              // e.g. "Flat 5% cashback on UPI, up to ₹75"
    bank:  { type: String },              // e.g. "10% instant discount on select cards"
    combo: { type: String },              // e.g. "Buy 2, get extra 5% off"
  },
}, { timestamps: true });

productSchema.index({ name: "text", description: "text", brand: "text" });

export const Product = mongoose.model("Product", productSchema);