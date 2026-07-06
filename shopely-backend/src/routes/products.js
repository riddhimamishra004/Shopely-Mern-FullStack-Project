import { Router } from "express";
import { Product } from "../models/Product.js";
import { upload } from "../middlewares/upload.js";
import { protect, adminOnly } from "../middlewares/auth.js";

const router = Router();

// Helper: safely parse a JSON field from FormData (string) into a JS value
function parseJsonField(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

// GET /api/products
router.get("/", async (req, res) => {
  try {
    const { category, subcategory, search, minPrice, maxPrice, sort = "createdAt", page = "1", limit = "12", featured, newArrival, deal } = req.query;
    const filter = {};
    if (category) filter.category = { $regex: category, $options: "i" };
    if (subcategory) filter.subcategorySlug = { $regex: subcategory, $options: "i" };
    if (search) filter.$text = { $search: search };
    if (minPrice || maxPrice) { filter.price = {}; if (minPrice) filter.price.$gte = Number(minPrice); if (maxPrice) filter.price.$lte = Number(maxPrice); }
    if (featured === "true") filter.isFeatured = true;
    if (newArrival === "true") filter.isNewArrival = true;
    if (deal === "true") filter.isDeal = true;

    const sortMap = { "price-asc": { price: 1 }, "price-desc": { price: -1 }, "rating": { rating: -1 }, "newest": { createdAt: -1 }, "createdAt": { createdAt: -1 } };
    const sortOption = sortMap[sort] || { createdAt: -1 };
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, parseInt(limit) || 12);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortOption).skip(skip).limit(limitNum),
      Product.countDocuments(filter),
    ]);
    res.json({ products, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/products/categories
router.get("/categories", async (_req, res) => {
  try { res.json(await Product.distinct("category")); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/products/admin/all
router.get("/admin/all", protect, adminOnly, async (req, res) => {
  try { res.json(await Product.find().sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) { res.status(404).json({ message: "Product nahi mila" }); return; }
    res.json(product);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/products (admin)
router.post("/", protect, adminOnly, upload.array("images", 5), async (req, res) => {
  try {
    const uploadedUrls = (req.files || []).map((f) => f.path);
    const rawImageUrls = req.body.imageUrls;
    const extraUrls = Array.isArray(rawImageUrls)
      ? rawImageUrls
      : (typeof rawImageUrls === "string" && rawImageUrls.startsWith("[") ? parseJsonField(rawImageUrls, []) : (rawImageUrls ? [rawImageUrls] : []));

    const productData = { ...req.body };
    delete productData.imageUrls;

    productData.images = [...uploadedUrls, ...extraUrls];

    productData.sizes = parseJsonField(req.body.sizes, []);
    productData.colors = parseJsonField(req.body.colors, []);
    productData.highlights = parseJsonField(req.body.highlights, []);
    productData.offers = parseJsonField(req.body.offers, {});

    if (productData.isFeatured) productData.isFeatured = productData.isFeatured === "true";
    if (productData.isNewArrival) productData.isNewArrival = productData.isNewArrival === "true";
    if (productData.isDeal) productData.isDeal = productData.isDeal === "true";
    if (productData.isActive) productData.isActive = productData.isActive === "true";
    if (productData.price) productData.price = Number(productData.price);
    if (productData.oldPrice) productData.oldPrice = Number(productData.oldPrice);
    if (productData.stock) productData.stock = Number(productData.stock);

    res.status(201).json(await Product.create(productData));
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// PUT /api/products/:id (admin)
router.put("/:id", protect, adminOnly, upload.array("images", 5), async (req, res) => {
  try {
    const updateData = { ...req.body };

    const existingImages = parseJsonField(req.body.existingImages, undefined);
    const newUploadedUrls = (req.files || []).map((f) => f.path);
    const rawImageUrls = req.body.imageUrls;
    const newPastedUrls = Array.isArray(rawImageUrls)
      ? rawImageUrls
      : (typeof rawImageUrls === "string" && rawImageUrls.startsWith("[") ? parseJsonField(rawImageUrls, []) : (rawImageUrls ? [rawImageUrls] : []));

    delete updateData.imageUrls;
    delete updateData.existingImages;

    if (existingImages !== undefined || newUploadedUrls.length || newPastedUrls.length) {
      updateData.images = [...(existingImages || []), ...newUploadedUrls, ...newPastedUrls];
    }

    if (req.body.sizes !== undefined) updateData.sizes = parseJsonField(req.body.sizes, []);
    if (req.body.colors !== undefined) updateData.colors = parseJsonField(req.body.colors, []);
    if (req.body.highlights !== undefined) updateData.highlights = parseJsonField(req.body.highlights, []);
    if (req.body.offers !== undefined) updateData.offers = parseJsonField(req.body.offers, {});

    if (updateData.isFeatured) updateData.isFeatured = updateData.isFeatured === "true";
    if (updateData.isNewArrival) updateData.isNewArrival = updateData.isNewArrival === "true";
    if (updateData.isDeal) updateData.isDeal = updateData.isDeal === "true";
    if (updateData.isActive) updateData.isActive = updateData.isActive === "true";
    if (updateData.price) updateData.price = Number(updateData.price);
    if (updateData.oldPrice) updateData.oldPrice = Number(updateData.oldPrice);
    if (updateData.stock) updateData.stock = Number(updateData.stock);

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!product) { res.status(404).json({ message: "Product nahi mila" }); return; }
    res.json(product);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE /api/products/:id (admin)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) { res.status(404).json({ message: "Product nahi mila" }); return; }
    res.json({ message: "Product delete ho gaya" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/products/:id/reviews
router.post("/:id/reviews", protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) { res.status(404).json({ message: "Product nahi mila" }); return; }
    if (product.reviews.find(r => r.user.toString() === req.user?._id)) { res.status(400).json({ message: "Aapne already review diya hai" }); return; }
    product.reviews.push({ user: req.user?._id, name: req.body.name || "User", rating: Number(rating), comment });
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;
    await product.save();
    res.status(201).json({ message: "Review add ho gaya" });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

export default router;