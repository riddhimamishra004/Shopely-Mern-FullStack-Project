import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code:          { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType:  { type: String, enum: ["percentage", "fixed"], required: true },
  discountValue: { type: Number, required: true, min: 0 },
  // Optional cap so a "50% off" coupon can't blow past e.g. ₹500 discount.
  maxDiscount:   { type: Number, default: null },
  minPurchase:   { type: Number, default: 0 },
  expiryDate:    { type: Date, required: true },
  isActive:      { type: Boolean, default: true },
  usageCount:    { type: Number, default: 0 },
}, { timestamps: true });

export const Coupon = mongoose.model("Coupon", couponSchema);
