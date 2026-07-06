import { Router } from "express";
import { Coupon } from "../models/Coupon.js";
import { protect, adminOnly } from "../middlewares/auth.js";

const router = Router();

/**
 * Server-side source of truth for "is this coupon usable, and what does
 * it discount?". Used by both the /apply endpoint (checkout page, live
 * preview) AND by routes/orders.js when the order is actually placed —
 * so a tampered discountAmount from the client can never be trusted;
 * it's always recomputed here from the real coupon in the DB.
 */
export async function validateAndComputeDiscount(code, cartTotal) {
  if (!code) return { discountAmount: 0, couponCode: "" };

  const coupon = await Coupon.findOne({ code: String(code).toUpperCase().trim() });
  if (!coupon) {
    const err = new Error("Invalid coupon code");
    err.status = 400;
    throw err;
  }
  if (!coupon.isActive) {
    const err = new Error("Yeh coupon abhi active nahi hai");
    err.status = 400;
    throw err;
  }
  if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
    const err = new Error("Yeh coupon expire ho chuka hai");
    err.status = 400;
    throw err;
  }
  if (cartTotal < (coupon.minPurchase || 0)) {
    const err = new Error(`Is coupon ke liye minimum ₹${coupon.minPurchase} ka order zaroori hai`);
    err.status = 400;
    throw err;
  }

  let discountAmount = coupon.discountType === "percentage"
    ? (cartTotal * coupon.discountValue) / 100
    : coupon.discountValue;

  if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
    discountAmount = coupon.maxDiscount;
  }
  // Never let a fixed coupon push the total below zero.
  if (discountAmount > cartTotal) discountAmount = cartTotal;

  discountAmount = Math.round(discountAmount * 100) / 100;

  return { discountAmount, couponCode: coupon.code, coupon };
}

// ---------- Public: apply/validate a coupon against the current cart total ----------
// (Live preview on the checkout page — doesn't mutate anything.)
router.post("/apply", async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code?.trim()) {
      res.status(400).json({ message: "Coupon code required hai" });
      return;
    }
    const total = Number(cartTotal) || 0;
    const { discountAmount, couponCode, coupon } = await validateAndComputeDiscount(code, total);

    res.json({
      code: couponCode,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      message: `Coupon applied! You saved ₹${discountAmount}`,
    });
  } catch (err) {
    res.status(err.status || 400).json({ message: err.message });
  }
});

// ---------- Admin: list all coupons ----------
router.get("/admin", protect, adminOnly, async (_req, res) => {
  try {
    res.json(await Coupon.find().sort({ createdAt: -1 }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Admin: create coupon ----------
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { code, discountType, discountValue, maxDiscount, minPurchase, expiryDate, isActive } = req.body;

    if (!code?.trim()) { res.status(400).json({ message: "Coupon code required hai" }); return; }
    if (!["percentage", "fixed"].includes(discountType)) { res.status(400).json({ message: "Invalid discount type" }); return; }
    if (discountValue === undefined || Number(discountValue) <= 0) { res.status(400).json({ message: "Valid discount value required hai" }); return; }
    if (!expiryDate) { res.status(400).json({ message: "Expiry date required hai" }); return; }

    const normalizedCode = code.toUpperCase().trim();
    if (await Coupon.findOne({ code: normalizedCode })) {
      res.status(400).json({ message: "Yeh coupon code already exist karta hai" });
      return;
    }

    const coupon = await Coupon.create({
      code: normalizedCode,
      discountType,
      discountValue: Number(discountValue),
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      minPurchase: minPurchase ? Number(minPurchase) : 0,
      expiryDate,
      isActive: isActive ?? true,
    });

    res.status(201).json(coupon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ---------- Admin: update coupon ----------
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.code) updates.code = updates.code.toUpperCase().trim();
    if (updates.discountValue !== undefined) updates.discountValue = Number(updates.discountValue);
    if (updates.minPurchase !== undefined) updates.minPurchase = Number(updates.minPurchase);
    if (updates.maxDiscount !== undefined) updates.maxDiscount = updates.maxDiscount ? Number(updates.maxDiscount) : null;

    if (updates.discountType && !["percentage", "fixed"].includes(updates.discountType)) {
      res.status(400).json({ message: "Invalid discount type" });
      return;
    }

    const coupon = await Coupon.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!coupon) { res.status(404).json({ message: "Coupon nahi mila" }); return; }
    res.json(coupon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ---------- Admin: delete coupon ----------
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) { res.status(404).json({ message: "Coupon nahi mila" }); return; }
    res.json({ message: "Coupon delete ho gaya" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
