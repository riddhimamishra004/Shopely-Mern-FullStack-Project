import { Router } from "express";
import { Category } from "../models/Category.js";
import { protect, adminOnly } from "../middlewares/auth.js";

const router = Router();

function slugify(str) {
  return String(str).toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

// ---------- Public: list active categories (Navbar consumes this) ----------
router.get("/", async (_req, res) => {
  try {
    res.json(await Category.find({ isActive: true }).sort({ order: 1, name: 1 }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Admin: list all categories ----------
router.get("/admin", protect, adminOnly, async (_req, res) => {
  try {
    res.json(await Category.find().sort({ order: 1, createdAt: -1 }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Admin: create category ----------
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    // NOTE: earlier this only pulled name/icon/image/description, so
    // "columns" (mega menu) and "order" were silently dropped on create.
    const { name, icon, image, description, order, columns } = req.body;

    if (!name?.trim()) {
      res.status(400).json({ message: "Category name required hai" });
      return;
    }

    const slug = name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    if (await Category.findOne({ slug })) {
      res.status(400).json({ message: "Yeh category already exist karti hai" });
      return;
    }

    const category = await Category.create({
      name,
      slug,
      icon,
      image,
      description,
      order: order ?? 0,
      columns: Array.isArray(columns) ? columns : [],
    });

    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ---------- Admin: update category (name, image, columns, order, isActive...) ----------
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const updates = req.body;

    if (updates.name) {
      updates.slug = updates.name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    }

    // Basic shape-check so a malformed payload from the mega-menu editor
    // doesn't silently corrupt the columns array.
    if (updates.columns && !Array.isArray(updates.columns)) {
      res.status(400).json({ message: "columns must be an array" });
      return;
    }

    const category = await Category.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      res.status(404).json({ message: "Category nahi mili" });
      return;
    }

    res.json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ---------- Admin: update only the mega-menu columns (used by MegaMenuEditor) ----------
router.put("/:id/columns", protect, adminOnly, async (req, res) => {
  try {
    const { columns } = req.body;
    if (!Array.isArray(columns)) {
      res.status(400).json({ message: "columns must be an array" });
      return;
    }
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { columns },
      { new: true, runValidators: true }
    );
    if (!category) {
      res.status(404).json({ message: "Category nahi mili" });
      return;
    }
    res.json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ---------- Admin: delete category ----------
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      res.status(404).json({ message: "Category nahi mili" });
      return;
    }
    res.json({ message: "Category delete ho gayi" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============================================================
// SUBCATEGORIES — unlimited subcategories per category
// (Men's Wear -> T-Shirts, Shirts, Jeans, Hoodies, Jackets ...)
// ============================================================

// ---------- Admin: add a subcategory ----------
router.post("/:id/subcategories", protect, adminOnly, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) {
      res.status(400).json({ message: "Subcategory name required hai" });
      return;
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404).json({ message: "Category nahi mili" });
      return;
    }

    const slug = slugify(name);
    const duplicate = category.subcategories.some((s) => s.slug === slug);
    if (duplicate) {
      res.status(400).json({ message: "Yeh subcategory already exist karti hai" });
      return;
    }

    category.subcategories.push({ name: name.trim(), slug, isActive: true });
    await category.save();

    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ---------- Admin: edit a subcategory (name and/or isActive) ----------
router.put("/:id/subcategories/:subId", protect, adminOnly, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404).json({ message: "Category nahi mili" });
      return;
    }

    const sub = category.subcategories.id(req.params.subId);
    if (!sub) {
      res.status(404).json({ message: "Subcategory nahi mili" });
      return;
    }

    const { name, isActive } = req.body;
    if (name?.trim()) {
      const newSlug = slugify(name);
      const duplicate = category.subcategories.some(
        (s) => s.slug === newSlug && s._id.toString() !== sub._id.toString()
      );
      if (duplicate) {
        res.status(400).json({ message: "Yeh subcategory already exist karti hai" });
        return;
      }
      sub.name = name.trim();
      sub.slug = newSlug;
    }
    if (typeof isActive === "boolean") sub.isActive = isActive;

    await category.save();
    res.json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ---------- Admin: delete a subcategory ----------
router.delete("/:id/subcategories/:subId", protect, adminOnly, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404).json({ message: "Category nahi mili" });
      return;
    }

    const sub = category.subcategories.id(req.params.subId);
    if (!sub) {
      res.status(404).json({ message: "Subcategory nahi mili" });
      return;
    }

    sub.deleteOne();
    await category.save();

    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;