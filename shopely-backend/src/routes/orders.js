import { Router } from "express";
import crypto from "crypto";
import { Order } from "../models/Order.js";
import { Coupon } from "../models/Coupon.js";
import { validateAndComputeDiscount } from "./coupons.js";
import { protect, adminOnly } from "../middlewares/auth.js";
import { razorpayInstance } from "../config/razorpay.js";

const router = Router();

// Razorpay order create (checkout se pehle call hoga)
router.post("/razorpay/create", protect, async (req, res) => {
  try {
    const { amount, itemsTotal, shippingCost, couponCode } = req.body;

    let payableAmount = amount;

    // When the checkout page sends the cart breakdown, recompute the exact
    // payable amount here instead of trusting the client's `amount` — this
    // is what stops a tampered discount from ever reaching Razorpay.
    if (itemsTotal !== undefined) {
      const { discountAmount } = await validateAndComputeDiscount(couponCode, Number(itemsTotal));
      payableAmount = Number(itemsTotal) + Number(shippingCost || 0) - discountAmount;
    }

    if (!payableAmount || payableAmount <= 0) { res.status(400).json({ message: "Invalid amount" }); return; }

    const razorpayOrder = await razorpayInstance.orders.create({
      amount: Math.round(payableAmount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });
    res.json(razorpayOrder);
  } catch (err) { res.status(err.status || 500).json({ message: err.message }); }
});

// Razorpay payment verify + order save
router.post("/razorpay/verify", protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;
    if (!orderData?.items || orderData.items.length === 0) { res.status(400).json({ message: "Order items khali hai" }); return; }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      res.status(400).json({ message: "Payment verify nahi hua, signature mismatch" });
      return;
    }

    const { discountAmount, couponCode } = await validateAndComputeDiscount(
      orderData.couponCode,
      Number(orderData.itemsTotal) || 0
    );
    const total = Number(orderData.itemsTotal || 0) + Number(orderData.shippingCost || 0) - discountAmount;

    const order = await Order.create({
      user: req.user?._id,
      items: orderData.items,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: "razorpay",
      itemsTotal: orderData.itemsTotal,
      shippingCost: orderData.shippingCost || 0,
      couponCode,
      discountAmount,
      total,
      isPaid: true,
      paidAt: new Date(),
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      status: "pending",
    });

    if (couponCode) {
      await Coupon.updateOne({ code: couponCode }, { $inc: { usageCount: 1 } });
    }

    res.status(201).json(order);
  } catch (err) { res.status(err.status || 400).json({ message: err.message }); }
});

// COD order
router.post("/", protect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, itemsTotal, shippingCost, couponCode: rawCouponCode } = req.body;
    if (!items || items.length === 0) { res.status(400).json({ message: "Order items khali hai" }); return; }

    const { discountAmount, couponCode } = await validateAndComputeDiscount(rawCouponCode, Number(itemsTotal) || 0);
    const total = Number(itemsTotal || 0) + Number(shippingCost || 0) - discountAmount;

    const order = await Order.create({
      user: req.user?._id,
      items,
      shippingAddress,
      paymentMethod,
      itemsTotal,
      shippingCost: shippingCost || 0,
      couponCode,
      discountAmount,
      total,
      status: "pending",
    });

    if (couponCode) {
      await Coupon.updateOne({ code: couponCode }, { $inc: { usageCount: 1 } });
    }

    res.status(201).json(order);
  } catch (err) { res.status(err.status || 400).json({ message: err.message }); }
});

router.get("/myorders", protect, async (req, res) => {
  try { res.json(await Order.find({ user: req.user?._id }).sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const { status, page = "1", limit = "10" } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, parseInt(limit) || 10);
    const skip = (pageNum - 1) * limitNum;
    const [orders, total] = await Promise.all([
      Order.find(filter).populate("user", "name email").sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Order.countDocuments(filter),
    ]);
    res.json({ orders, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) { res.status(404).json({ message: "Order nahi mila" }); return; }
    if (order.user._id.toString() !== req.user?._id && !req.user?.isAdmin) { res.status(403).json({ message: "Access denied" }); return; }
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "processing", "shipped", "delivered", "cancelled"].includes(status)) { res.status(400).json({ message: "Invalid status" }); return; }
    const updates = { status };
    if (status === "delivered") updates.deliveredAt = new Date();
    const order = await Order.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!order) { res.status(404).json({ message: "Order nahi mila" }); return; }
    res.json(order);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put("/:id/cancel", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) { res.status(404).json({ message: "Order nahi mila" }); return; }
    if (order.user.toString() !== req.user?._id && !req.user?.isAdmin) { res.status(403).json({ message: "Access denied" }); return; }
    if (["shipped", "delivered"].includes(order.status)) { res.status(400).json({ message: "Shipped/delivered order cancel nahi ho sakta" }); return; }
    order.status = "cancelled";
    await order.save();
    res.json(order);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

export default router;