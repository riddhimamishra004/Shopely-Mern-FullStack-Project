import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.Mixed, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String },
});

const shippingSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [orderItemSchema],
  shippingAddress: shippingSchema,
  paymentMethod: { type: String, required: true },
  itemsTotal: { type: Number, required: true },
  shippingCost: { type: Number, default: 0 },
  couponCode: { type: String, default: "" },
  discountAmount: { type: Number, default: 0 },
  // total = itemsTotal + shippingCost - discountAmount (recomputed server-side, see routes/orders.js)
  total: { type: Number, required: true },
  status: { type: String, enum: ["pending", "processing", "shipped", "delivered", "cancelled"], default: "pending" },
  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date },
  deliveredAt: { type: Date },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
}, { timestamps: true });

export const Order = mongoose.model("Order", orderSchema);
