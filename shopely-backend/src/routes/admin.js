import { Router } from "express";
import { User } from "../models/User.js";
import { Product } from "../models/Product.js";
import { Order } from "../models/Order.js";
import { protect, adminOnly } from "../middlewares/auth.js";

const router = Router();

router.get("/stats", protect, adminOnly, async (_req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [totalOrders, totalRevenueAgg, totalUsers, totalProducts,
      monthOrders, lastMonthOrders, monthRevenueAgg, lastMonthRevenueAgg,
      recentOrders, orderStatusCounts, topProducts] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([{ $match: { status: { $ne: "cancelled" } } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
      User.countDocuments({ isAdmin: false }),
      Product.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      Order.aggregate([{ $match: { status: { $ne: "cancelled" }, createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
      Order.aggregate([{ $match: { status: { $ne: "cancelled" }, createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
      Order.find().sort({ createdAt: -1 }).limit(5).populate("user", "name email"),
      Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Order.aggregate([
        { $unwind: "$items" },
        { $group: { _id: "$items.productId", name: { $first: "$items.name" }, sold: { $sum: "$items.quantity" }, revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
        { $sort: { sold: -1 } }, { $limit: 5 },
      ]),
    ]);

    const monthlySales = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" }, createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } },
      { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const salesChart = monthlySales.map(m => ({
      month: months[m._id.month - 1],
      revenue: m.revenue,
      orders: m.orders,
    }));

    const statusMap = {};
    orderStatusCounts.forEach(s => { statusMap[s._id] = s.count; });

    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    const monthRevenue = monthRevenueAgg[0]?.total || 0;
    const lastMonthRevenue = lastMonthRevenueAgg[0]?.total || 0;

    res.json({
      totalOrders, totalRevenue, totalUsers, totalProducts,
      monthOrders, lastMonthOrders, monthRevenue, lastMonthRevenue,
      recentOrders, orderStatusCounts: statusMap, topProducts, salesChart,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
